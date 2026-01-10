import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from './supabase.ts';
import { estimateTokens } from './chat-utils.ts';

export interface ApiKey {
  id: string;
  key: string;
  userId: string;
  name: string;
  createdAt: string;
  lastUsedAt?: string;
  rateLimit: number;
  usageCount: number;
  plan?: string;
}

// Generate a new API key with the cgpt_ prefix
export function generateApiKey(): string {
  const prefix = 'cgpt_';
  const key = uuidv4().replace(/-/g, '');
  return `${prefix}${key}`;
}

// Extract API key from request headers (Bearer token)
export function extractApiKey(headers: Headers): string | null {
  const authHeader = headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const key = authHeader.substring(7);
    // Validate key format before returning
    if (key.startsWith('cgpt_') && key.length === 37) {
      return key;
    }
  }
  return null;
}

/**
 * Check if the current time is during peak hours (5:00 PM to 5:00 AM UTC)
 * Peak hours are when usage is high and we want to apply lower rate limits
 */
export function isPeakHours(): boolean {
  const now = new Date();
  const hour = now.getUTCHours();
  // Peak hours: 17:00 (5 PM) to 05:00 (5 AM) UTC
  // This means hours 17, 18, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4
  return hour >= 17 || hour < 5;
}

/**
 * Apply peak hours reduction to rate limits
 * During peak hours (5 PM - 5 AM), reduce rate limits by 50% for all users
 */
export function applyPeakHoursLimit(baseLimit: number): number {
  if (isPeakHours()) {
    return Math.max(1, Math.floor(baseLimit * 0.5)); // 50% reduction, minimum 1
  }
  return baseLimit;
}

  // Validate API key and return user info
  export async function validateApiKey(key: string): Promise<ApiKey | null> {
    // First get the API key
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('key', key)
      .maybeSingle();
  
    if (error) {
      console.error('[validateApiKey] Database error:', error.message);
      return null;
    }

    if (!data) {
      console.error('[validateApiKey] Key not found');
      return null;
    }
  
    // Then get the profile separately to avoid relationship issues
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, email')
      .eq('id', data.user_id)
      .maybeSingle();
  
    // Update last used at
    await supabaseAdmin
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', data.id);
  
    let userPlan = profile?.plan || 'free';
    const userEmail = profile?.email;
  
    console.log(`[validateApiKey] Key validated for user: ${data.user_id}, profile email: ${userEmail}, db plan: ${userPlan}`);
  
    // Manual override for specific users requested by admin
    if (userEmail) {
      userPlan = await applyPlanOverride(userEmail, userPlan, userEmail, 'email');
    }
  
    return {
      id: data.id,
      key: data.key,
      userId: data.user_id,
      name: data.name,
      createdAt: data.created_at,
      lastUsedAt: data.last_used_at,
      rateLimit: data.rate_limit || 10,
      usageCount: data.usage_count || 0,
      plan: userPlan
    };
  }

  // Track usage for an API key
export async function trackUsage(
  apiKeyId: string, 
  userId: string, 
  modelId: string, 
  type: 'chat' | 'image' | 'video' | 'mem',
  tokensOrData?: any,
  weight: number = 1
) {
  // Increment usage count on the API key
  // We pass the weight to the RPC (requires updated RPC in Supabase)
  try {
    const { error } = await supabaseAdmin.rpc('increment_usage_count', { 
      key_id: apiKeyId,
      p_weight: weight 
    });

    if (error) {
      // Fallback if RPC doesn't support weight yet
      console.warn('increment_usage_count with weight failed, falling back to single increment', error);
      await supabaseAdmin.rpc('increment_usage_count', { key_id: apiKeyId });
    }
  } catch (err: any) {
    console.error('Error in trackUsage RPC:', err);
    // Try fallback anyway
    await supabaseAdmin.rpc('increment_usage_count', { key_id: apiKeyId });
  }

  // Estimate tokens if not provided
  let estimatedTokens = 0;
  if (typeof tokensOrData === 'number') {
    estimatedTokens = tokensOrData;
  } else if (tokensOrData) {
    estimatedTokens = estimateTokens(tokensOrData);
  }

  // Log detailed usage
  await supabaseAdmin
    .from('usage_logs')
    .insert({
      api_key_id: apiKeyId,
      user_id: userId,
      model_id: modelId,
      type: type,
      tokens: estimatedTokens > 0 ? estimatedTokens : null,
      timestamp: new Date().toISOString(),
    });
}

/**
 * Apply manual plan overrides for specific users
 * Returns the corrected plan name
 */
export async function applyPlanOverride(email: string, currentPlan: string, userIdOrEmail: string, identifierType: 'id' | 'email' = 'email'): Promise<string> {
  if (!email) return currentPlan;

  let newPlan = currentPlan;
  let needsUpdate = false;

  if (email === 'mschneider2492@gmail.com' && currentPlan !== 'developer') {
    newPlan = 'developer';
    needsUpdate = true;
  } else if ((email === 'sakurananachan645@gmail.com' || email === 'bakatsun09@gmail.com') && currentPlan !== 'pro') {
    newPlan = 'pro';
    needsUpdate = true;
  }

  if (needsUpdate) {
    try {
      const query = supabaseAdmin.from('profiles').update({ plan: newPlan });
      if (identifierType === 'id') {
        await query.eq('id', userIdOrEmail);
      } else {
        await query.eq('email', userIdOrEmail);
      }
      console.log(`[PlanOverride] Updated ${email} to ${newPlan}`);
    } catch (err) {
      console.error(`[PlanOverride] Failed to update plan for ${email}:`, err);
    }
  }

  return newPlan;
}

/**
 * Global rate limiting using Supabase
 */
export async function checkRateLimit(key: string, limit: number = 60, type: string = 'default'): Promise<boolean> {
  const windowMs = 60 * 1000; // 1 minute window
  const rateLimitKey = `${type}:${key}`;
  
  try {
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_key: rateLimitKey,
      p_limit: limit,
      p_window_ms: windowMs
    });

    if (error) {
      console.error('[checkRateLimit] RPC error:', error.message);
      return true; // Fallback to allow on error
    }

    return (data as any).allowed;
  } catch (err) {
    console.error('[checkRateLimit] Exception:', err);
    return true; // Fallback to allow on error
  }
}

export async function checkDailyLimit(key: string, limit: number = 1000, apiKeyId?: string): Promise<boolean> {
  // If we have an API key ID, use the more accurate api_keys table tracking
  if (apiKeyId) {
    try {
      const { data, error } = await supabaseAdmin.rpc('check_daily_limit', {
        p_key_id: apiKeyId,
        p_daily_limit: limit
      });

      if (error) {
        console.error('[checkDailyLimit] RPC error:', error.message);
        return true; // Fallback to allow on error
      }

      return (data as any).allowed;
    } catch (err) {
      console.error('[checkDailyLimit] Exception:', err);
      return true; // Fallback to allow on error
    }
  }

  // Fallback for IP-based or generic tracking using rate_limits table
  // Calculate ms until next midnight UTC
  const now = new Date();
  const nextMidnight = new Date();
  nextMidnight.setUTCHours(24, 0, 0, 0);
  const windowMs = nextMidnight.getTime() - now.getTime();
  
  const dailyKey = `daily:${key}`;
  
  try {
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_key: dailyKey,
      p_limit: limit,
      p_window_ms: windowMs
    });

    if (error) {
      console.error('[checkDailyLimit] RPC error (generic):', error.message);
      return true; // Fallback to allow on error
    }

    return (data as any).allowed;
  } catch (err) {
    console.error('[checkDailyLimit] Exception (generic):', err);
    return true; // Fallback to allow on error
  }
}

export async function getRateLimitInfo(key: string, limit: number = 60, type: string = 'default'): Promise<{ remaining: number; resetAt: number; limit: number }> {
  const rateLimitKey = `${type}:${key}`;
  
  try {
    const { data, error } = await supabaseAdmin
      .from('rate_limits')
      .select('count, reset_at')
      .eq('key', rateLimitKey)
      .maybeSingle();

    if (error || !data) {
      return { remaining: limit, resetAt: Date.now() + 60000, limit };
    }

    const resetAt = new Date(data.reset_at).getTime();
    return {
      remaining: Math.max(0, limit - data.count),
      resetAt,
      limit
    };
  } catch (err) {
    console.error('[getRateLimitInfo] Exception:', err);
    return { remaining: limit, resetAt: Date.now() + 60000, limit };
  }
}

export async function getDailyLimitInfo(key: string, limit: number = 1000, apiKeyId?: string): Promise<{ remaining: number; resetAt: number; limit: number }> {
  // If we have an API key ID, use the api_keys table
  if (apiKeyId) {
    try {
      const { data, error } = await supabaseAdmin
        .from('api_keys')
        .select('daily_usage_count, last_reset_at')
        .eq('id', apiKeyId)
        .maybeSingle();

      const nextMidnight = new Date();
      nextMidnight.setUTCHours(24, 0, 0, 0);
      const resetAt = nextMidnight.getTime();

      if (error || !data) {
        return { remaining: limit, resetAt, limit };
      }

      // Check if it's a new day
      const lastReset = new Date(data.last_reset_at);
      const isNewDay = lastReset.getUTCDate() !== new Date().getUTCDate();
      const currentUsage = isNewDay ? 0 : data.daily_usage_count;

      return {
        remaining: Math.max(0, limit - currentUsage),
        resetAt,
        limit
      };
    } catch (err) {
      console.error('[getDailyLimitInfo] Exception:', err);
      const nextMidnight = new Date();
      nextMidnight.setUTCHours(24, 0, 0, 0);
      return { remaining: limit, resetAt: nextMidnight.getTime(), limit };
    }
  }

  // Fallback for IP-based or generic tracking
  const dailyKey = `daily:${key}`;
  
  try {
    const { data, error } = await supabaseAdmin
      .from('rate_limits')
      .select('count, reset_at')
      .eq('key', dailyKey)
      .maybeSingle();

    if (error || !data) {
      const nextMidnight = new Date();
      nextMidnight.setUTCHours(24, 0, 0, 0);
      return { remaining: limit, resetAt: nextMidnight.getTime(), limit };
    }

    const resetAt = new Date(data.reset_at).getTime();
    return {
      remaining: Math.max(0, limit - data.count),
      resetAt,
      limit
    };
  } catch (err) {
    console.error('[getDailyLimitInfo] Exception:', err);
    const nextMidnight = new Date();
    nextMidnight.setUTCHours(24, 0, 0, 0);
    return { remaining: limit, resetAt: nextMidnight.getTime(), limit };
  }
}
