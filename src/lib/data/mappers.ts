import type { ReferenceImageMeta, UserProfile } from './types';

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
