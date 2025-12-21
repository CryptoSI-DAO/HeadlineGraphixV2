import { XMLParser } from 'fast-xml-parser';
import { HEADLINES_PER_TOPIC, REDDIT_USER_AGENT } from './constants';
import type { RedditAtomFeed, RedditAtomEntry, StandardRssFeed, StandardRssItem } from './types';
import { ensureArray } from './utils';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: 'value',
  allowBooleanAttributes: true,
  trimValues: true,
});

export async function parseStandardFeed(
  url: string,
  options?: RequestInit
): Promise<StandardRssItem[]> {
  const response = await fetch(url, {
    ...options,
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch RSS feed: ${response.status}`);
  }

  const body = await response.text();
  const parsed = parser.parse(body) as StandardRssFeed;
  return ensureArray(parsed?.rss?.channel?.item).slice(0, HEADLINES_PER_TOPIC);
}

export async function parseRedditFeed(url: string): Promise<RedditAtomEntry[]> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': REDDIT_USER_AGENT,
    },
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch Reddit feed: ${response.status}`);
  }

  const body = await response.text();
  const parsed = parser.parse(body) as RedditAtomFeed;
  return ensureArray(parsed?.feed?.entry).slice(0, HEADLINES_PER_TOPIC);
}
