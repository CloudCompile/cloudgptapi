import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from './supabase';

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

  // Validate API key and return user info
  export async function validateApiKey(key: string): Promise<ApiKey | null> {
    // First get the API key
    const { data, error } = await supabaseAdmin
      .from('api_keys')
      .select('*')
      .eq('key', key)
      .single();
  
    if (error || !data) {
      console.error('[validateApiKey] Key not found or error:', error?.message);
      return null;
    }
  
    // Then get the profile separately to avoid relationship issues
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, email')
      .eq('id', data.user_id)
      .single();
  
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
export async function trackUsage(apiKeyId: string, userId: string, modelId: string, type: 'chat' | 'image' | 'video' | 'mem') {
  // Increment usage count on the API key
  await supabaseAdmin.rpc('increment_usage_count', { key_id: apiKeyId });

  // Log detailed usage
  await supabaseAdmin
    .from('usage_logs')
    .insert({
      api_key_id: apiKeyId,
      user_id: userId,
      model_id: modelId,
      type: type,
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
 * In-memory rate limiting (Fallback if DB rate limiting is too slow)
 * For production, we'd ideally use Redis or a DB-level check.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number = 60, type: string = 'default'): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const rateLimitKey = `${type}:${key}`;
  
  const current = rateLimitMap.get(rateLimitKey);
  
  if (!current || now > current.resetAt) {
    rateLimitMap.set(rateLimitKey, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (current.count >= limit) {
    return false;
  }
  
  current.count++;
  return true;
}

export function getRateLimitInfo(key: string, limit: number = 60, type: string = 'default'): { remaining: number; resetAt: number; limit: number } {
  const now = Date.now();
  const rateLimitKey = `${type}:${key}`;
  const current = rateLimitMap.get(rateLimitKey);
  
  if (!current || now > current.resetAt) {
    return { remaining: limit, resetAt: now + 60000, limit };
  }
  
  return {
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
    limit,
  };
}
