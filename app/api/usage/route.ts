import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/kinde-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getDailyLimitInfo, applyPlanOverride, applyPeakHoursLimit, isPeakHours, getDailyLimitForPlan } from '@/lib/api-keys';
import { getCorsHeaders } from '@/lib/utils';
import { logErrorToSupabase } from '@/lib/error-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    
    if (!userId) {
      await logErrorToSupabase('warn', 'Unauthorized access attempt to GET /api/usage: No Kinde session found', '/api/usage');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders() });
    }

    // Get user profile to determine plan
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('plan, email')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500, headers: getCorsHeaders() });
    }

    let userPlan = profile?.plan || 'free';
    if (profile?.email) {
      userPlan = await applyPlanOverride(profile.email, userPlan, userId, 'id');
    }

    // Determine daily limit based on plan (sync with v1/chat/completions/route.ts)
    const dailyLimit = getDailyLimitForPlan(userPlan);
    
    // Determine RPM limit (for display in dashboard)
    let rpmLimit = 5;
    if (userPlan === 'admin' || userPlan === 'enterprise') {
      rpmLimit = 10000;
    } else if (userPlan === 'pro' || userPlan === 'ultra') {
      rpmLimit = 10;
    } else if (userPlan === 'developer') {
      rpmLimit = 1000;
    } else if (userPlan === 'video_pro') {
      rpmLimit = 500;
    }
    const finalRpmLimit = applyPeakHoursLimit(rpmLimit);

    // For daily limit info, we don't apply peak hours reduction to the quota itself
    // to avoid locking out users who already used their quota.
    // RPM is reduced in the chat completions route instead.
    const finalDailyLimit = dailyLimit;

    // Get usage info
    // For session users, we use their userId as the tracking key
    const dailyInfo = await getDailyLimitInfo(userId, finalDailyLimit);

    return NextResponse.json({
      plan: userPlan,
      limit: finalDailyLimit,
      rpmLimit: finalRpmLimit,
      remaining: dailyInfo.remaining,
      used: Math.max(0, finalDailyLimit - dailyInfo.remaining),
      resetAt: dailyInfo.resetAt,
      isPeakHours: isPeakHours()
    }, {
      headers: getCorsHeaders()
    });

  } catch (err) {
    console.error('Usage API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: getCorsHeaders() });
  }
}
