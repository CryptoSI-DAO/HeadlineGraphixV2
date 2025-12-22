import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

// A single admin client is enough for server-side calls in our demo setup.
const adminClient = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    persistSession: false,
  },
});

export function getAdminClient() {
  return adminClient;
}
