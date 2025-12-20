import { getAdminClient } from '@/lib/supabase';

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

const TABLES = {
  profiles: 'profiles',
  referenceImages: 'reference_images',
  contentPacks: 'content_packs',
} as const;

export type BrandPreset = {
  id: string;
  name: string;
  tone: string;
  palette?: string[];
  logoUrl?: string;
};

export type ReferenceImageMeta = {
  id: string;
  storagePath: string;
  imageUrl: string;
  description?: string;
  aiHint?: string;
  createdAt: string;
};

export type AIPreferences = {
  defaultTone?: string;
  fallbackTone?: string;
  defaultReferenceImageId?: string;
  defaultLinkedInCallToAction?: string;
  temperature?: number;
  maxDraftsPerRequest?: number;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  focusTopics: string[];
  backlinkUrls: string[];
  brandPresets: BrandPreset[];
  creditBalance: number;
  referenceImages: ReferenceImageMeta[];
  contentHistory: string[];
  aiPreferences: AIPreferences;
  createdAt: string;
  updatedAt: string;
};

export type UpdateUserPreferencesInput = Partial<Pick<UserProfile,
  'focusTopics' | 'backlinkUrls' | 'brandPresets' | 'creditBalance' | 'referenceImages' | 'contentHistory' | 'aiPreferences'>>;

export type ContentPackConfig = {
  brandTone: string;
  referenceImage?: string;
  userAngle?: string;
  backlinks?: string[];
};

export type ContentPackDrafts = {
  blogPost: string;
  linkedInPost: string;
  infographic: string;
};

export type SaveContentPackInput = {
  headlineId?: string;
  headline: string;
  config: ContentPackConfig;
  drafts: ContentPackDrafts;
};

const supabase = getAdminClient();

function mapProfile(row: any): UserProfile {
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

function mapReferenceImage(row: any): ReferenceImageMeta {
  return {
    id: row.id,
    storagePath: row.storage_path,
    imageUrl: row.image_url,
    description: row.description ?? undefined,
    aiHint: row.ai_hint ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const { data, error } = await supabase
    .from(TABLES.profiles)
    .select('*')
    .eq('id', DEMO_USER_ID)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (data) {
    return mapProfile(data);
  }

  const { data: inserted, error: insertError } = await supabase
    .from(TABLES.profiles)
    .upsert(
      {
        id: DEMO_USER_ID,
        email: 'demo@example.com',
        name: 'Demo User',
        focus_topics: [],
        backlink_urls: [],
        brand_presets: [],
        credit_balance: 0,
        reference_images: [],
        content_history: [],
        ai_preferences: { defaultTone: 'Professional', fallbackTone: 'Conversational' },
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single();

  if (insertError || !inserted) {
    throw new Error(`Failed to create demo profile: ${insertError?.message}`);
  }

  return mapProfile(inserted);
}

export async function updateUserPreferences(payload: UpdateUserPreferencesInput): Promise<UserProfile> {
  const updateBody: Record<string, unknown> = {};

  if (payload.focusTopics) updateBody.focus_topics = payload.focusTopics;
  if (payload.backlinkUrls) updateBody.backlink_urls = payload.backlinkUrls;
  if (payload.brandPresets) updateBody.brand_presets = payload.brandPresets;
  if (typeof payload.creditBalance === 'number') updateBody.credit_balance = payload.creditBalance;
  if (payload.referenceImages) updateBody.reference_images = payload.referenceImages;
  if (payload.contentHistory) updateBody.content_history = payload.contentHistory;
  if (payload.aiPreferences) updateBody.ai_preferences = payload.aiPreferences;

  if (Object.keys(updateBody).length === 0) {
    return getCurrentUserProfile();
  }

  const { data, error } = await supabase
    .from(TABLES.profiles)
    .update(updateBody)
    .eq('id', DEMO_USER_ID)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to update profile: ${error?.message}`);
  }

  return mapProfile(data);
}

export async function listReferenceImages(): Promise<ReferenceImageMeta[]> {
  const { data, error } = await supabase
    .from(TABLES.referenceImages)
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list reference images: ${error.message}`);
  }

  return (data ?? []).map(mapReferenceImage);
}

export async function saveContentPack(input: SaveContentPackInput) {
  const { error } = await supabase
    .from(TABLES.contentPacks)
    .insert({
      user_id: DEMO_USER_ID,
      headline_id: input.headlineId,
      headline: input.headline,
      config: input.config,
      drafts: input.drafts,
    });

  if (error) {
    throw new Error(`Failed to save content pack: ${error.message}`);
  }
}

export { DEMO_USER_ID };
