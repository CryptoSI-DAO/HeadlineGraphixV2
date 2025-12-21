import type { Headline } from '@/lib/types';

const HTML_ENTITY_MAP: Record<string, string> = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&lt;': '<',
  '&gt;': '>',
};

export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function uniqueTopics(topics: string[]) {
  return Array.from(new Set(topics.map(topic => topic.trim()).filter(Boolean)));
}

export function sortByDateDesc(items: Headline[]) {
  return items.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function chunkArray<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export function slugifyTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

export function wrapTopic(topic: string) {
  return topic.includes(' ') ? `"${topic}"` : topic;
}

export function buildBooleanQuery(topics: string[]) {
  return topics.map(wrapTopic).join(' AND ');
}

export function buildTopicPairs(topics: string[]) {
  const pairs: [string, string][] = [];
  for (let i = 0; i < topics.length; i += 1) {
    for (let j = i + 1; j < topics.length; j += 1) {
      pairs.push([topics[i], topics[j]]);
    }
  }
  return pairs;
}

export function stripHtml(input?: string) {
  if (!input) return undefined;
  return input.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() || undefined;
}

export function decodeHtmlEntities(input?: string) {
  if (!input) return input;
  return input.replace(/&(nbsp|amp|quot|apos|lt|gt);/gi, entity => {
    return HTML_ENTITY_MAP[entity.toLowerCase()] ?? entity;
  });
}
