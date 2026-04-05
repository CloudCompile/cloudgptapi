import { NextRequest } from 'next/server';
import { getCurrentUserId } from '@/lib/kinde-auth';
import { extractApiKey, validateApiKey, applyPlanOverride, applyPeakHoursLimit, ApiKey, getDailyLimitForPlan } from '@/lib/api-keys';
import { supabaseAdmin } from '@/lib/supabase';

export interface AuthResult {
  sessionUserId: string | null;
  rawApiKey: string | null;
  apiKeyInfo: ApiKey | null;
  userPlan: string;
  limit: number;
  dailyLimit: number;
  isSystemRequest: boolean;
  effectiveKey: string;
}

export async function processAuth(
  request: NextRequest,
  requestId: string,
  clientIp: string
): Promise<AuthResult> {
  let sessionUserId: string | null = null;
  try {
    const userId = await getCurrentUserId();
    if (userId) {
      sessionUserId = userId;
      console.log(`[${requestId}] Session User ID: ${sessionUserId}`);
    }
  } catch (authError) {
    console.log(`[${requestId}] Auth context skipped or failed (expected for API keys)`);
  }

  const rawApiKey = extractApiKey(request.headers);
  console.log(`[${requestId}] Raw API Key: ${rawApiKey ? rawApiKey.substring(0, 10) + '...' : 'none'}`);
  
  const effectiveKey = rawApiKey || clientIp;
  let apiKeyInfo: ApiKey | null = null;
  let userPlan = 'free';

  if (rawApiKey) {
    apiKeyInfo = await validateApiKey(rawApiKey);
    if (apiKeyInfo?.plan) {
      userPlan = apiKeyInfo.plan;
    }
  } else if (sessionUserId) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, email')
      .eq('id', sessionUserId)
      .maybeSingle();
    
    if (profile) {
      userPlan = profile.plan || 'free';
      userPlan = await applyPlanOverride(profile.email, userPlan, sessionUserId, 'id');
    }
  }

  userPlan = (userPlan || 'free').toLowerCase();

  let limit = 5;
  let dailyLimit = getDailyLimitForPlan(userPlan);
  
  if (userPlan === 'admin' || userPlan === 'enterprise') {
    limit = 10000; 
  } else if (userPlan === 'ultra') {
    limit = 20;
  } else if (userPlan === 'pro') {
    limit = 10;
  } else if (userPlan === 'developer') {
    limit = 1000;
  } else if (userPlan === 'video_pro') {
    limit = 500;
  } else if (userPlan === 'free') {
    limit = 5;
  }

  if (apiKeyInfo && apiKeyInfo.rateLimit > limit) {
    limit = apiKeyInfo.rateLimit;
  }
  
  limit = applyPeakHoursLimit(limit);
  const isSystemRequest = clientIp === '157.151.169.121';

  return {
    sessionUserId,
    rawApiKey,
    apiKeyInfo,
    userPlan,
    limit,
    dailyLimit,
    isSystemRequest,
    effectiveKey
  };
}
