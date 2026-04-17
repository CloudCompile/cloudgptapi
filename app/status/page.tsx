'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  MessageSquare,
  Image as ImageIcon,
  Video,
  Globe,
  Server,
  Database,
  Sparkles,
  Crown,
  Shield,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  CHAT_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  PREMIUM_MODELS,
  ULTRA_MODELS,
  ADMIN_ONLY_MODELS,
  FREE_MODELS,
} from '@/lib/providers';

// ── Types ──────────────────────────────────────────────────────────────────

interface ProviderStatus {
  name: string;
  status: string;
  latency: number;
  statusCode?: number;
  lastChecked?: string;
}

interface UptimeEntry {
  timestamp: number;
  status: 'up' | 'down';
}

type ModelDef = {
  id: string;
  name: string;
  provider: string;
  description?: string;
  type: 'chat' | 'image' | 'video';
};

// ── Helpers ────────────────────────────────────────────────────────────────

const PROVIDER_MAP: Record<string, string> = {
  pollinations: 'pollinations',
  openrouter: 'openrouter',
  kivest: 'shalom',
  openai: 'shalom',
  anthropic: 'aqua',
  google: 'aqua',
  deepseek: 'shalom',
  moonshot: 'shalom',
  zhipu: 'shalom',
  minimax: 'shalom',
  meta: 'shalom',
  amazon: 'shalom',
  mistral: 'shalom',
  microsoft: 'shalom',
  bytedance: 'shalom',
  xiaomi: 'shalom',
  alibaba: 'shalom',
  xai: 'bluesminds',
  mino: 'shalom',
  groq: 'pollinations',
  cerebras: 'pollinations',
  elevenlabs: 'shalom',
  stablehorde: 'pollinations',
  meridian: 'pollinations',
  github: 'github',
  litrouter: 'shalom',
};

function getStatusProvider(modelProvider: string): string {
  return PROVIDER_MAP[modelProvider.toLowerCase()] || 'pollinations';
}

function getTier(id: string): 'free' | 'pro' | 'ultra' | 'admin' {
  if (ADMIN_ONLY_MODELS.has(id)) return 'admin';
  if (ULTRA_MODELS.has(id)) return 'ultra';
  if (FREE_MODELS.has(id) || id.endsWith(':free')) return 'free';
  if (PREMIUM_MODELS.has(id)) return 'pro';
  return 'free';
}

function tierLabel(tier: string) {
  switch (tier) {
    case 'free': return 'FREE';
    case 'pro': return 'PRO';
    case 'ultra': return 'ULTRA';
    case 'admin': return 'ADMIN';
    default: return tier.toUpperCase();
  }
}

function tierColor(tier: string) {
  switch (tier) {
    case 'free': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'pro': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'ultra': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
}

// ── Build model lists ──────────────────────────────────────────────────────

const ALL_MODELS: ModelDef[] = [
  ...CHAT_MODELS.map(m => ({ id: m.id, name: m.name, provider: m.provider, description: m.description, type: 'chat' as const })),
  ...IMAGE_MODELS.map(m => ({ id: m.id, name: m.name, provider: m.provider, description: m.description, type: 'image' as const })),
  ...VIDEO_MODELS.map(m => ({ id: m.id, name: m.name, provider: m.provider, description: m.description, type: 'video' as const })),
];

// De-duplicate by id (keep first occurrence)
const UNIQUE_MODELS = ALL_MODELS.filter(
  (m, i, arr) => arr.findIndex(x => x.id === m.id) === i
);

interface ModelGroup {
  title: string;
  icon: React.ReactNode;
  models: ModelDef[];
}

function buildGroups(): ModelGroup[] {
  const standardText = UNIQUE_MODELS.filter(
    m => m.type === 'chat' && getTier(m.id) === 'free'
  );
  const premiumText = UNIQUE_MODELS.filter(
    m => m.type === 'chat' && getTier(m.id) === 'pro'
  );
  const ultraText = UNIQUE_MODELS.filter(
    m => m.type === 'chat' && (getTier(m.id) === 'ultra' || getTier(m.id) === 'admin')
  );
  const imageModels = UNIQUE_MODELS.filter(m => m.type === 'image');
  const videoModels = UNIQUE_MODELS.filter(m => m.type === 'video');

  return [
    { title: 'Standard Text Models', icon: <MessageSquare className="h-5 w-5" />, models: standardText },
    { title: 'Premium Text Models', icon: <Crown className="h-5 w-5" />, models: premiumText },
    { title: 'Ultra & Admin Models', icon: <Sparkles className="h-5 w-5" />, models: ultraText },
    { title: 'Image Generation', icon: <ImageIcon className="h-5 w-5" />, models: imageModels },
    { title: 'Video Generation', icon: <Video className="h-5 w-5" />, models: videoModels },
  ];
}

// ── Uptime Bar Component ───────────────────────────────────────────────────

const UPTIME_SLOTS = 45;

function UptimeBar({ history }: { history: UptimeEntry[] }) {
  // Pad to UPTIME_SLOTS from the left with "up" if not enough data
  const padded: UptimeEntry[] = [];
  const have = history.slice(-UPTIME_SLOTS);
  for (let i = 0; i < UPTIME_SLOTS - have.length; i++) {
    padded.push({ timestamp: 0, status: 'up' });
  }
  padded.push(...have);

  const upCount = padded.filter(e => e.status === 'up').length;
  const pct = Math.round((upCount / UPTIME_SLOTS) * 100);

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-[2px]">
        {padded.map((entry, i) => (
          <div
            key={i}
            className={cn(
              'w-[5px] h-5 rounded-[2px] transition-colors',
              entry.status === 'up'
                ? 'bg-emerald-500'
                : 'bg-red-500'
            )}
          />
        ))}
      </div>
      <span className="text-[10px] font-bold text-slate-400 tabular-nums w-10 text-right">
        {pct}%
      </span>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export default function StatusPage() {
  const [providerStatuses, setProviderStatuses] = useState<Record<string, ProviderStatus>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const uptimeHistoryRef = useRef<Record<string, UptimeEntry[]>>({});
  const [uptimeSnapshot, setUptimeSnapshot] = useState<Record<string, UptimeEntry[]>>({});

  const groups = useMemo(() => buildGroups(), []);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setProviderStatuses(data);
      setLastRefresh(new Date());
      setIsLoading(false);

      // Update uptime history for each provider
      const now = Date.now();
      for (const [name, info] of Object.entries(data) as [string, ProviderStatus][]) {
        if (!uptimeHistoryRef.current[name]) {
          uptimeHistoryRef.current[name] = [];
        }
        uptimeHistoryRef.current[name].push({
          timestamp: now,
          status: info.status === 'online' ? 'up' : 'down',
        });
        // Keep last 200 entries
        if (uptimeHistoryRef.current[name].length > 200) {
          uptimeHistoryRef.current[name] = uptimeHistoryRef.current[name].slice(-200);
        }
      }
      setUptimeSnapshot({ ...uptimeHistoryRef.current });
    } catch {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const toggleGroup = (title: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  // Derived stats
  const providerEntries = Object.values(providerStatuses);
  const onlineProviders = providerEntries.filter(p => p.status === 'online').length;
  const totalProviders = providerEntries.length;
  const avgLatency = totalProviders
    ? Math.round(providerEntries.reduce((s, p) => s + (p.latency || 0), 0) / totalProviders)
    : 0;

  const overallStatus: 'operational' | 'degraded' | 'down' =
    onlineProviders === totalProviders
      ? 'operational'
      : onlineProviders > 0
        ? 'degraded'
        : 'down';

  function getModelStatus(model: ModelDef): 'online' | 'offline' | 'checking' {
    if (isLoading) return 'checking';
    const key = getStatusProvider(model.provider);
    const ps = providerStatuses[key];
    if (!ps) return 'online'; // default for unchecked
    return ps.status === 'online' ? 'online' : 'offline';
  }

  function getModelLatency(model: ModelDef): number | null {
    const key = getStatusProvider(model.provider);
    const ps = providerStatuses[key];
    return ps?.latency ?? null;
  }

  function getModelUptime(model: ModelDef): UptimeEntry[] {
    const key = getStatusProvider(model.provider);
    return uptimeSnapshot[key] || [];
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 sm:pt-24 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 mesh-gradient opacity-60 dark:opacity-40" />
      <div className="fixed inset-0 dot-grid opacity-30" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10 sm:mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-2 text-primary font-bold mb-3 sm:mb-4">
            <div className="p-1.5 rounded-xl bg-primary/10 backdrop-blur-md border border-primary/20">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <span className="tracking-[0.2em] uppercase text-[9px] sm:text-xs">System Status</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-3 sm:mb-6 tracking-tight leading-[0.9]">
            Service <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-cyan-400">Monitor</span>
          </h1>
          <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium">
            Real-time status of all Vetra API services. Uptime bars reflect checks during your current session.
          </p>
        </div>

        {/* Overall Status Banner */}
        <div className={cn(
          'mb-8 sm:mb-12 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-700 delay-100',
          overallStatus === 'operational'
            ? 'bg-emerald-500/10 dark:bg-emerald-500/5 border-emerald-500/20'
            : overallStatus === 'degraded'
              ? 'bg-amber-500/10 dark:bg-amber-500/5 border-amber-500/20'
              : 'bg-red-500/10 dark:bg-red-500/5 border-red-500/20'
        )}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn(
                'p-3 rounded-2xl',
                overallStatus === 'operational'
                  ? 'bg-emerald-500/20 text-emerald-500'
                  : overallStatus === 'degraded'
                    ? 'bg-amber-500/20 text-amber-500'
                    : 'bg-red-500/20 text-red-500'
              )}>
                {overallStatus === 'operational' ? (
                  <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8" />
                ) : overallStatus === 'degraded' ? (
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse" />
                ) : (
                  <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />
                )}
              </div>
              <div>
                <h2 className={cn(
                  'text-lg sm:text-2xl font-black tracking-tight',
                  overallStatus === 'operational'
                    ? 'text-emerald-700 dark:text-emerald-300'
                    : overallStatus === 'degraded'
                      ? 'text-amber-700 dark:text-amber-300'
                      : 'text-red-700 dark:text-red-300'
                )}>
                  {overallStatus === 'operational'
                    ? 'All Systems Operational'
                    : overallStatus === 'degraded'
                      ? 'Partially Degraded Service'
                      : 'Major Outage'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {lastRefresh
                    ? `Last checked ${lastRefresh.toLocaleTimeString()}`
                    : 'Checking...'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchStatus}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200/50 dark:border-slate-700/50 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-all"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12 animate-in fade-in slide-in-from-top-4 duration-700 delay-200">
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-lg shadow-slate-200/30 dark:shadow-none">
            <div className="flex items-center gap-2 mb-2">
              <Server className="h-4 w-4 text-primary" />
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Providers</span>
            </div>
            <p className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
              {onlineProviders}<span className="text-slate-400">/{totalProviders}</span>
            </p>
          </div>
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-lg shadow-slate-200/30 dark:shadow-none">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Avg Latency</span>
            </div>
            <p className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
              {avgLatency}<span className="text-slate-400">ms</span>
            </p>
          </div>
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-lg shadow-slate-200/30 dark:shadow-none">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-[0.15em]">Models</span>
            </div>
            <p className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
              {UNIQUE_MODELS.length}
            </p>
          </div>
        </div>

        {/* Model Groups */}
        {groups.map((group, gi) => (
          <div
            key={group.title}
            className="mb-8 sm:mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700"
            style={{ animationDelay: `${400 + gi * 100}ms` }}
          >
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between mb-4 group"
            >
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 group-hover:border-primary/30 transition-colors">
                  {group.icon}
                </div>
                {group.title}
                <span className="text-xs font-bold text-slate-400 ml-1">({group.models.length})</span>
              </h2>
              {collapsedGroups.has(group.title) ? (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              )}
            </button>

            {!collapsedGroups.has(group.title) && (
              <div className="space-y-1.5">
                {group.models.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm font-medium rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/30">
                    No models in this category
                  </div>
                ) : (
                  group.models.map((model) => {
                    const status = getModelStatus(model);
                    const latency = getModelLatency(model);
                    const uptime = getModelUptime(model);
                    const tier = getTier(model.id);

                    return (
                      <div
                        key={model.id}
                        className="flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/30 dark:border-slate-800/30 hover:border-primary/20 transition-all group/row"
                      >
                        {/* Status badge */}
                        <div className={cn(
                          'flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest border shrink-0',
                          status === 'online'
                            ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30'
                            : status === 'offline'
                              ? 'bg-red-500/20 text-red-500 border-red-500/30'
                              : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        )}>
                          <span className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            status === 'online'
                              ? 'bg-emerald-500 animate-pulse'
                              : status === 'offline'
                                ? 'bg-red-500'
                                : 'bg-slate-400 animate-pulse'
                          )} />
                          <span className="hidden sm:inline">
                            {status === 'online' ? 'Online' : status === 'offline' ? 'Down' : '...'}
                          </span>
                        </div>

                        {/* Tier badge */}
                        <span className={cn(
                          'px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-widest border shrink-0',
                          tierColor(tier)
                        )}>
                          {tierLabel(tier)}
                        </span>

                        {/* Model name */}
                        <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex-1 min-w-0 truncate group-hover/row:text-primary transition-colors">
                          {model.name}
                        </span>

                        {/* Latency */}
                        <span className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 tabular-nums shrink-0 w-14 text-right">
                          {latency ? `${latency}ms` : '---'}
                        </span>

                        {/* Uptime bar (desktop) */}
                        <div className="hidden md:block shrink-0">
                          <UptimeBar history={uptime} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
