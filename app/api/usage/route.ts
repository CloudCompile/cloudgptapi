import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/kinde-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { getDailyLimitInfo, applyPlanOverride, applyPeakHoursLimit, isPeakHours } from '@/lib/api-keys';
import { getCorsHeaders } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
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
    let dailyLimit = 1000;
    if (userPlan === 'admin' || userPlan === 'enterprise') {
      dailyLimit = 100000;
    } else if (userPlan === 'pro') {
      dailyLimit = 2000;
    } else if (userPlan === 'developer') {
      dailyLimit = 5000;
    } else if (userPlan === 'free') {
      dailyLimit = 1000;
    }

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
