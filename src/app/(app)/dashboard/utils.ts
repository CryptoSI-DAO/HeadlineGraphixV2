import type { UserPreferences } from '@/lib/types';

export const MIN_FIELDS = 3;

export function normalizeList(values: string[], min = MIN_FIELDS) {
  const next = [...values];
  while (next.length < min) {
    next.push('');
  }
  return next;
}

export function normalizePreferences(prefs: UserPreferences): UserPreferences {
  return {
    focusTopics: normalizeList(prefs.focusTopics),
    backlinkUrls: normalizeList(prefs.backlinkUrls),
  };
}

export function sanitizePreferences(prefs: UserPreferences): UserPreferences {
  const clean = (values: string[]) =>
    values.map(value => value.trim()).filter(value => value.length > 0);
  return {
    focusTopics: clean(prefs.focusTopics),
    backlinkUrls: clean(prefs.backlinkUrls),
  };
}
