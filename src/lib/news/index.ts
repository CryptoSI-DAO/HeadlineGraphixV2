import crypto from 'node:crypto';
import { XMLParser } from 'fast-xml-parser';
import type { Headline } from '@/lib/types';
import { DEFAULT_NEWS_PROVIDER, type NewsProviderId } from './providers';

const GOOGLE_NEWS_BASE_URL = 'https://news.google.com/rss/search';
const BING_NEWS_BASE_URL = 'https://www.bing.com/news/search';
const REDDIT_SEARCH_BASE_URL = 'https://www.reddit.com/search.rss';
const REDDIT_USER_AGENT = 'HeadlineGraphixBot/1.0 (https://headlinegraphix.example)';

export const FALLBACK_TOPICS = ['technology', 'business', 'marketing', 'artificial intelligence'];
const HEADLINES_PER_TOPIC = 10;
const PER_TOPIC_FALLBACK_COUNT = 2;

export type HeadlineGroup = {
  id: string;
  topics: string[];
  label: string;
  headlines: Headline[];
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: 'value',
  allowBooleanAttributes: true,
  trimValues: true,
});

type StandardRssItem = {
  title?: string;
  link?: string;
  pubDate?: string;
  guid?: { value?: string } | string;
  source?: { value?: string } | string;
  description?: string;
  ['News:Source']?: { value?: string } | string;
};

type StandardRssFeed = {
  rss?: {
    channel?: {
      item?: StandardRssItem | StandardRssItem[];
    };
  };
};

type RedditAtomEntry = {
  title?: string;
  id?: string;
  updated?: string;
  published?: string;
  content?: { value?: string } | string;
  author?: { name?: string } | { name?: string }[];
  category?: { label?: string } | { label?: string }[];
  link?: { href?: string; rel?: string } | { href?: string; rel?: string }[];
};

type RedditAtomFeed = {
  feed?: {
    entry?: RedditAtomEntry | RedditAtomEntry[];
  };
};

function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function uniqueTopics(topics: string[]) {
  return Array.from(new Set(topics.map(topic => topic.trim()).filter(Boolean)));
}

function sortByDateDesc(items: Headline[]) {
  return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

function wrapTopic(topic: string) {
  return topic.includes(' ') ? `"${topic}"` : topic;
}

function buildBooleanQuery(topics: string[]) {
  return topics.map(wrapTopic).join(' AND ');
}

function buildTopicPairs(topics: string[]) {
  const pairs: [string, string][] = [];
  for (let i = 0; i < topics.length; i += 1) {
    for (let j = i + 1; j < topics.length; j += 1) {
      pairs.push([topics[i], topics[j]]);
    }
  }
  return pairs;
}

function stripHtml(input?: string) {
  if (!input) return undefined;
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || undefined;
}

const HTML_ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

function decodeHtmlEntities(input?: string) {
  if (!input) return input;
  return input.replace(/&(nbsp|amp|quot|apos|lt|gt);/gi, entity => HTML_ENTITY_MAP[entity.toLowerCase()] ?? entity);
}

function normalizeStandardItem(item: StandardRssItem, topic: string, index: number): Headline | null {
  if (!item.title || !item.link) return null;

  const title = decodeHtmlEntities(item.title);
  if (!title) return null;

  const guidValue = typeof item.guid === 'object' ? item.guid?.value : item.guid;
  const stableId = guidValue || item.link || `${topic}-${index}`;
  const id = crypto.createHash('md5').update(stableId).digest('hex');

  const sourceValue =
    typeof item.source === 'object'
      ? item.source?.value
      : item.source || (typeof item['News:Source'] === 'object' ? item['News:Source']?.value : item['News:Source']);

  const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

  let hostname = 'News Source';
  try {
    hostname = new URL(item.link).hostname.replace(/^www\./, '');
  } catch {
    hostname = 'News Source';
  }

  return {
    id,
    slug: slugifyTitle(title) || id,
    title,
    source: decodeHtmlEntities(sourceValue) || hostname,
    date: publishedAt.toISOString(),
    url: item.link,
    content: stripHtml(decodeHtmlEntities(item.description)),
  };
}

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

async function parseStandardFeed(url: string, options?: RequestInit): Promise<StandardRssItem[]> {
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

async function parseRedditFeed(url: string): Promise<RedditAtomEntry[]> {
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

function normalizeRedditEntry(entry: RedditAtomEntry, topic: string, index: number): Headline | null {
  if (!entry.title) return null;

  const title = decodeHtmlEntities(entry.title);
  if (!title) return null;

  const links = ensureArray(entry.link);
  const permalink = links.find(link => !link.rel || link.rel === 'alternate')?.href || links[0]?.href;
  if (!permalink) return null;

  const stableId = entry.id || permalink || `${topic}-${index}`;
  const id = crypto.createHash('md5').update(stableId).digest('hex');
  const publishedAt = entry.updated || entry.published;

  const author = ensureArray(entry.author)[0]?.name;
  const category = ensureArray(entry.category)[0]?.label;

  return {
    id,
    slug: slugifyTitle(title) || id,
    title,
    source: decodeHtmlEntities(category || author) || 'Reddit',
    date: (publishedAt ? new Date(publishedAt) : new Date()).toISOString(),
    url: permalink,
    content: stripHtml(
      decodeHtmlEntities(typeof entry.content === 'object' ? entry.content?.value : entry.content)
    ),
  };
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

export async function fetchHeadlinesForTopics(
  topics: string[],
  limit = 24,
  provider: NewsProviderId = DEFAULT_NEWS_PROVIDER
): Promise<{ headlines: Headline[]; groups: HeadlineGroup[] }> {
  const requestedTopics = topics.length > 0 ? uniqueTopics(topics) : [];
  const fetcher = PROVIDER_FETCHERS[provider];
  const deduped = new Map<string, Headline>();
  const results: Headline[] = [];
  const groups: HeadlineGroup[] = [];
  let totalSelected = 0;

  const normalizeTopics = (input: string[]) => (input.length > 0 ? input : ['Top Stories']);
  const formatGroupLabel = (normalized: string[]) =>
    normalized.length > 1 ? `Topics: ${normalized.join(' + ')}` : `Topic: ${normalized[0]}`;

  function takeFresh(items: Headline[]) {
    const fresh: Headline[] = [];
    for (const item of items) {
      if (!deduped.has(item.id)) {
        deduped.set(item.id, item);
        fresh.push(item);
        results.push(item);
      }
    }
    return fresh;
  }

  function registerGroup(rawTopics: string[], items: Headline[]) {
    if (!items.length || totalSelected >= limit) return totalSelected >= limit;
    const normalizedTopics = normalizeTopics(rawTopics);
    const label = formatGroupLabel(normalizedTopics);
    const fresh = sortByDateDesc(takeFresh(items));
    if (!fresh.length) return totalSelected >= limit;

    const baseKey = normalizedTopics.join('-') || 'top-stories';
    const chunks = chunkArray(fresh, 4);
    for (let index = 0; index < chunks.length; index += 1) {
      if (totalSelected >= limit) break;
      const chunk = chunks[index];
      const remaining = limit - totalSelected;
      const boundedChunk = chunk.slice(0, Math.min(chunk.length, remaining));
      if (!boundedChunk.length) continue;

      groups.push({
        id: `${baseKey}-${groups.length}-${index}`,
        topics: normalizedTopics,
        label,
        headlines: boundedChunk,
      });
      totalSelected += boundedChunk.length;
    }

    return totalSelected >= limit;
  }

  async function fetchQuery(query: string, take?: number) {
    try {
      const items = await fetcher(query);
      const limited = take ? items.slice(0, take) : items;
      return sortByDateDesc(limited);
    } catch (error) {
      console.error(`Failed to fetch headlines for query "${query}" using provider "${provider}"`, error);
      return [];
    }
  }

  if (requestedTopics.length > 0) {
    if (requestedTopics.length >= 2) {
      const combinedQuery = buildBooleanQuery(requestedTopics);
      const combinedItems = await fetchQuery(combinedQuery);
      if (registerGroup(requestedTopics, combinedItems)) {
        return {
          headlines: sortByDateDesc(results).slice(0, limit),
          groups,
        };
      }

      const pairs = buildTopicPairs(requestedTopics);
      for (const pair of pairs) {
        if (totalSelected >= limit) break;
        const pairQuery = buildBooleanQuery(pair);
        const pairItems = await fetchQuery(pairQuery);
        if (registerGroup(pair, pairItems)) {
          return {
            headlines: sortByDateDesc(results).slice(0, limit),
            groups,
          };
        }
      }
    }

    for (const topic of requestedTopics) {
      if (totalSelected >= limit) break;
      const items = await fetchQuery(topic, PER_TOPIC_FALLBACK_COUNT);
      if (registerGroup([topic], items)) {
        return {
          headlines: sortByDateDesc(results).slice(0, limit),
          groups,
        };
      }
    }

    return {
      headlines: sortByDateDesc(results).slice(0, limit),
      groups,
    };
  }

  const fallbackResults = await Promise.all(
    FALLBACK_TOPICS.map(async topic => {
      try {
        return await fetcher(topic);
      } catch (error) {
        console.error(`Failed to fetch fallback headlines for topic "${topic}" using provider "${provider}"`, error);
        return [];
      }
    })
  );

  fallbackResults.forEach((items, index) => {
    if (totalSelected >= limit) return;
    registerGroup([FALLBACK_TOPICS[index]], items);
  });

  return {
    headlines: sortByDateDesc(results).slice(0, limit),
    groups,
  };
}

export type { NewsProviderId, HeadlineGroup };
