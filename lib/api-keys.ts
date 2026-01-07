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
  const { data, error } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .eq('key', key)
    .single();

  if (error || !data) {
    return null;
  }

  // Update last used at
  await supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  return {
    id: data.id,
    key: data.key,
    userId: data.user_id,
    name: data.name,
    createdAt: data.created_at,
    lastUsedAt: data.last_used_at,
    rateLimit: data.rate_limit || 60,
    usageCount: data.usage_count || 0,
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

export function getRateLimitInfo(key: string, limit: number = 60, type: string = 'default'): { remaining: number; resetAt: number } {
  const rateLimitKey = `${type}:${key}`;
  const current = rateLimitMap.get(rateLimitKey);
  
  if (!current) {
    return { remaining: limit, resetAt: Date.now() + 60000 };
  }
  
  return {
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}
