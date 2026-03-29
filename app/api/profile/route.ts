import { NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { applyPlanOverride } from '@/lib/api-keys';

export async function GET() {
  try {
    const { isAuthenticated, getUser } = getKindeServerSession();
    
    if (!(await isAuthenticated())) {
      console.error('[Profile] Not authenticated with Kinde');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await getUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, plan, email, name, avatar, username')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    // Determine derived properties
    const email = profile?.email || user.email || '';
    const name = profile?.name 
      || [user.given_name, user.family_name].filter(Boolean).join(' ') 
      || profile?.username
      || (email).split('@')[0] 
      || '';
    const avatar = profile?.avatar || user.picture || '';

    let plan = profile?.plan || 'free';
    if (email) {
      plan = await applyPlanOverride(email, plan, userId, 'id');
    }

    return NextResponse.json({
      profile: {
        role: profile?.role || 'user',
        plan: plan,
        name: name,
        email: email,
        picture: avatar,
      },
    });
  } catch (err) {
    console.error('Profile API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
