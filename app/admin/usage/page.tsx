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
  topUsers: Array<{ id: string; email: string; name: string; plan: string; requests: number; tokens: number }>;
  chartData: Array<{ date: string; requests: number; tokens: number }>;
}

export default function AdminUsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [days, setDays] = useState(30);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(`/api/admin/usage/stats?days=${days}&limit=20`);
        const data = await res.json();
        if (data.error) {
          setError(true);
        } else {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch usage stats:', err);
        setError(true);
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

  if (loading) {
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
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading usage data...</div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
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
        </div>
        <div className="text-center py-20 text-slate-500">
          Failed to load usage statistics
        </div>
      </div>
    );
  }

  const maxRequests = Math.max(...(stats.chartData?.map(d => d.requests) || [1]));

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
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Hash className="h-5 w-5 text-blue-500" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Requests</span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(stats.summary.totalRequests)}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Zap className="h-5 w-5 text-purple-500" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Total Tokens</span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(stats.summary.totalTokens)}</div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <span className="text-sm text-slate-600 dark:text-slate-400">Avg Daily</span>
          </div>
          <div className="text-2xl font-bold">{formatNumber(Math.round(stats.summary.totalRequests / stats.summary.days))}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
        <h2 className="text-lg font-semibold mb-4">Daily Requests</h2>
          {stats.chartData && stats.chartData.length > 0 ? (
            <div className="h-48 flex items-end gap-1">
              {stats.chartData?.map((day, idx) => {
              const height = (day.requests / maxRequests) * 100;
              return (
                <div
                  key={idx}
                  className="flex-1 bg-gradient-to-t from-primary/40 to-primary/80 group-hover:from-primary/60 group-hover:to-primary rounded-t-sm transition-all duration-300 ease-in-out relative ring-1 ring-inset ring-white/10 dark:ring-white/5 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-primary/10"
                  style={{ height: `${Math.max(height, 4)}%` }}
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900/90 backdrop-blur-sm text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 whitespace-nowrap shadow-xl border border-white/10 z-10 pointer-events-none transition-opacity duration-200">
                    <span className="font-semibold block mb-0.5">{day.date}</span>
                    <span className="opacity-90">{day.requests} requests</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="h-48 flex items-center justify-center text-slate-500">
            No data available
          </div>
        )}
        {stats.chartData && stats.chartData.length > 0 && (
          <div className="flex justify-between mt-2 text-xs text-slate-500">
            <span>{stats.chartData[0]?.date}</span>
            <span>{stats.chartData[stats.chartData.length - 1]?.date}</span>
          </div>
        )}
      </div>

      {/* Top Models & Providers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4">Top Models</h2>
          <div className="space-y-3">
            {stats.topModels?.slice(0, 10).map((model, idx) => (
              <div key={model.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-500 w-6">{idx + 1}</span>
                  <span className="font-medium">{model.id}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(model.requests)}</div>
                  <div className="text-xs text-slate-500">{formatNumber(model.tokens)} tokens</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4">Top Providers</h2>
          <div className="space-y-3">
            {stats.topProviders?.map((provider, idx) => (
              <div key={provider.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-500 w-6">{idx + 1}</span>
                  <span className="font-medium">{provider.name}</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(provider.requests)}</div>
                  <div className="text-xs text-slate-500">{formatNumber(provider.tokens)} tokens</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Users */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mt-8 mb-8 overflow-hidden relative">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
          Top Users
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 text-sm">
                <th className="pb-4 font-medium uppercase tracking-wider text-xs">User</th>
                <th className="pb-4 font-medium uppercase tracking-wider text-xs">Plan</th>
                <th className="pb-4 font-medium uppercase tracking-wider text-xs text-right">Requests</th>
                <th className="pb-4 font-medium uppercase tracking-wider text-xs text-right">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {stats.topUsers?.map((user, idx) => (
                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group">
                  <td className="py-4">
                    <div className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">
                      {user.name || user.email.split('@')[0]}
                    </div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize tracking-wide shadow-sm
                      ${user.plan === 'ultra' ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white border border-purple-500/50' :
                        user.plan === 'pro' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-blue-500/50' :
                        user.plan === 'developer' ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border border-orange-400/50' :
                        'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 border border-slate-200'}`}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-4 text-right font-semibold tabular-nums">{formatNumber(user.requests)}</td>
                  <td className="py-4 text-right text-slate-500 text-sm tabular-nums">{formatNumber(user.tokens)}</td>
                </tr>
              ))}
              {(!stats.topUsers || stats.topUsers.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-900/20 rounded-lg">
                    No active users found in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}