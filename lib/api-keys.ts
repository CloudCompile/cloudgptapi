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

  console.log('[validateApiKey] Found API key for user_id:', data.user_id, '| key_name:', data.name);

  const keyLevelPlan: string | null = (data as any).plan || null;
  if (keyLevelPlan) {
    console.log('[validateApiKey] Using key-level plan override:', keyLevelPlan);
  }

  // 2. Profile lookup (standard path)
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('plan, email')
    .eq('id', data.user_id)
    .maybeSingle();

  if (profileError) {
    console.error('[validateApiKey] Profile query error:', profileError.message);
  }

  if (!profile) {
    console.warn('[validateApiKey] No profile found for user_id:', data.user_id,
      '— plan will default to free unless overridden by subscription or key-level plan');
  }

  await supabaseAdmin
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', data.id);

  let userEmail = profile?.email;
  let userPlan = profile?.plan || 'free';

  console.log('[validateApiKey] Profile plan for user_id', data.user_id, '(email:', userEmail, ') :', userPlan);

  if (!keyLevelPlan && userPlan === 'free') {
    console.log('[validateApiKey] Profile shows free — checking user_subscriptions for active subscription...');
    const { data: subscription } = await supabaseAdmin
      .from('user_subscriptions')
      .select('stripe_price_id, status, stripe_current_period_end')
      .eq('user_id', data.user_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscription) {
      const isExpired = subscription.stripe_current_period_end
        ? new Date(subscription.stripe_current_period_end) < new Date()
        : false;

      if (!isExpired) {
        const priceId = subscription.stripe_price_id || '';
        console.log('[validateApiKey] Active subscription found! price_id:', priceId);

        const ULTRA_PRICE_IDS = (process.env.STRIPE_ULTRA_PRICE_IDS || '').split(',').map(s => s.trim()).filter(Boolean);
        const PRO_PRICE_IDS = (process.env.STRIPE_PRO_PRICE_IDS || '').split(',').map(s => s.trim()).filter(Boolean);

        if (ULTRA_PRICE_IDS.length > 0 && ULTRA_PRICE_IDS.some(pid => priceId.includes(pid))) {
          userPlan = 'ultra';
          console.log('[validateApiKey] Subscription resolves to ULTRA');
        } else if (PRO_PRICE_IDS.length > 0 && PRO_PRICE_IDS.some(pid => priceId.includes(pid))) {
          userPlan = 'pro';
          console.log('[validateApiKey] Subscription resolves to PRO');
        } else {
          userPlan = 'pro';
          console.warn('[validateApiKey] Active subscription found but STRIPE_ULTRA_PRICE_IDS / STRIPE_PRO_PRICE_IDS env vars not set. Defaulting to pro. Configure env vars for accurate plan detection.');
        }

        if (profile) {
          supabaseAdmin.from('profiles').update({ plan: userPlan }).eq('id', data.user_id).then(() => {
              console.log('[validateApiKey] Synced plan', userPlan, 'back to profile for user_id:', data.user_id);
            }, (err: any) => {
              console.warn('[validateApiKey] Failed to sync plan to profile:', err?.message);
            });
        }
      } else {
        console.log('[validateApiKey] Subscription is expired.');
      }
    } else {
      console.log('[validateApiKey] No active subscription found for user_id:', data.user_id);
    }
  }

  if (userEmail) {
    userPlan = await applyPlanOverride(userEmail, userPlan, userEmail, 'email');
  }

  if (keyLevelPlan) {
    userPlan = keyLevelPlan;
  }

  console.log('[validateApiKey] FINAL resolved plan for user_id', data.user_id, ':', userPlan);

  const rawSettings = data.fandom_settings || {};
  const normalizedSettings = {
    maxLoreTokens: rawSettings.maxLoreTokens ?? 800,
    autoSummarize: rawSettings.autoSummarize ?? true,
    cacheMode: rawSettings.cacheMode ?? 'aggressive',
    preferredSources: rawSettings.preferredSources ?? ['fandom', 'wikipedia'],
    wikiBaseUrl: rawSettings.wikiBaseUrl ?? undefined,
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

  const { error: insertError } = await supabaseAdmin
    .from('usage_logs')
    .insert({
      api_key_id: apiKeyId,
      user_id: userId,
      model_id: modelId,
      type: type,
      tokens: estimatedTokens > 0 ? estimatedTokens : null,
      timestamp: new Date().toISOString(),
    });

  if (insertError) {
    console.error('[trackUsage] Failed to insert usage log:', insertError.message, {
      apiKeyId,
      userId,
      modelId,
      type,
    });
  }
}

const overrideCache = new Set<string>();
const OVERRIDE_CACHE_MAX = 5000;

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
      if (overrideCache.size >= OVERRIDE_CACHE_MAX) overrideCache.clear();
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
      console.error('[checkRateLimit] RPC error — rate limiting bypassed:', error.message);
      return true;
    }

    return (data as any).allowed;
  } catch (err) {
    console.error('[checkRateLimit] Exception — rate limiting bypassed:', err);
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
        console.error('[checkDailyLimit] RPC error — daily limit bypassed:', error.message);
        return true;
      }

      return (data as any).allowed;
    } catch (err) {
      console.error('[checkDailyLimit] Exception — daily limit bypassed:', err);
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
      const today = new Date();
      const isNewDay =
        lastReset.getUTCFullYear() !== today.getUTCFullYear() ||
        lastReset.getUTCMonth() !== today.getUTCMonth() ||
        lastReset.getUTCDate() !== today.getUTCDate();
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
