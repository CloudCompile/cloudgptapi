import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from './supabase';
import { estimateTokens } from './chat-utils';
import { ApiKeyPluginSettings } from './types';
import {
  getModelUsageWeight,
  generateApiKey,
  extractApiKey,
  isPeakHours,
  applyPeakHoursLimit,
  getDailyLimitForPlan
} from './api-keys-utils';

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
  fandomPluginEnabled?: boolean;
  fandomSettings?: ApiKeyPluginSettings;
}

export { getModelUsageWeight, generateApiKey, extractApiKey, isPeakHours, applyPeakHoursLimit, getDailyLimitForPlan } from './api-keys-utils';

export async function validateApiKey(key: string): Promise<ApiKey | null> {
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

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('plan, email')
    .eq('id', data.user_id)
    .maybeSingle();

  await supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  let userEmail = profile?.email;
  let userPlan = profile?.plan || 'free';

  console.log('[validateApiKey] Profile plan for', userEmail, ':', userPlan);

  if (userEmail) {
    userPlan = await applyPlanOverride(userEmail, userPlan, userEmail, 'email');
  }

  if (userEmail === 'tery9tery9@gmail.com') {
    userPlan = 'pro';
  }

  const rawSettings = data.fandom_settings || {};
  const normalizedSettings = {
    maxLoreTokens: rawSettings.maxLoreTokens ?? 800,
    autoSummarize: rawSettings.autoSummarize ?? true,
    cacheMode: rawSettings.cacheMode ?? 'aggressive',
    preferredSources: rawSettings.preferredSources ?? ['fandom', 'wikipedia'],
    plugins: {
      memory: { enabled: Boolean(rawSettings?.plugins?.memory?.enabled) },
      search: { enabled: Boolean(rawSettings?.plugins?.search?.enabled) }
    }
  };

  return {
    id: data.id,
    key: data.key,
    userId: data.user_id,
    name: data.name,
    createdAt: data.created_at,
    lastUsedAt: data.last_used_at,
    rateLimit: data.rate_limit || 10,
    usageCount: data.usage_count || 0,
    plan: (userPlan || 'free').toLowerCase(),
    fandomPluginEnabled: data.fandom_plugin_enabled || false,
    fandomSettings: normalizedSettings
  };
}

export async function trackUsage(
  apiKeyId: string,
  userId: string,
  modelId: string,
  type: 'chat' | 'image' | 'video' | 'mem',
  tokensOrData?: any,
  weight: number = 1
) {
  try {
    const { error } = await supabaseAdmin.rpc('increment_usage_count', {
      key_id: apiKeyId,
      p_weight: weight
    });

    if (error) {
      console.warn('increment_usage_count with weight failed, falling back to single increment', error);
      await supabaseAdmin.rpc('increment_usage_count', { key_id: apiKeyId });
    }
  } catch (err: any) {
    console.error('Error in trackUsage RPC:', err);
    await supabaseAdmin.rpc('increment_usage_count', { key_id: apiKeyId });
  }

  let estimatedTokens = 0;
  if (typeof tokensOrData === 'number') {
    estimatedTokens = tokensOrData;
  } else if (tokensOrData) {
    estimatedTokens = estimateTokens(tokensOrData);
  }

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

const overrideCache = new Set<string>();

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

  if (needsUpdate && !overrideCache.has(userIdOrEmail)) {
    try {
      overrideCache.add(userIdOrEmail);
      const query = supabaseAdmin.from('profiles').update({ plan: newPlan });
      if (identifierType === 'id') {
        await query.eq('id', userIdOrEmail);
      } else {
        await query.eq('email', userIdOrEmail);
      }
      console.log(`[PlanOverride] Updated ${email} to ${newPlan}`);
    } catch (err) {
      console.error(`[PlanOverride] Failed to update plan for ${email}:`, err);
      overrideCache.delete(userIdOrEmail);
    }
  }

  return newPlan;
}

export async function checkRateLimit(key: string, limit: number = 60, type: string = 'default'): Promise<boolean> {
  const windowMs = 60 * 1000;
  const rateLimitKey = `${type}:${key}`;

  try {
    const { data, error } = await supabaseAdmin.rpc('check_rate_limit', {
      p_key: rateLimitKey,
      p_limit: limit,
      p_window_ms: windowMs
    });

    if (error) {
      console.error('[checkRateLimit] RPC error:', error.message);
      return true;
    }

    return (data as any).allowed;
  } catch (err) {
    console.error('[checkRateLimit] Exception:', err);
    return true;
  }
}


export async function checkDailyLimit(key: string, limit: number = 1000, apiKeyId?: string): Promise<boolean> {
  if (apiKeyId) {
    try {
      const { data, error } = await supabaseAdmin.rpc('check_daily_limit', {
        p_key_id: apiKeyId,
        p_daily_limit: limit
      });

      if (error) {
        console.error('[checkDailyLimit] RPC error:', error.message);
        return true;
      }

      return (data as any).allowed;
    } catch (err) {
      console.error('[checkDailyLimit] Exception:', err);
      return true;
    }
  }

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
      return true;
    }

    return (data as any).allowed;
  } catch (err) {
    console.error('[checkDailyLimit] Exception (generic):', err);
    return true;
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
