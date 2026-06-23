import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { requireUser } from '@/lib/auth';

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const { user, error } = await requireUser();
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
