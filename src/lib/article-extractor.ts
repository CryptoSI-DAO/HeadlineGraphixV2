import * as cheerio from 'cheerio';
import {XMLParser} from 'fast-xml-parser';

export async function extractArticleFromUrl(url: string): Promise<{content: string; resolvedUrl: string}> {
  return extractArticleFromUrlInternal(url, 0);
}

async function extractArticleFromUrlInternal(
  url: string,
  depth: number
): Promise<{content: string; resolvedUrl: string}> {
  const controller = new AbortController();
  const timeoutMs = 12000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HeadlineGraphixBot/1.0',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error?.name === 'AbortError') {
      throw new Error(`Article fetch timed out after ${Math.round(timeoutMs / 1000)}s.`);
    }
    throw error;
  }

  clearTimeout(timeoutId);
  if (!response.ok) {
    throw new Error(`Article fetch failed (${response.status}).`);
  }

  const finalUrl = response.url || url;
  const html = await response.text();

  if (depth < 2 && isGoogleNewsUrl(finalUrl)) {
    const resolvedFromXml = await resolveGoogleNewsRssLink(html, finalUrl);
    if (resolvedFromXml) {
      return extractArticleFromUrlInternal(resolvedFromXml, depth + 1);
    }
  }

  const $ = cheerio.load(html);

  if (depth < 2 && isGoogleNewsUrl(finalUrl)) {
    const externalUrl = findExternalArticleUrl($, finalUrl);
    if (externalUrl) {
      return extractArticleFromUrlInternal(externalUrl, depth + 1);
    }
  }

  $('script, style, noscript, svg, iframe, form, nav, header, footer, aside').remove();

  const candidates = [
    $('article').text(),
    $('main').text(),
    $('body').text(),
  ];

  const rawText = candidates.find(text => text && text.trim().length > 0) ?? '';
  const cleaned = rawText.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return {content: '', resolvedUrl: finalUrl};
  }

  const maxLength = 12000;
  const content = cleaned.length > maxLength ? cleaned.slice(0, maxLength) : cleaned;
  return {content, resolvedUrl: finalUrl};
}

function isGoogleNewsUrl(url: string) {
  try {
    const host = new URL(url).hostname;
    return host === 'news.google.com' || host.endsWith('.news.google.com');
  } catch {
    return false;
  }
}

function findExternalArticleUrl($: cheerio.CheerioAPI, baseUrl: string) {
  const candidates: string[] = [];
  const canonical = $('link[rel="canonical"]').attr('href');
  const ogUrl = $('meta[property="og:url"]').attr('content');
  const ampUrl = $('link[rel="amphtml"]').attr('href');

  if (canonical) candidates.push(canonical);
  if (ogUrl) candidates.push(ogUrl);
  if (ampUrl) candidates.push(ampUrl);

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) candidates.push(href);
  });

  for (const href of candidates) {
    try {
      const absolute = new URL(href, baseUrl).toString();
      const host = new URL(absolute).hostname;
      if (!host.includes('news.google.com')) {
        return absolute;
      }
    } catch {
      continue;
    }
  }

  return '';
}

async function resolveGoogleNewsRssLink(payload: string, baseUrl: string) {
  const trimmed = payload.trim();
  if (!trimmed.startsWith('<')) {
    return '';
  }

  if (!trimmed.includes('<rss') && !trimmed.includes('<feed')) {
    return '';
  }

  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      trimValues: true,
    });
    const data = parser.parse(payload);
    const item = data?.rss?.channel?.item;
    const firstItem = Array.isArray(item) ? item[0] : item;
    if (!firstItem) return '';
    const link = typeof firstItem.link === 'string' ? firstItem.link : firstItem?.['link'];
    const guid = typeof firstItem.guid === 'string' ? firstItem.guid : firstItem?.['guid'];
    const candidate = link || guid;
    if (typeof candidate !== 'string') return '';

    const urlFromQuery = extractExternalUrlFromQuery(candidate);
    if (urlFromQuery) {
      return urlFromQuery;
    }

    if (candidate.includes('/rss/articles/')) {
      const articlePageUrl = candidate.replace('/rss/articles/', '/articles/');
      const resolved = await resolveGoogleNewsArticlePageUrl(articlePageUrl);
      if (resolved) return resolved;
    }

    if (candidate.includes('/articles/')) {
      const resolved = await resolveGoogleNewsArticlePageUrl(candidate);
      if (resolved) return resolved;
    }

    return candidate;
    return '';
  } catch {
    return '';
  }
}

async function resolveGoogleNewsArticlePageUrl(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'HeadlineGraphixBot/1.0',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!response.ok) return '';
    const html = await response.text();
    const $ = cheerio.load(html);
    return findExternalArticleUrl($, url);
  } catch {
    return '';
  }
}

function extractExternalUrlFromQuery(url: string) {
  try {
    const parsed = new URL(url);
    const external = parsed.searchParams.get('url') || parsed.searchParams.get('q');
    if (external) {
      return external;
    }
  } catch {
    return '';
  }
  return '';
}
