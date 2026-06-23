import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

/**
 * Server-side Supabase client using @supabase/ssr with cookie-based auth.
 *
 * Use this in Server Components, Route Handlers, and Server Actions.
 * It reads/writes auth cookies automatically, so no manual Bearer token
 * extraction is needed.
 *
 * SUPABASE_BACKEND_URL points at the direct Supabase URL (bypassing the
 * browser proxy) for server-to-server calls.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.SUPABASE_BACKEND_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware will refresh the session.
          }
        },
      },
    },
  );
}
