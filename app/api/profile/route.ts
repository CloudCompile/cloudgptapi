import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwtDecode from 'jwt-decode';
import { supabaseAdmin } from '@/lib/supabase';
import { applyPlanOverride } from '@/lib/api-keys';

interface DecodedToken {
  sub: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
  [key: string]: any;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('kinde_access_token')?.value
      || cookieStore.get('kinde_id_token')?.value
      || cookieStore.get('id_token')?.value
      || cookieStore.get('access_token')?.value
      || null;

    if (!accessToken) {
      console.error('[Profile] No Kinde token cookie found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwtDecode<DecodedToken>(accessToken);
    const userId = decoded.sub;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, plan, email, name, avatar, username')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    if (profile?.email) {
      profile.plan = await applyPlanOverride(profile.email, profile.plan || 'free', userId, 'id');
    }

    return NextResponse.json({
      profile: {
        role: profile?.role || 'user',
        plan: profile?.plan || 'free',
        // Name: prefer Supabase profile -> JWT name -> JWT given/family -> username -> email prefix
        name: profile?.name 
          || decoded.name 
          || [decoded.given_name, decoded.family_name].filter(Boolean).join(' ') 
          || profile?.username
          || (profile?.email || decoded.email)?.split('@')[0] 
          || '',
        email: profile?.email || decoded.email || '',
        picture: profile?.avatar || decoded.picture || '',
      },
    });
  } catch (err) {
    console.error('Profile API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
