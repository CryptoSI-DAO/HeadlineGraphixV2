import { NextResponse } from 'next/server';
import { getCurrentUserProfile, DEMO_USER_ID } from '@/lib/data';
import type { UserProfile } from '@/lib/data';

const FALLBACK_PROFILE: UserProfile = {
  id: DEMO_USER_ID,
  email: 'jane.doe@example.com',
  name: 'Jane Doe',
  focusTopics: [],
  backlinkUrls: [],
  brandPresets: [],
  creditBalance: 0,
  referenceImages: [],
  contentHistory: [],
  aiPreferences: {},
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

export async function GET() {
  try {
    const profile = await getCurrentUserProfile();
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Failed to load profile', error);
    return NextResponse.json(
      {
        profile: FALLBACK_PROFILE,
        warning: 'Serving fallback profile data. Check Supabase connection.',
      },
      { status: 200, headers: { 'x-fallback-profile': '1' } }
    );
  }
}
