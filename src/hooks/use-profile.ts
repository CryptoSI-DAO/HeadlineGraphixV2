'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

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
  const { isSignedIn, session } = useAuth();
  const [profile, setProfile] = useState<ProfilePreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const mapPayloadToProfile = useCallback(
    (result?: ProfileApiResponse['profile'], warning?: string) => {
      if (!result) {
        return { ...FALLBACK_PROFILE, isFallback: Boolean(warning) };
      }

      return {
        id: result.id ?? undefined,
        name: result.name ?? FALLBACK_PROFILE.name,
        email: result.email ?? FALLBACK_PROFILE.email,
        avatarUrl: result.avatar_url ?? result.avatarUrl ?? null,
        isFallback: Boolean(warning),
      } satisfies ProfilePreview;
    },
    []
  );

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
          headers: session?.access_token
            ? {
                Authorization: `Bearer ${session.access_token}`,
              }
            : undefined,
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

        if (!response.ok) {
          const statusError = new Error(payload?.warning ?? payload?.profile ? 'Profile request fallback' : 'Profile request failed');
          setProfile(mapPayloadToProfile(payload?.profile, payload?.warning));
          setError(statusError);
          return;
        }

        if (!payload?.profile) {
          const missingPayloadError = new Error('Profile response missing data');
          setProfile({ ...FALLBACK_PROFILE });
          setError(missingPayloadError);
          return;
        }

        setProfile(mapPayloadToProfile(payload.profile, payload?.warning));
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
  }, [isSignedIn, mapPayloadToProfile, session?.access_token]);

  const displayProfile = useMemo(() => profile ?? FALLBACK_PROFILE, [profile]);

  const updateProfile = useCallback(
    async (next: { name?: string; email?: string }) => {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(next),
      });

      let payload: ProfileApiResponse | null = null;
      try {
        payload = (await response.json()) as ProfileApiResponse;
      } catch (parseError) {
        console.warn('Unable to parse update profile payload', parseError);
      }

      if (!response.ok) {
        throw new Error(payload?.warning ?? payload?.profile ? 'Profile update fallback' : 'Profile update failed');
      }

      const updated = mapPayloadToProfile(payload?.profile, payload?.warning);
      setProfile(updated);
      setError(null);
      return updated;
    },
    [mapPayloadToProfile, session?.access_token]
  );

  return {
    profile,
    displayProfile,
    isLoading,
    error,
    updateProfile,
  };
}
