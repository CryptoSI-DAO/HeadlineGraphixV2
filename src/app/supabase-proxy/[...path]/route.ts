import { type NextRequest, NextResponse } from 'next/server';

/**
 * Supabase proxy catch-all route.
 *
 * The browser client uses NEXT_PUBLIC_SUPABASE_URL = /supabase-proxy, so all
 * browser-side Supabase calls hit this handler. We forward them to the actual
 * Supabase backend (SUPABASE_BACKEND_URL), which avoids CORS and mixed-content
 * issues with self-hosted Supabase behind an HTTPS reverse proxy.
 */

const BACKEND_URL = process.env.SUPABASE_BACKEND_URL || 'http://localhost:8000';
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

async function handleRequest(
  request: NextRequest,
  method: string,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path: pathSegments } = await context.params;
    const path = pathSegments.join('/');

    // Build the target URL
    const targetUrl = new URL(`${BACKEND_URL}/${path}`);

    // Forward query parameters
    const searchParams = request.nextUrl.searchParams;
    searchParams.forEach((value, key) => {
      targetUrl.searchParams.append(key, value);
    });

    // Clone request headers and inject the anon key (Supabase requires apiKey header)
    const headers = new Headers();
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('content-type', contentType);
    }
    headers.set('apikey', ANON_KEY);
    headers.set('authorization', request.headers.get('authorization') || `Bearer ${ANON_KEY}`);

    // Forward the body for write methods
    let body: BodyInit | null = null;
    if (method !== 'GET' && method !== 'HEAD') {
      body = await request.text();
    }

    const upstream = await fetch(targetUrl.toString(), {
      method,
      headers,
      body,
    });

    // Pass through the response, preserving status and headers
    const responseHeaders = new Headers();
    upstream.headers.forEach((value, key) => {
      // Skip transfer-encoding and content-length — NextResponse handles these
      if (key.toLowerCase() !== 'transfer-encoding' && key.toLowerCase() !== 'content-length') {
        responseHeaders.set(key, value);
      }
    });

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Supabase proxy error:', error);
    return NextResponse.json(
      { error: 'Proxy request failed' },
      { status: 502 },
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, 'GET', context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, 'POST', context);
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, 'PUT', context);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, 'PATCH', context);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, 'DELETE', context);
}
