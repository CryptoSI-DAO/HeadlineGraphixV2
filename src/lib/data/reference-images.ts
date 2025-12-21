import { DEMO_USER_ID, TABLES, supabase } from './constants';
import { mapReferenceImage } from './mappers';
import type { ReferenceImageMeta } from './types';

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
