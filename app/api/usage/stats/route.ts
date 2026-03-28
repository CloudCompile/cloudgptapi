import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserId } from '@/lib/kinde-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { DailyUsageStat, UsageLog, TopModelStat } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const apiKeyId = searchParams.get('apiKeyId');

    // Calculate the start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    let query = supabaseAdmin
      .from('usage_logs')
      .select('timestamp, type, model_id, tokens')
      .eq('user_id', userId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: true });

    if (apiKeyId) {
      query = query.eq('api_key_id', apiKeyId);
    }

    const { data: logs, error: logsError } = await query;

    if (logsError) {
      console.error('[GET /api/usage/stats] Error fetching logs:', logsError);
      return NextResponse.json({ error: 'Failed to fetch usage stats' }, { status: 500 });
    }

    // Process logs into daily buckets
    const dailyStats: Record<string, DailyUsageStat> = {};
    
    // Initialize buckets for all days in range
    for (let i = 0; i < days; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyStats[dateStr] = { date: dateStr, total: 0, chat: 0, image: 0, video: 0, tokens: 0 };
    }

    (logs as UsageLog[])?.forEach((log) => {
      const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].total++;
        if (log.type === 'chat') dailyStats[dateStr].chat++;
        else if (log.type === 'image') dailyStats[dateStr].image++;
        else if (log.type === 'video') dailyStats[dateStr].video++;
        
        if (log.tokens) dailyStats[dateStr].tokens += log.tokens;
      }
    });

    // Convert to sorted array
    const chartData = Object.values(dailyStats).sort((a, b) => a.date.localeCompare(b.date));

    // Get top models
    const modelUsage: Record<string, number> = {};
    (logs as UsageLog[])?.forEach((log) => {
        modelUsage[log.model_id] = (modelUsage[log.model_id] || 0) + 1;
    });

    const topModels: TopModelStat[] = Object.entries(modelUsage)
        .map(([id, count]) => ({ id, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return NextResponse.json({
      chartData,
      topModels,
      summary: {
          totalRequests: logs?.length || 0,
          totalTokens: (logs as UsageLog[])?.reduce((acc: number, log: UsageLog) => acc + (log.tokens || 0), 0) || 0
      }
    });

  } catch (err) {
    console.error('[GET /api/usage/stats] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
