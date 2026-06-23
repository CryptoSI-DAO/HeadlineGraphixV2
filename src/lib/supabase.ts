import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side admin client using the service role key.
 * Uses SUPABASE_BACKEND_URL (direct) to bypass the browser proxy.
 *
 * ⚠️ This bypasses RLS — only use for server-side operations that need
 * elevated access (storage uploads, cross-user queries, etc).
 */

let adminClient: SupabaseClient | null = null;

export function getAdminClient() {
  if (!adminClient) {
    adminClient = createClient(
      process.env.SUPABASE_BACKEND_URL ||
        process.env.NEXT_PUBLIC_SUPABASE_URL ||
        'http://localhost:8000',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy-build-key',
      {
        auth: {
          persistSession: false,
        },
      },
    );
  }
  return adminClient;
}
