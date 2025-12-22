'use client';

import { useCallback, useEffect, useState } from 'react';
import type { UserPreferences } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

type PreferencesResponse = UserPreferences & {
  error?: string;
};

const EMPTY_PREFERENCES: UserPreferences = {
  focusTopics: [],
  backlinkUrls: [],
};

export function useUserPreferences() {
  const { session } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(EMPTY_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/preferences', {
        cache: 'no-store',
        headers: session?.access_token
          ? {
              Authorization: `Bearer ${session.access_token}`,
            }
          : undefined,
      });
      if (!response.ok) {
        throw new Error('Failed to load preferences');
      }
      const payload = (await response.json()) as PreferencesResponse;
      setPreferences({
        focusTopics: payload.focusTopics ?? [],
        backlinkUrls: payload.backlinkUrls ?? [],
      });
    } catch (err) {
      console.error('Unable to fetch preferences', err);
      setError((err as Error).message);
      setPreferences(EMPTY_PREFERENCES);
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const savePreferences = useCallback(
    async (next: UserPreferences) => {
      setIsSaving(true);
      setError(null);
      const previous = preferences;
      setPreferences(next);

      try {
        const response = await fetch('/api/preferences', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(session?.access_token
              ? { Authorization: `Bearer ${session.access_token}` }
              : {}),
          },
          body: JSON.stringify(next),
        });

        if (!response.ok) {
          throw new Error('Failed to update preferences');
        }

        const payload = (await response.json()) as PreferencesResponse;
        const updated = {
          focusTopics: payload.focusTopics ?? [],
          backlinkUrls: payload.backlinkUrls ?? [],
        };
        setPreferences(updated);
        return updated;
      } catch (err) {
        console.error('Unable to save preferences', err);
        setError((err as Error).message);
        setPreferences(previous);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [preferences, session?.access_token]
  );

  return {
    preferences,
    isLoading,
    isSaving,
    error,
    refresh: fetchPreferences,
    savePreferences,
  };
}
