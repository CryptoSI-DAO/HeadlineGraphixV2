import { getAdminClient } from '@/lib/supabase';

export const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';

export const TABLES = {
  hgprofiles: 'hgprofiles',
  referenceImages: 'reference_images',
  contentPacks: 'content_packs',
  brandKits: 'brand_kits',
} as const;

export const supabase = getAdminClient();
