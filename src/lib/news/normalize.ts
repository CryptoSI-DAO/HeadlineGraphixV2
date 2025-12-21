import crypto from 'node:crypto';
import type { Headline } from '@/lib/types';
import type { RedditAtomEntry, StandardRssItem } from './types';
import { decodeHtmlEntities, ensureArray, slugifyTitle, stripHtml } from './utils';

export function normalizeStandardItem(
  item: StandardRssItem,
  topic: string,
  index: number
): Headline | null {
  if (!item.title || !item.link) return null;

  const title = decodeHtmlEntities(item.title);
  if (!title) return null;

  const guidValue = typeof item.guid === 'object' ? item.guid?.value : item.guid;
  const stableId = guidValue || item.link || `${topic}-${index}`;
  const id = crypto.createHash('md5').update(stableId).digest('hex');

  const sourceValue =
    typeof item.source === 'object'
      ? item.source?.value
      : item.source ||
        (typeof item['News:Source'] === 'object'
          ? item['News:Source']?.value
          : item['News:Source']);

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

export function normalizeRedditEntry(
  entry: RedditAtomEntry,
  topic: string,
  index: number
): Headline | null {
  if (!entry.title) return null;

  const title = decodeHtmlEntities(entry.title);
  if (!title) return null;

  const links = ensureArray(entry.link);
  const permalink =
    links.find(link => !link.rel || link.rel === 'alternate')?.href || links[0]?.href;
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
      decodeHtmlEntities(
        typeof entry.content === 'object' ? entry.content?.value : entry.content
      )
    ),
  };
}
