import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminClient } from '@/lib/supabase';
import { env } from '@/lib/env';

const MAX_CONTENT_PACKS = 10;

type ContentPackPayload = {
  headline?: string;
  headlineId?: string;
  config?: Record<string, unknown>;
  drafts?: Record<string, unknown>;
};

async function requireUser(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const authClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL || '',
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await authClient.auth.getUser(token);

  if (error || !user) {
    return { user: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  return { user, error: null };
}

export async function GET(request: Request) {
  const { user, error } = await requireUser(request);
  if (error || !user) {
    return error;
  }

  const supabase = getAdminClient();
  const { data, error: fetchError } = await supabase
    .from('content_packs')
    .select('*')
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })
    .limit(MAX_CONTENT_PACKS);

  if (fetchError) {
    console.error('Failed to load content packs', fetchError);
    return NextResponse.json({ error: 'Unable to load content packs' }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] });
}

export async function POST(request: Request) {
  const { user, error } = await requireUser(request);
  if (error || !user) {
    return error;
  }

  let payload: ContentPackPayload | null = null;
  try {
    payload = (await request.json()) as ContentPackPayload;
  } catch (parseError) {
    console.error('Unable to parse content pack payload', parseError);
  }

  if (!payload?.headline || !payload?.config || !payload?.drafts) {
    return NextResponse.json({ error: 'Missing content pack payload' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data: inserted, error: insertError } = await supabase
    .from('content_packs')
    .insert({
      user_id: user.id,
      headline_id: payload.headlineId ?? null,
      headline: payload.headline,
      config: payload.config,
      drafts: payload.drafts,
    })
    .select('*')
    .single();

  if (insertError || !inserted) {
    console.error('Failed to save content pack', insertError);
    return NextResponse.json({ error: 'Unable to save content pack' }, { status: 500 });
  }

  const { data: allRows, error: listError } = await supabase
    .from('content_packs')
    .select('id')
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false });

  if (!listError && allRows && allRows.length > MAX_CONTENT_PACKS) {
    const idsToDelete = allRows.slice(MAX_CONTENT_PACKS).map((row) => row.id);
    const { error: deleteError } = await supabase
      .from('content_packs')
      .delete()
      .in('id', idsToDelete);

    if (deleteError) {
      console.error('Failed trimming content packs', deleteError);
    }
  }

  return NextResponse.json({ item: inserted });
}
