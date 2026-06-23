import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireUser } from '@/lib/auth';

const MAX_CONTENT_PACKS = 10;

type ContentPackPayload = {
  headline?: string;
  headlineId?: string;
  config?: Record<string, unknown>;
  drafts?: Record<string, unknown>;
};

export async function GET() {
  const { user, error } = await requireUser();
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
  const { user, error } = await requireUser();
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
