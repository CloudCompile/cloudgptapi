import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwtDecode from 'jwt-decode';
import { supabaseAdmin } from '@/lib/supabase';

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
    const accessToken = cookieStore.get('kinde_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = jwtDecode<DecodedToken>(accessToken);
    const userId = decoded.sub;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, email, username, name, avatar, role, plan')
      .eq('id', userId)
      .maybeSingle();

    // Merge JWT claims with Supabase profile
    const mergedProfile = {
      id: userId,
      email: profile?.email || decoded.email || '',
      name: profile?.name || [decoded.given_name, decoded.family_name].filter(Boolean).join(' ') || '',
      username: profile?.username || '',
      picture: profile?.avatar || decoded.picture || '',
      plan: profile?.plan || 'free',
      role: profile?.role || 'user',
    };

    return NextResponse.json({ profile: mergedProfile });
  } catch (err) {
    console.error('Settings profile API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
