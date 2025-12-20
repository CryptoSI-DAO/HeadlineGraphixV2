import { NextResponse } from 'next/server';
import { fetchHeadlinesForTopics } from '@/lib/news';
import { DEFAULT_NEWS_PROVIDER, isValidNewsProvider } from '@/lib/news/providers';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const topicsParam = url.searchParams.get('topics');
  const limitParam = url.searchParams.get('limit');
  const providerParam = url.searchParams.get('provider');

  const topics = topicsParam
    ? topicsParam
        .split(',')
        .map(topic => topic.trim())
        .filter(Boolean)
    : [];

  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  const limit = parsedLimit && Number.isFinite(parsedLimit) ? Math.min(50, Math.max(1, parsedLimit)) : undefined;
  const provider = isValidNewsProvider(providerParam) ? providerParam : DEFAULT_NEWS_PROVIDER;

  try {
    const { headlines, groups } = await fetchHeadlinesForTopics(topics, limit ?? 24, provider);
    return NextResponse.json({ headlines, groups, provider });
  } catch (error) {
    console.error('Failed to fetch headlines', error);
    return NextResponse.json({ error: 'Unable to fetch headlines at this time.' }, { status: 500 });
  }
}
