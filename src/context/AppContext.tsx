'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { GeneratedContent, UserPreferences } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

interface AppContextType {
  history: GeneratedContent[];
  addHistoryItem: (item: Omit<GeneratedContent, 'id' | 'date' | 'type'>) => Promise<boolean>;
  deleteHistoryItem: (itemId: string) => Promise<boolean>;
  preferences: UserPreferences;
  savePreferences: (prefs: UserPreferences) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

type ContentPackResponse = {
  id: string;
  headline: string;
  config: GeneratedContent['config'];
  drafts: GeneratedContent['drafts'];
  generated_at: string;
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { session, isSignedIn, isLoading: isAuthLoading } = useAuth();
  const [history, setHistory] = useState<GeneratedContent[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    focusTopics: ['AI in Marketing', 'SaaS Growth', 'Content Strategy'],
    backlinkUrls: ['https://blog.hubspot.com', 'https://neilpatel.com/blog', 'https://backlinko.com/blog'],
  });

  const mapContentPack = useCallback((item: ContentPackResponse): GeneratedContent => {
    const config = item.config ?? { brandTone: '', referenceImage: '', userAngle: '' };
    const drafts = item.drafts ?? { blogPost: '', linkedInPost: '', infographic: '' };
    return {
      id: item.id,
      headline: item.headline,
      type: 'Content Pack',
      config: {
        brandTone: String(config.brandTone ?? ''),
        referenceImage: String(config.referenceImage ?? ''),
        userAngle: String(config.userAngle ?? ''),
      },
      drafts: {
        blogPost: String(drafts.blogPost ?? ''),
        linkedInPost: String(drafts.linkedInPost ?? ''),
        infographic: String(drafts.infographic ?? ''),
      },
      date: new Date(item.generated_at),
    };
  }, []);

  const fetchHistory = useCallback(async () => {
    if (!session?.access_token) {
      setHistory([]);
      return;
    }
    try {
      const response = await fetch('/api/content-packs', {
        cache: 'no-store',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Unable to load content packs');
      }
      const payload = (await response.json()) as { items?: ContentPackResponse[] };
      const items = payload.items ?? [];
      setHistory(items.map(mapContentPack));
    } catch (error) {
      console.error('Failed to fetch content packs', error);
      setHistory([]);
    }
  }, [mapContentPack, session?.access_token]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }
    if (!isSignedIn) {
      setHistory([]);
      return;
    }
    fetchHistory();
  }, [fetchHistory, isAuthLoading, isSignedIn]);

  const addHistoryItem = useCallback(
    async (item: Omit<GeneratedContent, 'id' | 'date' | 'type'>) => {
      if (!session?.access_token) {
        console.warn('Cannot save content pack without an authenticated session.');
        return false;
      }
      try {
        const response = await fetch('/api/content-packs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            headline: item.headline,
            config: item.config,
            drafts: item.drafts,
          }),
        });
        if (!response.ok) {
          throw new Error('Unable to save content pack');
        }
        const payload = (await response.json()) as { item?: ContentPackResponse };
        if (payload.item) {
          setHistory((prev) => {
            const next = [mapContentPack(payload.item), ...prev];
            return next.slice(0, 10);
          });
        }
        return true;
      } catch (error) {
        console.error('Failed to save content pack', error);
        return false;
      }
    },
    [mapContentPack, session?.access_token]
  );

  const deleteHistoryItem = useCallback(
    async (itemId: string) => {
      if (!session?.access_token) {
        console.warn('Cannot delete content pack without an authenticated session.');
        return false;
      }
      try {
        const response = await fetch(`/api/content-packs/${itemId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Unable to delete content pack');
        }
        setHistory((prev) => prev.filter((item) => item.id !== itemId));
        return true;
      } catch (error) {
        console.error('Failed to delete content pack', error);
        return false;
      }
    },
    [session?.access_token]
  );

  const savePreferences = useCallback((prefs: UserPreferences) => {
    setPreferences(prefs);
  }, []);

  const value = useMemo(
    () => ({
    history,
    addHistoryItem,
    deleteHistoryItem,
    preferences,
    savePreferences,
    }),
    [addHistoryItem, deleteHistoryItem, history, preferences, savePreferences]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
