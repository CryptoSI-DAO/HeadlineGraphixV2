import type { Headline } from '@/lib/types';
import type { NewsProviderId } from './providers';
import {
  BING_NEWS_BASE_URL,
  GOOGLE_NEWS_BASE_URL,
  REDDIT_SEARCH_BASE_URL,
} from './constants';
import { parseRedditFeed, parseStandardFeed } from './parser';
import { normalizeRedditEntry, normalizeStandardItem } from './normalize';

function buildGoogleFeedUrl(topic: string) {
  const params = new URLSearchParams({
    q: topic,
    hl: 'en-US',
    gl: 'US',
    ceid: 'US:en',
  });
  return `${GOOGLE_NEWS_BASE_URL}?${params.toString()}`;
}

function buildBingFeedUrl(topic: string) {
  const params = new URLSearchParams({
    q: topic,
    format: 'RSS',
    setmkt: 'en-US',
    setlang: 'en-US',
  });
  return `${BING_NEWS_BASE_URL}?${params.toString()}`;
}

function buildRedditFeedUrl(topic: string) {
  const params = new URLSearchParams({
    q: topic,
    type: 'link',
    sort: 'new',
    restrict_sr: 'off',
  });
  return `${REDDIT_SEARCH_BASE_URL}?${params.toString()}`;
}

async function fetchGoogleTopicHeadlines(topic: string): Promise<Headline[]> {
  const items = await parseStandardFeed(buildGoogleFeedUrl(topic));
  return items
    .map((item, index) => normalizeStandardItem(item, topic, index))
    .filter((item): item is Headline => Boolean(item));
}

async function fetchBingTopicHeadlines(topic: string): Promise<Headline[]> {
  const items = await parseStandardFeed(buildBingFeedUrl(topic));
  return items
    .map((item, index) => normalizeStandardItem(item, topic, index))
    .filter((item): item is Headline => Boolean(item));
}

async function fetchRedditTopicHeadlines(topic: string): Promise<Headline[]> {
  const entries = await parseRedditFeed(buildRedditFeedUrl(topic));
  return entries
    .map((entry, index) => normalizeRedditEntry(entry, topic, index))
    .filter((entry): entry is Headline => Boolean(entry));
}

const PROVIDER_FETCHERS: Record<NewsProviderId, (topic: string) => Promise<Headline[]>> = {
  'google-news': fetchGoogleTopicHeadlines,
  'bing-news': fetchBingTopicHeadlines,
  'reddit-search': fetchRedditTopicHeadlines,
};

export { PROVIDER_FETCHERS };
