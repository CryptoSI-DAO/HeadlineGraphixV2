import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { DEMO_USER_ID, listReferenceImages } from '@/lib/data';
import type { ReferenceImageMeta } from '@/lib/data';
import { getAdminClient } from '@/lib/supabase';

const BUCKET_ID = 'reference-images';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const images = await listReferenceImages();
    return NextResponse.json({ images });
  } catch (error) {
    console.error('Failed to list reference images', error);
    return NextResponse.json({ error: 'Unable to load reference images' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const description = (formData.get('description') as string | null) ?? undefined;
    const aiHint = (formData.get('aiHint') as string | null) ?? undefined;

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'A file is required.' }, { status: 400 });
    }

    const sanitizedName = file.name ? file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_') : 'upload.jpg';
    const storagePath = `${DEMO_USER_ID}/${Date.now()}-${randomUUID()}-${sanitizedName}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const supabase = getAdminClient();
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_ID)
      .upload(storagePath, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('Failed to upload file to storage', uploadError);
      return NextResponse.json({ error: 'Unable to upload file' }, { status: 500 });
    }

    const { data: publicUrl } = supabase.storage.from(BUCKET_ID).getPublicUrl(storagePath);

    const { data, error } = await supabase
      .from('reference_images')
      .insert({
        user_id: DEMO_USER_ID,
        storage_path: storagePath,
        image_url: publicUrl.publicUrl,
        description: description ?? sanitizedName,
        ai_hint: aiHint ?? null,
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Failed to store reference image metadata', error);
      return NextResponse.json({ error: 'Unable to store metadata' }, { status: 500 });
    }

    const mapped: ReferenceImageMeta = {
      id: data.id,
      storagePath: data.storage_path,
      imageUrl: data.image_url,
      description: data.description ?? undefined,
      aiHint: data.ai_hint ?? undefined,
      createdAt: data.created_at,
    };

    return NextResponse.json({ image: mapped }, { status: 201 });
  } catch (error) {
    console.error('Failed to upload reference image', error);
    return NextResponse.json({ error: 'Unable to upload reference image' }, { status: 500 });
  }
}
