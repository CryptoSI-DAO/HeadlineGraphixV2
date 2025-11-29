'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { GeneratedContent, UserPreferences } from '@/lib/types';
import type { ImagePlaceholder } from '@/lib/placeholder-images';
import { MOCK_GENERATED_CONTENT } from '@/lib/mock-data';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface AppContextType {
  history: GeneratedContent[];
  addHistoryItem: (item: Omit<GeneratedContent, 'id' | 'date' | 'type'>) => void;
  deleteHistoryItem: (itemId: string) => void;
  referenceImages: ImagePlaceholder[];
  addReferenceImage: (image: ImagePlaceholder) => void;
  deleteReferenceImage: (imageId: string) => void;
  preferences: UserPreferences;
  savePreferences: (prefs: UserPreferences) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<GeneratedContent[]>(MOCK_GENERATED_CONTENT);
  const [referenceImages, setReferenceImages] = useState<ImagePlaceholder[]>(PlaceHolderImages);
  const [preferences, setPreferences] = useState<UserPreferences>({
    focusTopics: ['AI in Marketing', 'SaaS Growth', 'Content Strategy'],
    backlinkUrls: ['https://blog.hubspot.com', 'https://neilpatel.com/blog', 'https://backlinko.com/blog'],
  });

  const addHistoryItem = (item: Omit<GeneratedContent, 'id' | 'date' | 'type'>) => {
    const newItem: GeneratedContent = {
      ...item,
      id: `gen-${Date.now()}`,
      date: new Date(),
      type: 'Content Pack',
    };
    setHistory((prev) => [newItem, ...prev]);
  };

  const deleteHistoryItem = (itemId: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== itemId));
  };

  const addReferenceImage = (image: ImagePlaceholder) => {
    setReferenceImages((prev) => [image, ...prev]);
  };

  const deleteReferenceImage = (imageId: string) => {
    setReferenceImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const savePreferences = (prefs: UserPreferences) => {
    setPreferences(prefs);
  };

  const value = {
    history,
    addHistoryItem,
    deleteHistoryItem,
    referenceImages,
    addReferenceImage,
    deleteReferenceImage,
    preferences,
    savePreferences,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
