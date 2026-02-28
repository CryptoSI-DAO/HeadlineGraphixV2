import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminClient } from '@/lib/supabase';
import { env } from '@/lib/env';

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

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { user, error } = await requireUser(request);
  if (error || !user) {
    return error;
  }

  const contentPackId = context.params.id;
  if (!contentPackId) {
    return NextResponse.json({ error: 'Missing content pack id' }, { status: 400 });
  }

  const supabase = getAdminClient();
  const { data, error: deleteError } = await supabase
    .from('content_packs')
    .delete()
    .eq('id', contentPackId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle();

  if (deleteError) {
    console.error('Failed to delete content pack', deleteError);
    return NextResponse.json({ error: 'Unable to delete content pack' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Content pack not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
