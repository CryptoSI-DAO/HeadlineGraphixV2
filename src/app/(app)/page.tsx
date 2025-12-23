'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { useToast } from '@/hooks/use-toast';
import type { UserPreferences } from '@/lib/types';
import { useProfile } from '@/hooks/use-profile';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { useReferenceImages } from '@/hooks/use-reference-images';
import { useAuth } from '@/context/AuthContext';
import { normalizePreferences, sanitizePreferences } from './dashboard/utils';
import {
  ContentPreferencesCard,
  CreditBalanceCard,
  ProfileFieldCard,
  QuickStartCard,
  ReferenceImagePreviewCard,
} from './dashboard/components';

export default function DashboardPage() {
  const { isSignedIn, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { displayProfile, isLoading: isProfileLoading, updateProfile } = useProfile();
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
  const [nameValue, setNameValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSavingEmail, setIsSavingEmail] = useState(false);

  useEffect(() => {
    setLocalPreferences(normalizePreferences(preferences));
  }, [preferences]);

  useEffect(() => {
    setNameValue(displayProfile.name ?? '');
    setEmailValue(displayProfile.email ?? '');
  }, [displayProfile.email, displayProfile.name]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    if (!isSignedIn) {
      router.replace('/login');
    }
  }, [isLoading, isSignedIn, router]);

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

  const handleNameSave = async () => {
    try {
      setIsSavingName(true);
      const updated = await updateProfile({ name: nameValue.trim() });
      setNameValue(updated.name ?? '');
      toast({
        title: 'Name Updated',
        description: 'Your name has been saved.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Unable to update name',
        description: (error as Error).message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingName(false);
    }
  };

  const handleEmailSave = async () => {
    try {
      setIsSavingEmail(true);
      const updated = await updateProfile({ email: emailValue.trim() });
      setEmailValue(updated.email ?? '');
      toast({
        title: 'Email Updated',
        description: 'Your email has been saved.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Unable to update email',
        description: (error as Error).message ?? 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSavingEmail(false);
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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

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
          <ProfileFieldCard
            title="Name"
            label="Profile name"
            value={nameValue}
            placeholder="Enter your name"
            isSaving={isSavingName}
            isDisabled={isProfileLoading}
            onChange={setNameValue}
            onSave={handleNameSave}
          />
          <ProfileFieldCard
            title="Email"
            label="Account email"
            value={emailValue}
            placeholder="Enter your email"
            inputType="email"
            isSaving={isSavingEmail}
            isDisabled={isProfileLoading}
            onChange={setEmailValue}
            onSave={handleEmailSave}
          />
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
