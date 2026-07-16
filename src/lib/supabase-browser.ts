import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser-side Supabase client using @supabase/ssr.
 * Uses cookie-based session management (no localStorage).
 *
 * Connects directly to self-hosted Supabase (same approach as Strait Crisis).
 */
export function createBrowserClient_() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

let browserClient: ReturnType<typeof createBrowserClient_> | null = null;

/**
 * Returns a singleton browser client.
 */
export function getBrowserClient() {
  if (!browserClient) {
    browserClient = createBrowserClient_();
  }
  return browserClient;
}
