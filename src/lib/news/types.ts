import type { Headline } from '@/lib/types';

export type HeadlineGroup = {
  id: string;
  topics: string[];
  label: string;
  headlines: Headline[];
};

export type StandardRssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  guid?: { value?: string } | string;
  source?: { value?: string } | string;
  description?: string;
  ['News:Source']?: { value?: string } | string;
};

export type StandardRssFeed = {
  rss?: {
    channel?: {
      item?: StandardRssItem | StandardRssItem[];
    };
  };
};

export type RedditAtomEntry = {
  title?: string;
  id?: string;
  updated?: string;
  published?: string;
  content?: { value?: string } | string;
  author?: { name?: string } | { name?: string }[];
  category?: { label?: string } | { label?: string }[];
  link?: { href?: string; rel?: string } | { href?: string; rel?: string }[];
};

export type RedditAtomFeed = {
  feed?: {
    entry?: RedditAtomEntry | RedditAtomEntry[];
  };
};
