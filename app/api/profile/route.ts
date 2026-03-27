import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { applyPlanOverride } from '@/lib/api-keys';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
