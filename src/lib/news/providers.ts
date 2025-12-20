export type NewsProviderId = 'google-news' | 'bing-news' | 'reddit-search';

export type NewsProviderMeta = {
  id: NewsProviderId;
  label: string;
  description: string;
};

export const NEWS_PROVIDER_OPTIONS: NewsProviderMeta[] = [
  {
    id: 'google-news',
    label: 'Google News',
    description: 'Aggregated global coverage via Google News RSS search.',
  },
  {
    id: 'bing-news',
    label: 'Bing News',
    description: 'Microsoft Bing News search feed with regional coverage.',
  },
  {
    id: 'reddit-search',
    label: 'Reddit',
    description: 'Topic-matching posts across Reddit communities.',
  },
] as const;

export const DEFAULT_NEWS_PROVIDER: NewsProviderId = 'google-news';

export const NEWS_PROVIDER_META_MAP: Record<NewsProviderId, NewsProviderMeta> = NEWS_PROVIDER_OPTIONS.reduce(
  (acc, meta) => {
    acc[meta.id] = meta;
    return acc;
  },
  {} as Record<NewsProviderId, NewsProviderMeta>
);

export function isValidNewsProvider(value: string | null | undefined): value is NewsProviderId {
  if (!value) return false;
  return (NEWS_PROVIDER_OPTIONS as readonly NewsProviderMeta[]).some(meta => meta.id === value);
}
