import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import { supabaseAdmin } from '@/lib/supabase';
import { applyPlanOverride } from '@/lib/api-keys';

interface DecodedToken {
  sub: string;
  email?: string;
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

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, plan, email')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    if (profile?.email) {
      profile.plan = await applyPlanOverride(profile.email, profile.plan || 'free', userId, 'id');
    }

    return NextResponse.json({ profile: profile ? { role: profile.role, plan: profile.plan } : null });
  } catch (err) {
    console.error('Profile API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
