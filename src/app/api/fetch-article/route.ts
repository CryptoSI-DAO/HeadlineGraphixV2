import {NextResponse} from 'next/server';
import {extractArticleFromUrl} from '@/lib/article-extractor';

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({error: 'Missing url parameter.'}, {status: 400});
  }

  try {
    const result = await extractArticleFromUrl(url);
    console.info('fetch-article', {
      requestedUrl: url,
      resolvedUrl: result.resolvedUrl,
      contentLength: result.content.length,
    });
    return NextResponse.json({content: result.content, resolvedUrl: result.resolvedUrl});
  } catch (error: any) {
    return NextResponse.json({error: error?.message ?? 'Failed to fetch article.'}, {status: 500});
  }
}
