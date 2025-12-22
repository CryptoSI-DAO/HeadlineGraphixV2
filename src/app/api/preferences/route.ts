import { NextResponse } from 'next/server';
import { getCurrentUserProfile, updateUserPreferences } from '@/lib/data';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

export async function GET(request: Request) {
  try {
    // Get authenticated user ID
    const authHeader = request.headers.get('authorization');
    let userId: string | undefined;
    
    if (authHeader) {
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL || '',
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        userId = user.id;
        console.log('Preferences API GET - Using authenticated user ID:', userId);
      }
    }
    
    const profile = await getCurrentUserProfile(userId);
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
    // Get authenticated user ID
    const authHeader = request.headers.get('authorization');
    let userId: string | undefined;
    
    if (authHeader) {
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL || '',
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        userId = user.id;
        console.log('Preferences API PUT - Using authenticated user ID:', userId);
      }
    }
    
    const payload = await request.json();
    const focusTopics = Array.isArray(payload.focusTopics) ? payload.focusTopics : undefined;
    const backlinkUrls = Array.isArray(payload.backlinkUrls) ? payload.backlinkUrls : undefined;

    if (!focusTopics && !backlinkUrls) {
      return NextResponse.json({ error: 'No valid preference fields were provided.' }, { status: 400 });
    }

    const updated = await updateUserPreferences({
      focusTopics,
      backlinkUrls,
    }, userId);

    return NextResponse.json({
      focusTopics: updated.focusTopics ?? [],
      backlinkUrls: updated.backlinkUrls ?? [],
    });
  } catch (error) {
    console.error('Failed to update preferences', error);
    return NextResponse.json({ error: 'Unable to update preferences' }, { status: 500 });
  }
}
