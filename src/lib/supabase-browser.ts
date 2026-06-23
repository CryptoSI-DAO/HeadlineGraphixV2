import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client using @supabase/ssr.
 * Uses cookie-based session management (no localStorage).
 *
 * NEXT_PUBLIC_SUPABASE_URL should point at the proxy path (/supabase-proxy)
 * so the browser never talks to Supabase directly — avoids CORS and
 * mixed-content issues with self-hosted Supabase behind an HTTPS proxy.
 */
export function createBrowserClient_() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

let browserClient: ReturnType<typeof createBrowserClient_> | null = null;

/**
 * Returns a singleton browser client (maintains the same API as the previous
 * getBrowserClient so AuthContext and other consumers don't need to change).
 */
export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient_();
  }
  return browserClient;
}
