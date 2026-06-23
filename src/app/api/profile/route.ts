import { NextResponse } from 'next/server';
import { getCurrentUserProfile, updateUserProfile } from '@/lib/data';
import type { UserProfile } from '@/lib/data';
import { getUserId } from '@/lib/auth';

const FALLBACK_PROFILE: UserProfile = {
  id: 'fallback',
  email: '',
  name: 'Guest',
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
    const userId = await getUserId();

    const profile = await getCurrentUserProfile(userId ?? undefined);
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Failed to load profile', error);
    return NextResponse.json(
      { profile: FALLBACK_PROFILE, warning: 'Serving fallback profile data.' },
      { status: 200, headers: { 'x-fallback-profile': '1' } },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const name = typeof payload.name === 'string' ? payload.name : undefined;
    const email = typeof payload.email === 'string' ? payload.email : undefined;

    if (!name && !email) {
      return NextResponse.json({ error: 'No valid profile fields were provided.' }, { status: 400 });
    }

    const updated = await updateUserProfile({ name, email }, userId);
    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error('Failed to update profile', error);
    return NextResponse.json({ error: 'Unable to update profile' }, { status: 500 });
  }
}
