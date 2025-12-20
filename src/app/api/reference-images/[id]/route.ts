import { NextResponse } from 'next/server';
import { DEMO_USER_ID } from '@/lib/data';
import { getAdminClient } from '@/lib/supabase';

const BUCKET_ID = 'reference-images';

export const runtime = 'nodejs';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function DELETE(_: Request, { params }: RouteParams) {
  const { id } = params;
  const supabase = getAdminClient();

  try {
    const { data, error } = await supabase
      .from('reference_images')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Reference image not found' }, { status: 404 });
    }

    if (data.storage_path) {
      const { error: storageError } = await supabase.storage.from(BUCKET_ID).remove([data.storage_path]);
      if (storageError) {
        console.error('Failed to remove storage object', storageError);
        return NextResponse.json({ error: 'Unable to delete image file' }, { status: 500 });
      }
    }

    const { error: deleteError } = await supabase
      .from('reference_images')
      .delete()
      .eq('id', id)
      .eq('user_id', DEMO_USER_ID);

    if (deleteError) {
      console.error('Failed to remove reference image metadata', deleteError);
      return NextResponse.json({ error: 'Unable to delete reference image' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete reference image', error);
    return NextResponse.json({ error: 'Unable to delete reference image' }, { status: 500 });
  }
}
