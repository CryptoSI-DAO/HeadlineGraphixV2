import { DEMO_USER_ID, TABLES, supabase } from './constants';
import { mapProfile } from './mappers';
import type { UpdateUserPreferencesInput, UserProfile } from './types';

type UpdateUserProfileInput = Partial<Pick<UserProfile, 'name' | 'email'>>;

export async function getCurrentUserProfile(userId?: string): Promise<UserProfile> {
  // If no userId provided, fall back to DEMO_USER_ID for backward compatibility
  const targetUserId = userId || DEMO_USER_ID;
  
  console.log('getCurrentUserProfile - Fetching profile for user ID:', targetUserId);
  console.log('getCurrentUserProfile - Table name:', TABLES.hgprofiles);
  console.log('getCurrentUserProfile - Supabase client URL:', (supabase as any).supabaseUrl);
  
  const { data, error } = await supabase
    .from(TABLES.hgprofiles)
    .select('*')
    .eq('id', targetUserId)
    .maybeSingle();

  console.log('getCurrentUserProfile - Query error:', error);
  console.log('getCurrentUserProfile - Query data:', data);

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to fetch profile: ${error.message}`);
  }

  if (data) {
    console.log('getCurrentUserProfile - Found existing profile for:', targetUserId);
    return mapProfile(data);
  }

  // Only create a new profile if we're not using the demo user ID
  if (targetUserId !== DEMO_USER_ID) {
    console.log('getCurrentUserProfile - Creating new profile for user:', targetUserId);
    const { data: inserted, error: insertError } = await supabase
      .from(TABLES.hgprofiles)
      .upsert(
        {
          id: targetUserId,
          email: '', // Will be updated when we have user info
          name: 'New User',
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

    console.log('getCurrentUserProfile - Insert error:', insertError);
    console.log('getCurrentUserProfile - Insert data:', inserted);

    if (insertError || !inserted) {
      throw new Error(`Failed to create user profile: ${insertError?.message}`);
    }

    return mapProfile(inserted);
  }

  // Create demo profile if needed
  console.log('getCurrentUserProfile - Creating demo profile');
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

  console.log('getCurrentUserProfile - Demo insert error:', insertError);
  console.log('getCurrentUserProfile - Demo insert data:', inserted);

  if (insertError || !inserted) {
    throw new Error(`Failed to create demo profile: ${insertError?.message}`);
  }

  return mapProfile(inserted);
}

export async function updateUserPreferences(
  payload: UpdateUserPreferencesInput,
  userId?: string
): Promise<UserProfile> {
  // If no userId provided, fall back to DEMO_USER_ID for backward compatibility
  const targetUserId = userId || DEMO_USER_ID;
  
  console.log('updateUserPreferences - Updating profile for user ID:', targetUserId);
  
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
    return getCurrentUserProfile(targetUserId);
  }

  const { data, error } = await supabase
    .from(TABLES.hgprofiles)
    .update(updateBody)
    .eq('id', targetUserId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to update profile: ${error?.message}`);
  }

  return mapProfile(data);
}

export async function updateUserProfile(
  payload: UpdateUserProfileInput,
  userId?: string
): Promise<UserProfile> {
  const targetUserId = userId || DEMO_USER_ID;

  const updateBody: Record<string, unknown> = {};

  if (typeof payload.name === 'string') updateBody.name = payload.name;
  if (typeof payload.email === 'string') updateBody.email = payload.email;

  if (Object.keys(updateBody).length === 0) {
    return getCurrentUserProfile(targetUserId);
  }

  const { data, error } = await supabase
    .from(TABLES.hgprofiles)
    .update(updateBody)
    .eq('id', targetUserId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(`Failed to update profile: ${error?.message}`);
  }

  return mapProfile(data);
}
