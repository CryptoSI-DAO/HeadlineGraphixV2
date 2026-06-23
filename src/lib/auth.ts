import 'server-only';
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import type { User } from '@supabase/supabase-js';

/**
 * Shared auth helpers for API routes.
 * Uses cookie-based server client from @supabase/ssr — no more Bearer token parsing.
 */

type RequireUserResult =
  | { user: User; error: null }
  | { user: null; error: NextResponse };

/**
 * Verifies the authenticated user from the request cookies.
 * Returns `{ user, error }` — if `error` is set, return it directly from the route handler.
 */
export async function requireUser(): Promise<RequireUserResult> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }

  return { user: data.user, error: null };
}

/**
 * Returns the authenticated user's ID, or null if not authenticated.
 */
export async function getUserId(): Promise<string | null> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.auth.getUser();
  return data.user?.id ?? null;
}
