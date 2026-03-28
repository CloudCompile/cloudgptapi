'use client';

// Note: This is a client component that handles authentication state on the client side.
// API routes called by this component use Logto for server-side authentication.

import { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  AlertCircle, 
  Clock, 
  Shield, 
  Activity,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Search,
  RefreshCcw,
  Terminal,
  Cpu,
  BarChart3,
  Globe,
  Lock,
  Zap,
  BookOpen,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ApiKey {
  id: string;
  name: string;
  keyPreview: string;
  createdAt: string;
  lastUsedAt?: string;
  usageCount?: number;
}

interface NewApiKey {
  id: string;
  key: string;
  name: string;
  createdAt: string;
  message: string;
}

export default function Dashboard() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<NewApiKey | null>(null);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [providerStatuses, setProviderStatuses] = useState<any>({});
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userUsage, setUserUsage] = useState<any>(null);

  useEffect(() => {
    fetchKeys();
    fetchProviderStatuses();
    fetchUserUsage();

    // Auto-refresh stats every minute
    const usageInterval = setInterval(fetchUserUsage, 60000);
    // Auto-refresh status every 30 seconds
    const statusInterval = setInterval(fetchProviderStatuses, 30000);
    return () => {
      clearInterval(statusInterval);
      clearInterval(usageInterval);
    };
  }, []);

  async function fetchUserUsage() {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data = await response.json();
        setUserUsage(data);
      }
    } catch (err) {
      console.error('Failed to fetch usage stats');
    }
  }

  async function fetchProviderStatuses() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setLoadingStatus(true);
    try {
      const response = await fetch('/api/status');
      if (response.ok) {
        const data = await response.json();
        setProviderStatuses(data);
      }
    } catch (err) {
      console.error('Failed to fetch provider status');
    } finally {
      setLoadingStatus(false);
      setTimeout(() => setIsRefreshing(false), 2000);
    }
  }

  async function fetchKeys() {
    setLoading(true);
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      setKeys(data.keys || []);
    } catch (err) {
      setError('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) {
      setError('Please enter a key name');
      return;
    }

    try {
      const response = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create API key');
        return;
      }

      const data = await response.json();
      setCreatedKey(data);
      setNewKeyName('');
      setError('');
      await fetchKeys();
    } catch (err) {
      setError('Failed to create API key');
    }
  }

  async function deleteKey(id: string) {
    if (!confirm('Are you sure you want to delete this API key? This cannot be undone.')) return;

    try {
      const response = await fetch('/api/keys', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to delete API key');
        return;
      }

      await fetchKeys();
    } catch (err) {
      setError('Failed to delete API key');
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const filteredKeys = keys.filter(key => 
    key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10 animate-in fade-in duration-700">
      {/* New Key Success Modal */}
      {createdKey && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="h-12 w-12 sm:h-16 sm:w-16 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary mb-4 sm:mb-6">
              <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-2">API Key Created!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              {createdKey.message}
            </p>
            
            <div className="bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-center justify-between gap-3 sm:gap-4 border border-border group">
              <code className="text-xs sm:text-sm font-mono font-bold break-all text-primary">
                {createdKey.key}
              </code>
              <button 
                onClick={() => copyToClipboard(createdKey.key, 'created')}
                className="shrink-0 p-2 rounded-lg sm:p-2.5 sm:rounded-xl bg-white dark:bg-slate-700 border border-border hover:bg-muted transition-all shadow-sm"
              >
                {copiedId === 'created' ? <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
              </button>
            </div>

            <button 
              onClick={() => setCreatedKey(null)}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black py-3 sm:py-4 rounded-xl sm:rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg text-sm sm:text-base"
            >
              I've saved it securely
            </button>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-3 sm:mb-4 border border-primary/20">
            <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current" />
            <span>Developer Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter">API Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 sm:mt-2 font-medium text-xs sm:text-sm md:text-base">Create and manage access keys for your applications.</p>
        </div>
        <div className="flex gap-3">
          <div className={`flex items-center gap-3 sm:gap-4 glass-card p-2.5 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm w-full sm:w-auto transition-all duration-500 ${loadingStatus ? 'opacity-50' : 'opacity-100'}`}>
            <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${Object.values(providerStatuses).some((s: any) => s.status === 'down') ? 'bg-amber-500/10 text-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.2)]' : 'bg-emerald-500/10 text-emerald-500 glow-primary'}`}>
              <Activity className={`h-4 w-4 sm:h-5 sm:w-5 ${!loadingStatus && 'animate-pulse'}`} />
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] uppercase tracking-widest text-slate-400 font-black">
                {loadingStatus ? 'FETCHING_METRICS...' : 'NETWORK_HEALTH'}
              </div>
              <div className="text-xs sm:text-sm font-bold">
                {loadingStatus ? 'SYNCING...' : (Object.values(providerStatuses).some((s: any) => s.status === 'down') ? 'PARTIAL_OUTAGE' : 'ALL_SYSTEMS_LIVE')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Main Content: Key List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="glass-card p-4 rounded-2xl border border-border/50">
              <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">Daily Usage</div>
              <div className="flex items-end gap-2">
                <div className="text-xl font-black text-primary">{userUsage?.used || 0}</div>
                <div className="text-[10px] text-slate-500 font-bold mb-1.5">/ {userUsage?.limit || 1000}</div>
              </div>
              <div className="mt-2 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000" 
                  style={{ width: `${Math.min(100, ((userUsage?.used || 0) / (userUsage?.limit || 1000)) * 100)}%` }}
                />
              </div>
            </div>
            
            <div className="glass-card p-4 rounded-2xl border border-border/50">
              <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">Active Keys</div>
              <div className="text-xl font-black text-white">{keys.length}</div>
              <div className="text-[10px] text-emerald-500 font-bold mt-1">OPERATIONAL</div>
            </div>

            <div className="glass-card p-4 rounded-2xl border border-border/50 hidden sm:block">
              <div className="text-[10px] uppercase font-black text-slate-500 tracking-wider mb-1">Current Plan</div>
              <div className="text-xl font-black text-white uppercase tracking-tight">{(userUsage?.plan || 'Free').replace('_', ' ')}</div>
              <div className="text-[10px] text-primary font-bold mt-1 flex items-center gap-1">
                <Zap className="h-2 w-2 fill-current" /> UPGRADE
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl sm:rounded-[2rem] shadow-sm overflow-hidden border-border/50">
            <div className="p-4 sm:p-8 border-b border-white/5 flex items-center justify-between gap-3 sm:gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search keys..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-2.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button 
                onClick={fetchKeys}
                className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl border border-white/10 hover:bg-white/5 transition-colors shrink-0"
                title="Refresh keys"
              >
                <RefreshCcw className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", loading && "animate-spin")} />
              </button>
            </div>

            <div className="divide-y divide-white/5">
              {filteredKeys.length > 0 ? (
                filteredKeys.map((key) => (
                  <div key={key.id} className="p-4 sm:p-8 hover:bg-white/5 transition-colors group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-6 relative z-10">
                      <div className="flex gap-3 sm:gap-4">
                        <div className="h-9 w-9 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shrink-0">
                          <Key className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-sm sm:text-lg tracking-tight truncate">{key.name}</h3>
                            <Link 
                              href={`/dashboard/plugins/${key.id}`}
                              className="p-1 px-2 flex items-center gap-1.5 rounded-md bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-all shadow-none shrink-0 border border-emerald-500/10 group/zap"
                              title="Configure Plugins"
                            >
                              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current group-hover/zap:scale-110 transition-transform" />
                              <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Active</span>
                            </Link>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
                            <code className="text-[9px] sm:text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider truncate max-w-[80px] xs:max-w-[120px] sm:max-w-none">
                              {key.keyPreview}
                            </code>
                            {key.keyPreview.includes('...') ? (
                              <div className="group/hint relative shrink-0">
                                <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-slate-300" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-[9px] sm:text-[10px] font-bold rounded opacity-0 group-hover/hint:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20">
                                  Full key hidden for security
                                </div>
                              </div>
                            ) : (
                              <button 
                                onClick={() => copyToClipboard(key.keyPreview, key.id)}
                                className="text-slate-400 hover:text-primary transition-colors shrink-0"
                                title="Copy API key"
                              >
                                {copiedId === key.id ? <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" /> : <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 sm:gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-border sm:border-none">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {key.lastUsedAt ? `Used ${new Date(key.lastUsedAt).toLocaleDateString()}` : 'Never used'}
                        </span>
                        <div className="flex items-center gap-2">
                          <Link 
                            href={`/dashboard/plugins/${key.id}`}
                            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all lg:opacity-0 lg:group-hover:opacity-100 border border-primary/10"
                          >
                            <BookOpen className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            Plugins
                          </Link>
                          <button 
                            onClick={() => deleteKey(key.id)}
                            className="p-1.5 sm:p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all lg:opacity-0 lg:group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 sm:p-20 text-center">
                  <div className="h-12 w-12 sm:h-16 sm:w-16 bg-muted rounded-2xl sm:rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-4 sm:mb-6">
                    <Key className="h-6 w-6 sm:h-8 sm:w-8" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight mb-2">No API keys found</h3>
                  <p className="text-slate-400 max-w-xs mx-auto text-xs sm:text-sm font-medium">
                    {searchQuery ? "No keys match your search criteria." : "Create your first API key to start using Vetra."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Create Key & Info */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl font-black tracking-tighter mb-4 sm:mb-6 flex items-center gap-3">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                New API Key
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <input 
                  type="text" 
                  placeholder="Production App Key..." 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-4 py-2.5 sm:py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all placeholder:text-slate-600"
                />
                <button 
                  onClick={createKey}
                  className="w-full bg-primary text-white font-black py-2.5 sm:py-3 rounded-lg sm:rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-sm uppercase tracking-widest"
                >
                  Generate Key
                </button>
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-[10px] sm:text-xs font-bold bg-red-500/10 p-2.5 sm:p-3 rounded-lg border border-red-500/20">
                    <AlertCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
            <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 sm:mb-6 flex items-center justify-between relative z-10">
              Live Providers Status
              <span className={`w-2 h-2 rounded-full ${loadingStatus ? 'bg-slate-400 animate-pulse' : 'bg-emerald-500 shadow-[0_0_8px_var(--color-primary)]'}`} />
            </h3>
            <div className="space-y-4 relative z-10">
              {['pollinations', 'openrouter', 'poe', 'github', 'liz', 'kivest'].map((provider) => {
                const status = providerStatuses[provider];
                const isOnline = status?.status === 'online';
                return (
                  <div key={provider} className="flex items-center justify-between group/p">
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 group-hover/p:text-slate-200 transition-colors">
                        {provider}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {status?.latency && (
                        <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover/p:opacity-100 transition-opacity">
                          {status.latency}ms
                        </span>
                      )}
                      <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${isOnline ? 'border-emerald-500/10 text-emerald-500 bg-emerald-500/5' : 'border-amber-500/10 text-amber-500 bg-amber-500/5'}`}>
                        {isOnline ? 'LIVE' : 'DOWN'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-card rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent pointer-events-none" />
             <div className="relative z-10">
              <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 sm:mb-6">Security Console</h3>
              <ul className="space-y-3 sm:space-y-4">
                <li className="flex gap-3">
                  <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                    <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 leading-relaxed">Never share your API keys or expose them in client-side code.</p>
                </li>
                <li className="flex gap-3">
                  <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Shield className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  </div>
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 leading-relaxed">Rotate your keys regularly to maintain high security standards.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ icon, label, value, color = "text-slate-900 dark:text-slate-100", description }: { icon: React.ReactNode, label: string, value: string, color?: string, description?: string }) {
  return (
    <div className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-950 border-2 border-border shadow-xl shadow-slate-200/50 dark:shadow-none hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
      <div className="absolute inset-0 dot-grid opacity-0 group-hover:opacity-10 transition-opacity" />
      <div className="relative z-10">
        <div className="flex items-center gap-5 mb-6">
          <div className="h-14 w-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-border/50">
            {icon}
          </div>
          <div className="flex-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">{label}</span>
            <div className={cn("text-4xl font-black tracking-tighter leading-none", color)}>{value}</div>
          </div>
        </div>
        {description && (
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">{description}</span>
            <div className="h-1.5 w-1.5 rounded-full bg-primary/30 group-hover:bg-primary transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
}
