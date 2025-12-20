'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDemoAuth } from '@/context/DemoAuthContext';

type ProfileApiResponse = {
  profile?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    avatar_url?: string | null;
    avatarUrl?: string | null;
  };
  warning?: string;
};

export type ProfilePreview = {
  id?: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  isFallback?: boolean;
};

export const FALLBACK_PROFILE: ProfilePreview = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  avatarUrl: null,
  isFallback: true,
};

export function useProfile() {
  const { isSignedIn } = useDemoAuth();
  const [profile, setProfile] = useState<ProfilePreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    if (!isSignedIn) {
      setProfile(null);
      setError(null);
      setIsLoading(false);
      return () => {
        isMounted = false;
        controller.abort();
      };
    }

    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile', {
          signal: controller.signal,
          cache: 'no-store',
        });

        let payload: ProfileApiResponse | null = null;
        try {
          payload = (await response.json()) as ProfileApiResponse;
        } catch (parseError) {
          console.warn('Unable to parse profile payload', parseError);
        }

        if (payload?.warning) {
          console.warn(payload.warning);
        }

        if (!isMounted) {
          return;
        }

        const mapPayloadToProfile = (result?: ProfileApiResponse['profile']) => {
          if (!result) {
            return { ...FALLBACK_PROFILE };
          }

          return {
            id: result.id ?? undefined,
            name: result.name ?? FALLBACK_PROFILE.name,
            email: result.email ?? FALLBACK_PROFILE.email,
            avatarUrl: result.avatar_url ?? result.avatarUrl ?? null,
            isFallback: Boolean(payload?.warning),
          } satisfies ProfilePreview;
        };

        if (!response.ok) {
          const statusError = new Error(payload?.warning ?? payload?.profile ? 'Profile request fallback' : 'Profile request failed');
          setProfile(mapPayloadToProfile(payload?.profile));
          setError(statusError);
          return;
        }

        if (!payload?.profile) {
          const missingPayloadError = new Error('Profile response missing data');
          setProfile({ ...FALLBACK_PROFILE });
          setError(missingPayloadError);
          return;
        }

        setProfile(mapPayloadToProfile(payload.profile));
        setError(null);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          return;
        }
        console.error('Unable to load profile', err);
        if (isMounted) {
          setProfile({ ...FALLBACK_PROFILE });
          setError(err as Error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    fetchProfile();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isSignedIn]);

  const displayProfile = useMemo(() => profile ?? FALLBACK_PROFILE, [profile]);

  return {
    profile,
    displayProfile,
    isLoading,
    error,
  };
}
