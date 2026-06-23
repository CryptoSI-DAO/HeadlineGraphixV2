import { Buffer } from 'node:buffer';
import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { listBrandKits, countBrandKits } from '@/lib/data';
import type { BrandKit } from '@/lib/data/types';
import { getAdminClient } from '@/lib/supabase';
import { getUserId } from '@/lib/auth';
import {
  ALLOWED_LOGO_TYPES,
  MAX_BRAND_KITS,
  MAX_LOGO_SIZE_BYTES,
  BUCKET_ID,
} from '@/lib/brand-kits';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const brands = await listBrandKits(userId);
    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Failed to list brand kits', error);
    return NextResponse.json({ error: 'Unable to load brand kits' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const id = formData.get('id') as string | null;
    const name = formData.get('name') as string;
    const primaryColor = formData.get('primaryColor') as string;
    const secondaryColor = formData.get('secondaryColor') as string;
    const trimColor = formData.get('trimColor') as string;
    const font = formData.get('font') as string;
    const artStyle = formData.get('artStyle') as string;
    const logoAlt = formData.get('logoAlt') as string | null;
    const logoFile = formData.get('logo') as File | null;

    if (!name || !primaryColor || !secondaryColor || !trimColor || !font || !artStyle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getAdminClient();

    if (!id) {
      const count = await countBrandKits(userId);
      if (count >= MAX_BRAND_KITS) {
        return NextResponse.json({ error: `You can only have ${MAX_BRAND_KITS} brands.` }, { status: 400 });
      }
    }

    let logoStoragePath: string | undefined;
    let logoUrl: string | undefined;

    if (logoFile) {
      if (!ALLOWED_LOGO_TYPES.includes(logoFile.type)) {
        return NextResponse.json({ error: 'Unsupported image type. Use JPEG, PNG, or WebP.' }, { status: 400 });
      }
      if (logoFile.size > MAX_LOGO_SIZE_BYTES) {
        const maxSizeMb = Math.max(1, Math.round(MAX_LOGO_SIZE_BYTES / (1024 * 1024)));
        return NextResponse.json({ error: `Logo must be ${maxSizeMb}MB or smaller.` }, { status: 400 });
      }

      const sanitizedName = logoFile.name ? logoFile.name.replace(/[^a-zA-Z0-9.\-_]/g, '_') : 'logo.jpg';
      logoStoragePath = `${userId}/${Date.now()}-${randomUUID()}-${sanitizedName}`;
      const buffer = Buffer.from(await logoFile.arrayBuffer());

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_ID)
        .upload(logoStoragePath, buffer, {
          contentType: logoFile.type || 'application/octet-stream',
          upsert: false,
        });

      if (uploadError) {
        console.error('Failed to upload logo to storage', uploadError);
        const message = uploadError.message || 'Unable to upload logo';
        return NextResponse.json({ error: message }, { status: 500 });
      }

      const { data: publicUrl } = supabase.storage.from(BUCKET_ID).getPublicUrl(logoStoragePath);
      logoUrl = publicUrl.publicUrl;
    }

    const brandData: any = {
      user_id: userId,
      name,
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      trim_color: trimColor,
      font,
      art_style: artStyle,
      logo_alt: logoAlt ?? null,
    };

    if (logoStoragePath) {
      brandData.logo_storage_path = logoStoragePath;
    }
    if (logoUrl) {
      brandData.logo_url = logoUrl;
    }

    let data: any;
    let error: any;

    if (id) {
      const result = await supabase
        .from('brand_kits')
        .update(brandData)
        .eq('id', id)
        .eq('user_id', userId)
        .select('*')
        .single();

      data = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('brand_kits')
        .insert(brandData)
        .select('*')
        .single();

      data = result.data;
      error = result.error;
    }

    if (error || !data) {
      console.error('Failed to save brand kit', error);
      return NextResponse.json({ error: 'Unable to save brand kit' }, { status: 500 });
    }

    const mapped: BrandKit = {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      primaryColor: data.primary_color,
      secondaryColor: data.secondary_color,
      trimColor: data.trim_color,
      font: data.font,
      artStyle: data.art_style,
      logoStoragePath: data.logo_storage_path ?? undefined,
      logoUrl: data.logo_url ?? undefined,
      logoAlt: data.logo_alt ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ brand: mapped }, { status: id ? 200 : 201 });
  } catch (error) {
    console.error('Failed to save brand kit', error);
    return NextResponse.json({ error: 'Unable to save brand kit' }, { status: 500 });
  }
}
