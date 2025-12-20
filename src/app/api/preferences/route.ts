import { NextResponse } from 'next/server';
import { getCurrentUserProfile, updateUserPreferences } from '@/lib/data';

export async function GET() {
  try {
    const profile = await getCurrentUserProfile();
    return NextResponse.json({
      focusTopics: profile.focusTopics ?? [],
      backlinkUrls: profile.backlinkUrls ?? [],
    });
  } catch (error) {
    console.error('Failed to load preferences', error);
    return NextResponse.json({ error: 'Unable to load preferences' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const payload = await request.json();
    const focusTopics = Array.isArray(payload.focusTopics) ? payload.focusTopics : undefined;
    const backlinkUrls = Array.isArray(payload.backlinkUrls) ? payload.backlinkUrls : undefined;

    if (!focusTopics && !backlinkUrls) {
      return NextResponse.json({ error: 'No valid preference fields were provided.' }, { status: 400 });
    }

    const updated = await updateUserPreferences({
      focusTopics,
      backlinkUrls,
    });

    return NextResponse.json({
      focusTopics: updated.focusTopics ?? [],
      backlinkUrls: updated.backlinkUrls ?? [],
    });
  } catch (error) {
    console.error('Failed to update preferences', error);
    return NextResponse.json({ error: 'Unable to update preferences' }, { status: 500 });
  }
}
