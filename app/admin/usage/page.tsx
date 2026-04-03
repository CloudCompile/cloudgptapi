'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, Zap, Hash, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';

interface UsageStats {
  summary: {
    totalRequests: number;
    totalTokens: number;
    days: number;
  };
  topModels: Array<{ id: string; requests: number; tokens: number }>;
  topProviders: Array<{ name: string; requests: number; tokens: number }>;
  chartData: Array<{ date: string; requests: number; tokens: number }>;
}

export default function AdminUsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/usage/stats?days=${days}&limit=20`);
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch usage stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [days]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const maxRequests = Math.max(...(stats?.chartData.map(d => d.requests) || [1]));

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin" 
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Activity className="h-8 w-8 text-primary" />
              Usage Analytics
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track API usage across all users and models
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <Zap className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Requests</p>
              <p className="text-3xl font-bold mt-1">{formatNumber(stats.summary.totalRequests)}</p>
            </div>
            
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                  <Hash className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Total Tokens</p>
              <p className="text-3xl font-bold mt-1">{formatNumber(stats.summary.totalTokens)}</p>
            </div>
            
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Avg Tokens/Request</p>
              <p className="text-3xl font-bold mt-1">
                {stats.summary.totalRequests > 0 
                  ? formatNumber(Math.round(stats.summary.totalTokens / stats.summary.totalRequests))
                  : '0'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Top Models by Requests</h2>
              <div className="space-y-3">
                {stats.topModels.length > 0 ? (
                  stats.topModels.map((model, idx) => (
                    <div key={model.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-400 w-6">#{idx + 1}</span>
                        <span className="font-medium">{model.id}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{formatNumber(model.requests)}</span>
                        <span className="text-sm text-slate-500 ml-2">requests</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">No usage data available</p>
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Usage by Provider</h2>
              <div className="space-y-3">
                {stats.topProviders.length > 0 ? (
                  stats.topProviders.map((provider) => (
                    <div key={provider.name} className="flex items-center justify-between">
                      <span className="font-medium">{provider.name}</span>
                      <div className="text-right">
                        <span className="font-semibold">{formatNumber(provider.requests)}</span>
                        <span className="text-sm text-slate-500 ml-2">requests</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 text-center py-8">No usage data available</p>
                )}
              </div>
            </div>
          </div>

          {stats.chartData.length > 0 && (
            <div className="mt-8 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Daily Requests</h2>
              <div className="flex items-end gap-1 h-40">
                {stats.chartData.map((day) => {
                  const height = maxRequests > 0 ? (day.requests / maxRequests) * 100 : 0;
                  return (
                    <div
                      key={day.date}
                      className="flex-1 bg-primary/80 rounded-t hover:bg-primary transition-colors group relative"
                      style={{ height: `${Math.max(height, 2)}%` }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                        {day.date}: {day.requests} requests
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 text-xs text-slate-500">
                <span>{stats.chartData[0]?.date}</span>
                <span>{stats.chartData[stats.chartData.length - 1]?.date}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 text-slate-500">
          Failed to load usage statistics
        </div>
      )}
    </div>
  );
}