import { DEMO_USER_ID, TABLES, supabase } from './constants';
import type { SaveContentPackInput } from './types';

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
