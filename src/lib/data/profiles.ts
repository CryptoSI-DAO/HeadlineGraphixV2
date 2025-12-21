import { DEMO_USER_ID, TABLES, supabase } from './constants';
import { mapProfile } from './mappers';
import type { UpdateUserPreferencesInput, UserProfile } from './types';

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const { data, error } = await supabase
    .from(TABLES.hgprofiles)
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
    .from(TABLES.hgprofiles)
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

export async function updateUserPreferences(
  payload: UpdateUserPreferencesInput
): Promise<UserProfile> {
  const updateBody: Record<string, unknown> = {};

  if (payload.focusTopics) updateBody.focus_topics = payload.focusTopics;
  if (payload.backlinkUrls) updateBody.backlink_urls = payload.backlinkUrls;
  if (payload.brandPresets) updateBody.brand_presets = payload.brandPresets;
  if (typeof payload.creditBalance === 'number') {
    updateBody.credit_balance = payload.creditBalance;
  }
  if (payload.referenceImages) updateBody.reference_images = payload.referenceImages;
  if (payload.contentHistory) updateBody.content_history = payload.contentHistory;
  if (payload.aiPreferences) updateBody.ai_preferences = payload.aiPreferences;

  if (Object.keys(updateBody).length === 0) {
    return getCurrentUserProfile();
  }

  const { data, error } = await supabase
    .from(TABLES.hgprofiles)
    .update(updateBody)
    .eq('id', DEMO_USER_ID)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to update profile: ${error?.message}`);
  }

  return mapProfile(data);
}
