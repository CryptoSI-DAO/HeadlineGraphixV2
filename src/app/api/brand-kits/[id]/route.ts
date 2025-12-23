import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { BUCKET_ID } from '@/lib/brand-kits';

export const runtime = 'nodejs';

async function getUserIdFromRequest(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    return null;
  }

  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL || '', env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return null;
  }
  return user.id;
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const userId = await getUserIdFromRequest(request);

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

    // Delete logo from storage if exists
    if (data.logo_storage_path) {
      const { error: storageError } = await supabase.storage.from(BUCKET_ID).remove([data.logo_storage_path]);
      if (storageError) {
        console.error('Failed to remove logo from storage', storageError);
        return NextResponse.json({ error: 'Unable to delete logo file' }, { status: 500 });
      }
    }

    // Delete brand kit from database
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
