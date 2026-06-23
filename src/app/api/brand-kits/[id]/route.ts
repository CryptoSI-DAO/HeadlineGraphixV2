import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { getUserId } from '@/lib/auth';
import { BUCKET_ID } from '@/lib/brand-kits';

export const runtime = 'nodejs';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminClient();

  try {
    const { data, error } = await supabase
      .from('brand_kits')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Brand kit not found' }, { status: 404 });
    }

    if (data.logo_storage_path) {
      const { error: storageError } = await supabase.storage.from(BUCKET_ID).remove([data.logo_storage_path]);
      if (storageError) {
        console.error('Failed to remove logo from storage', storageError);
        return NextResponse.json({ error: 'Unable to delete logo file' }, { status: 500 });
      }
    }

    const { error: deleteError } = await supabase
      .from('brand_kits')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Failed to remove brand kit', deleteError);
      return NextResponse.json({ error: 'Unable to delete brand kit' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete brand kit', error);
    return NextResponse.json({ error: 'Unable to delete brand kit' }, { status: 500 });
  }
}
