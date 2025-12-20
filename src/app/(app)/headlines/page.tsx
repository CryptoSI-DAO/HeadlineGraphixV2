
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Header } from '@/components/Header';
import type { Headline } from '@/lib/types';
import type { HeadlineGroup } from '@/lib/news';
import { Calendar, Globe, ImageIcon, Sparkles } from 'lucide-react';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DEFAULT_NEWS_PROVIDER,
  NEWS_PROVIDER_META_MAP,
  NEWS_PROVIDER_OPTIONS,
  type NewsProviderId,
  isValidNewsProvider,
} from '@/lib/news/providers';

const formatHeadlineDate = (date: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date));
  } catch {
    return date;
  }
};

const HeadlineCard = ({ headline }: { headline: Headline }) => (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>{headline.title}</CardTitle>
        <CardDescription className="flex items-center gap-4 pt-2">
            <span className="flex items-center gap-1.5"><Globe size={14}/> {headline.source}</span>
            <span className="flex items-center gap-1.5"><Calendar size={14}/> {formatHeadlineDate(headline.date)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {headline.content ? (
          <p className="text-sm text-muted-foreground line-clamp-4">{headline.content}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No summary available.</p>
        )}
      </CardContent>
  <CardFooter className="flex flex-col gap-2 items-stretch">
        <Button asChild variant="outline">
          <a href={headline.url} target="_blank" rel="noopener noreferrer">
            View Article
          </a>
        </Button>
        <Button asChild>
            <Link href={`/studio/${headline.slug}`}>
                <Sparkles /> Generate Content
            </Link>
        </Button>
        <Button asChild variant="secondary">
             <Link href="/generate-image">
                <ImageIcon /> Generate Image
            </Link>
        </Button>
      </CardFooter>
    </Card>
);

const LoadingSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent className="h-10" />
      <CardFooter className="flex flex-col gap-2 items-stretch">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
);

const HeadlineGroupSection = ({ group }: { group: HeadlineGroup }) => (
  <section className="rounded-xl border border-muted/50 bg-card/40 p-4 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-3">
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">Featured Topics</p>
        <p className="text-base font-semibold">{group.label}</p>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{group.topics.join(', ')}</span>
    </div>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {group.headlines.map(headline => (
        <HeadlineCard key={headline.id} headline={headline} />
      ))}
    </div>
  </section>
);

export default function HeadlinesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [headlineGroups, setHeadlineGroups] = useState<HeadlineGroup[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<NewsProviderId>(DEFAULT_NEWS_PROVIDER);
  const { preferences, isLoading: isPreferencesLoading } = useUserPreferences();

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('hg:news-provider') : null;
    if (isValidNewsProvider(stored)) {
      setProvider(stored);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('hg:news-provider', provider);
    }
  }, [provider]);

  useEffect(() => {
    if (isPreferencesLoading) return;

    const controller = new AbortController();

    async function loadHeadlines() {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (preferences.focusTopics.length > 0) {
        params.set('topics', preferences.focusTopics.join(','));
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
  }, [preferences.focusTopics, isPreferencesLoading, provider]);

  const providerMeta = useMemo(() => NEWS_PROVIDER_META_MAP[provider], [provider]);
  const topicSummary = useMemo(() => {
    if (isPreferencesLoading) {
      return 'Loading topics...';
    }
    if (preferences.focusTopics.length > 0) {
      return `Based on topics: ${preferences.focusTopics.join(', ')}`;
    }
    return 'Based on your default topics';
  }, [isPreferencesLoading, preferences.focusTopics]);

  return (
    <>
      <Header title="Latest Headlines" />
      <main className="flex-1 p-4 md:p-6">
        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card>
            <CardHeader className="pb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Focus topics</p>
              <CardTitle className="text-base font-semibold">{topicSummary}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">News feed provider</p>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <Select value={provider} onValueChange={value => setProvider(value as NewsProviderId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a provider" />
                </SelectTrigger>
                <SelectContent>
                  {NEWS_PROVIDER_OPTIONS.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {providerMeta && <p className="text-xs text-muted-foreground">{providerMeta.description}</p>}
            </CardContent>
          </Card>
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
