'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import type { UserPreferences } from '@/lib/types';
import { useProfile } from '@/hooks/use-profile';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { useReferenceImages } from '@/hooks/use-reference-images';
import { normalizePreferences, sanitizePreferences } from './dashboard/utils';
import {
  ContentPreferencesCard,
  CreditBalanceCard,
  QuickStartCard,
  ReferenceImagePreviewCard,
} from './dashboard/components';

export default function DashboardPage() {
  const { toast } = useToast();
  const { displayProfile, isLoading: isProfileLoading } = useProfile();
  const {
    preferences,
    isLoading: isPreferencesLoading,
    isSaving: isSavingPreferences,
    savePreferences: saveRemotePreferences,
    error: preferencesError,
  } = useUserPreferences();
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>(
    normalizePreferences(preferences)
  );

  useEffect(() => {
    setLocalPreferences(normalizePreferences(preferences));
  }, [preferences]);

  const handleSave = async () => {
    try {
      const sanitized = sanitizePreferences(localPreferences);
      const updated = await saveRemotePreferences(sanitized);
      setLocalPreferences(normalizePreferences(updated));
      toast({
        title: 'Preferences Saved',
        description: 'Your settings have been updated successfully.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Unable to save preferences',
        description: (error as Error).message ?? 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleTopicChange = (index: number, value: string) => {
    const newTopics = normalizePreferences(localPreferences).focusTopics;
    newTopics[index] = value;
    setLocalPreferences({ ...localPreferences, focusTopics: newTopics });
  };

  const handleBacklinkChange = (index: number, value: string) => {
    const newBacklinks = normalizePreferences(localPreferences).backlinkUrls;
    newBacklinks[index] = value;
    setLocalPreferences({ ...localPreferences, backlinkUrls: newBacklinks });
  };

  const { images: referenceImages, isLoading: isReferenceImagesLoading } = useReferenceImages();
  const imagePreviews = referenceImages.slice(0, 4);

  return (
    <>
      <Header title="Dashboard">
        <span className="hidden text-sm text-muted-foreground md:inline">
          {isProfileLoading ? 'Loading profile...' : `Welcome back, ${displayProfile.name}!`}
        </span>
      </Header>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CreditBalanceCard />
        </div>

        <ContentPreferencesCard
          localPreferences={localPreferences}
          isLoading={isPreferencesLoading}
          isSaving={isSavingPreferences}
          error={preferencesError}
          onSave={handleSave}
          onTopicChange={handleTopicChange}
          onBacklinkChange={handleBacklinkChange}
        />

        <ReferenceImagePreviewCard images={imagePreviews} isLoading={isReferenceImagesLoading} />

        <QuickStartCard />
      </main>
    </>
  );
}
