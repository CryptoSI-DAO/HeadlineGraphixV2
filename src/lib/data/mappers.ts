import type { ReferenceImageMeta, UserProfile, BrandKit } from './types';

export function mapProfile(row: any): UserProfile {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    focusTopics: row.focus_topics ?? [],
    backlinkUrls: row.backlink_urls ?? [],
    brandPresets: row.brand_presets ?? [],
    creditBalance: row.credit_balance ?? 0,
    referenceImages: row.reference_images ?? [],
    contentHistory: row.content_history ?? [],
    aiPreferences: row.ai_preferences ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapReferenceImage(row: any): ReferenceImageMeta {
  return {
    id: row.id,
    storagePath: row.storage_path,
    imageUrl: row.image_url,
    description: row.description ?? undefined,
    aiHint: row.ai_hint ?? undefined,
    createdAt: row.created_at,
  };
}

export function mapBrandKit(row: any): BrandKit {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    trimColor: row.trim_color,
    font: row.font,
    artStyle: row.art_style,
    logoStoragePath: row.logo_storage_path ?? undefined,
    logoUrl: row.logo_url ?? undefined,
    logoAlt: row.logo_alt ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
