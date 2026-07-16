import { type NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Middleware: refreshes Supabase auth session cookies on every request and
 * protects app routes.
 *
 * - Unauthenticated → redirected to /login (except /login itself)
 * - Authenticated on /login → redirected to /
 * - API routes and static assets are NOT intercepted
 */

const PUBLIC_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes, Next.js internals, and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/supabase-proxy/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Create a server client that can read/write cookies via the response
  let supabaseResponse = NextResponse.next({ request });

  // Server-side middleware needs an absolute URL to reach Supabase.
  // Use SUPABASE_BACKEND_URL (set on Vercel) instead of the browser-facing
  // NEXT_PUBLIC_SUPABASE_URL which may be a relative path.
  const supabaseUrl = process.env.SUPABASE_BACKEND_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Refresh the session — this also updates the cookies
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect logic
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.searchParams.delete('redirect');
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - /_next/static, /_next/image (static assets)
     * - /favicon.ico, robots.txt, manifest.json
     * - Files with extensions (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json|api|supabase-proxy).*)',
  ],
};
