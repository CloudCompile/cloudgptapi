import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { getCurrentUserId } from '@/lib/kinde-auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '20');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const { data: logs, error: logsError } = await supabaseAdmin
      .from('usage_logs')
      .select('*')
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (logsError) {
      console.error('[GET /api/admin/usage/stats] Error fetching logs:', logsError);
      return NextResponse.json({ error: 'Failed to fetch usage stats', details: logsError.message }, { status: 500 });
    }

    if (!logs || logs.length === 0) {
      return NextResponse.json({
        summary: { totalRequests: 0, totalTokens: 0, days },
        topModels: [],
        topProviders: [],
        topUsers: [],
        chartData: [],
      });
    }

    const modelUsage: Record<string, { count: number; tokens: number }> = {};
    const providerUsage: Record<string, { count: number; tokens: number }> = {};
    const userUsage: Record<string, { count: number; tokens: number }> = {};
    const userIds = new Set<string>();
    let totalRequests = 0;
    let totalTokens = 0;

    const getProvider = (modelId: string): string => {
      const id = modelId.toLowerCase();
      if (id.includes('gpt') || id.includes('openai')) return 'OpenAI';
      if (id.includes('claude') || id.includes('anthropic')) return 'Anthropic';
      if (id.includes('gemini') || id.includes('gemma') || id.includes('google')) return 'Google';
      if (id.includes('deepseek')) return 'DeepSeek';
      if (id.includes('grok') || id.includes('xai')) return 'xAI';
      if (id.includes('llama') || id.includes('meta')) return 'Meta';
      if (id.includes('qwen') || id.includes('alibaba')) return 'Alibaba';
      if (id.includes('minimax') || id.includes('nova')) return 'MiniMax';
      if (id.includes('mistral')) return 'Mistral';
      if (id.includes('glm') || id.includes('zhipu')) return 'Zhipu';
      if (id.includes('kimi') || id.includes('moonshot')) return 'Moonshot';
      if (id.includes('phi') || id.includes('microsoft')) return 'Microsoft';
      if (id.includes('mimo') || id.includes('xiaomi')) return 'Xiaomi';
      if (id.includes('pollinations')) return 'Pollinations';
      if (id.includes('bluesminds') || id.includes('bluesmind') || id.includes('shalom')) return 'Bluesmind';
      if (id.includes('aqua')) return 'Aqua';
      if (id.includes('litrouter')) return 'LitRouter';
      if (id.includes('liz')) return 'Liz';
      if (id.includes('openrouter')) return 'OpenRouter';
      return 'Other';
    };

    logs?.forEach((log) => {
      totalRequests++;
      const tokens = log.tokens || 0;
      totalTokens += tokens;

      if (!modelUsage[log.model_id]) {
        modelUsage[log.model_id] = { count: 0, tokens: 0 };
      }
      modelUsage[log.model_id].count++;
      modelUsage[log.model_id].tokens += tokens;

      const provider = getProvider(log.model_id);
      if (!providerUsage[provider]) {
        providerUsage[provider] = { count: 0, tokens: 0 };
      }
      providerUsage[provider].count++;
      providerUsage[provider].tokens += tokens;

      if (!userUsage[log.user_id]) {
        userUsage[log.user_id] = { count: 0, tokens: 0 };
      }
      userUsage[log.user_id].count++;
      userUsage[log.user_id].tokens += tokens;
      userIds.add(log.user_id);
    });

    let profilesMap = new Map();
    if (userIds.size > 0) {
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, email, name, plan')
        .in('id', Array.from(userIds));

      if (profiles) {
        profilesMap = new Map(profiles.map(p => [p.id, p]));
      }
    }

    const topModels = Object.entries(modelUsage)
      .map(([id, data]) => ({ id, requests: data.count, tokens: data.tokens }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, limit);

    const topProviders = Object.entries(providerUsage)
      .map(([name, data]) => ({ name, requests: data.count, tokens: data.tokens }))
      .sort((a, b) => b.requests - a.requests);

    const topUsers = Object.entries(userUsage)
      .map(([id, data]) => {
        const profile = profilesMap.get(id);
        return {
          id,
          email: profile?.email || 'Unknown User',
          name: profile?.name,
          plan: profile?.plan || 'free',
          requests: data.count,
          tokens: data.tokens
        };
      })
      .sort((a, b) => b.requests - a.requests)
      .slice(0, limit);

    const dailyStats: Record<string, { date: string; requests: number; tokens: number }> = {};

    logs?.forEach((log) => {
      const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
      if (!dailyStats[dateStr]) {
        dailyStats[dateStr] = { date: dateStr, requests: 0, tokens: 0 };
      }
      dailyStats[dateStr].requests++;
      dailyStats[dateStr].tokens += log.tokens || 0;
    });

    const chartData = Object.values(dailyStats)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);

    return NextResponse.json({
      summary: {
        totalRequests,
        totalTokens,
        days,
      },
      topModels,
      topProviders,
      topUsers,
      chartData,
    });

  } catch (err) {
    console.error('[GET /api/admin/usage/stats] Unexpected error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}