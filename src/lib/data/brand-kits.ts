import { TABLES, supabase } from './constants';
import { mapBrandKit } from './mappers';
import type { BrandKit } from './types';

export async function listBrandKits(userId: string): Promise<BrandKit[]> {
  const { data, error } = await supabase
    .from(TABLES.brandKits)
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list brand kits: ${error.message}`);
  }

  return (data ?? []).map(mapBrandKit);
}

export async function getBrandKitById(id: string, userId: string): Promise<BrandKit | null> {
  const { data, error } = await supabase
    .from(TABLES.brandKits)
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get brand kit: ${error.message}`);
  }

  return mapBrandKit(data);
}

export async function countBrandKits(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from(TABLES.brandKits)
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to count brand kits: ${error.message}`);
  }

  return count ?? 0;
}
