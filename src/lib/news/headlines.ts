import type { Headline } from '@/lib/types';
import { DEFAULT_NEWS_PROVIDER, type NewsProviderId } from './providers';
import { FALLBACK_TOPICS, PER_TOPIC_FALLBACK_COUNT } from './constants';
import { PROVIDER_FETCHERS } from './fetchers';
import type { HeadlineGroup } from './types';
import {
  buildBooleanQuery,
  buildTopicPairs,
  chunkArray,
  sortByDateDesc,
  uniqueTopics,
} from './utils';

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
      console.error(
        `Failed to fetch headlines for query "${query}" using provider "${provider}"`,
        error
      );
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
        console.error(
          `Failed to fetch fallback headlines for topic "${topic}" using provider "${provider}"`,
          error
        );
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
