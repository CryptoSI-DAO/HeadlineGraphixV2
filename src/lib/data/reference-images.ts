import { TABLES, supabase } from './constants';
import { mapReferenceImage } from './mappers';
import type { ReferenceImageMeta } from './types';

export async function listReferenceImages(userId: string): Promise<ReferenceImageMeta[]> {
  const { data, error } = await supabase
    .from(TABLES.referenceImages)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list reference images: ${error.message}`);
  }

  return (data ?? []).map(mapReferenceImage);
}
