import { NextResponse } from 'next/server';
import { getCurrentUserProfile, DEMO_USER_ID, updateUserProfile } from '@/lib/data';
import { createClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
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

export async function GET(request: Request) {
  try {
    // Log authentication information for debugging
    const authHeader = request.headers.get('authorization');
    console.log('Profile API - Auth header:', authHeader ? 'Present' : 'Missing');
    console.log('Profile API - Supabase URL:', env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Get the authenticated user ID to fetch their profile
    let userId: string | undefined;
    
    if (authHeader) {
      // Create a Supabase client to verify the token and get user info
      const supabase = createClient(
        env.NEXT_PUBLIC_SUPABASE_URL || '',
        env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      
      const token = authHeader.replace('Bearer ', '');
      console.log('Profile API - Verifying token (first 20 chars):', token.substring(0, 20) + '...');
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (error) {
        console.error('Profile API - Error verifying token:', error.message);
        console.error('Profile API - Error details:', JSON.stringify(error, null, 2));
      } else if (user) {
        console.log('Profile API - Authenticated user ID:', user.id);
        console.log('Profile API - Authenticated user email:', user.email);
        console.log('Profile API - User app_metadata:', user.app_metadata);
        console.log('Profile API - User user_metadata:', user.user_metadata);
        
        // Set the user ID for profile lookup
        userId = user.id;
        console.log('Profile API - Using authenticated user ID:', userId);
      } else {
        console.log('Profile API - No user found for token');
      }
    } else {
      console.log('Profile API - No auth header provided, falling back to demo user');
    }
    
    const profile = await getCurrentUserProfile(userId);
    console.log('Profile API - Returning profile for ID:', profile.id);
    console.log('Profile API - Profile email:', profile.email);
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

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL || '',
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await request.json();
    const name = typeof payload.name === 'string' ? payload.name : undefined;
    const email = typeof payload.email === 'string' ? payload.email : undefined;

    if (!name && !email) {
      return NextResponse.json({ error: 'No valid profile fields were provided.' }, { status: 400 });
    }

    const updated = await updateUserProfile({ name, email }, user.id);
    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error('Failed to update profile', error);
    return NextResponse.json({ error: 'Unable to update profile' }, { status: 500 });
  }
}
