'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import type { HeadlineGroup } from '@/lib/news';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { useBrandKits } from '@/hooks/use-brand-kits';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DEFAULT_NEWS_PROVIDER,
  NEWS_PROVIDER_META_MAP,
  type NewsProviderId,
  isValidNewsProvider,
} from '@/lib/news/providers';
import {
  HeadlineGroupSection,
  LoadingSkeleton,
  ProviderCard,
  TopicSummaryCard,
} from './components';

export default function HeadlinesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [headlineGroups, setHeadlineGroups] = useState<HeadlineGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<NewsProviderId>(DEFAULT_NEWS_PROVIDER);
  const { preferences, isLoading: isPreferencesLoading } = useUserPreferences();
  const { presets: brandPresets } = useBrandKits();
  const [selectedBrandId, setSelectedBrandId] = useState<string>('default');

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('hg:news-provider') : null;
    const migrated =
      typeof window !== 'undefined' ? window.localStorage.getItem('hg:news-provider-migrated') : null;
    if (isValidNewsProvider(stored)) {
      if (!migrated && stored === 'google-news') {
        window.localStorage.setItem('hg:news-provider', DEFAULT_NEWS_PROVIDER);
        window.localStorage.setItem('hg:news-provider-migrated', 'true');
        setProvider(DEFAULT_NEWS_PROVIDER);
      } else {
        setProvider(stored);
      }
    } else {
      setProvider(DEFAULT_NEWS_PROVIDER);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hg:news-provider', provider);
    }
  }, [provider]);

  // Determine which topics to use: selected brand's topics, or user-level fallback
  const selectedBrand = brandPresets.find(b => b.id === selectedBrandId);
  const effectiveTopics = (selectedBrand?.focusTopics?.length ?? 0) > 0
    ? selectedBrand!.focusTopics.filter(Boolean)
    : preferences.focusTopics;

  useEffect(() => {
    if (isPreferencesLoading) return;

    const controller = new AbortController();

    async function loadHeadlines() {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      const topicsToUse = selectedBrand?.focusTopics?.length
        ? selectedBrand.focusTopics.filter(Boolean)
        : preferences.focusTopics;

      if (topicsToUse.length > 0) {
        params.set('topics', topicsToUse.join(','));
      }
      params.set('provider', provider);

      try {
        const endpoint = `/api/headlines${params.size ? `?${params.toString()}` : ''}`;
        const response = await fetch(endpoint, {
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch headlines');
        }

        const payload = (await response.json()) as { groups?: HeadlineGroup[] };
        setHeadlineGroups(payload.groups ?? []);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Unable to load headlines', err);
        setError('Unable to fetch the latest headlines. Please try again.');
        setHeadlineGroups([]);
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadHeadlines();
    return () => controller.abort();
  }, [effectiveTopics.join(','), isPreferencesLoading, provider]);

  const providerMeta = useMemo(() => NEWS_PROVIDER_META_MAP[provider], [provider]);
  const topicSummary = useMemo(() => {
    if (isPreferencesLoading) {
      return 'Loading topics...';
    }
    if (selectedBrand && selectedBrand.focusTopics?.length) {
      return `${selectedBrand.name}: ${selectedBrand.focusTopics.filter(Boolean).join(', ')}`;
    }
    if (effectiveTopics.length > 0) {
      return `Based on topics: ${effectiveTopics.join(', ')}`;
    }
    return 'Based on your default topics';
  }, [isPreferencesLoading, effectiveTopics, selectedBrand]);

  return (
    <>
      <Header title="Latest Headlines" />
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <TopicSummaryCard summary={topicSummary} />
          <div className="flex flex-col gap-3">
            {brandPresets.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Brand:</span>
                <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default topics</SelectItem>
                    {brandPresets.map(brand => (
                      <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <ProviderCard provider={provider} onChange={setProvider} meta={providerMeta} />
          </div>
        </div>
        {error && (
          <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingSkeleton key={index} />
            ))}
          </div>
        ) : headlineGroups.length > 0 ? (
          <div className="space-y-6">
            {headlineGroups.map(group => (
              <HeadlineGroupSection key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No headlines found</CardTitle>
              <CardDescription>
                We couldn&apos;t find any articles for your current topics. Try updating your focus areas or refreshing.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="secondary">
                <Link href="/">Update Preferences</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </main>
    </>
  );
}
