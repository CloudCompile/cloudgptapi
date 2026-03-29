import { NextResponse, NextRequest } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { supabaseAdmin } from '@/lib/supabase';
import { applyPlanOverride } from '@/lib/api-keys';
import { logErrorToSupabase } from '@/lib/error-logger';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
  };

  try {
    const { isAuthenticated, getUser } = getKindeServerSession(request as any);
    
    if (!(await isAuthenticated())) {
      console.error('[Profile] Not authenticated with Kinde');
      await logErrorToSupabase('error', 'Unauthorized access attempt to GET /api/profile', '/api/profile');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }

    const user = await getUser();
    if (!user || !user.id) {
      await logErrorToSupabase('error', 'Unauthorized access attempt to GET /api/profile: No user ID', '/api/profile');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers });
    }
    const userId = user.id;

    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('role, plan, email, name, avatar, username')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500, headers });
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
    }, { headers });
  } catch (err) {
    console.error('Profile API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers });
  }
}
