'use client';

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
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

  useEffect(() => {
    fetchKeys();
  }, []);

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
    <div className="min-h-screen py-12 px-4 lg:px-12">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-16">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4 border border-primary/20">
                <Shield className="h-3 w-3" />
                <span>Security Console</span>
              </div>
              <h1 className="text-5xl font-black tracking-tighter mb-4 leading-none">API Management</h1>
              <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
                Securely manage your access keys and monitor real-time usage across the CloudGPT infrastructure.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button 
                onClick={fetchKeys}
                className="p-4 rounded-2xl border border-border bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm group"
                title="Refresh Data"
              >
                <RefreshCcw className={cn("h-5 w-5 text-slate-500 group-hover:text-primary transition-colors", loading && "animate-spin")} />
              </button>
              <div className="relative flex-1 sm:w-80 group">
                <input
                  type="text"
                  placeholder="Production API Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full pl-5 pr-36 py-4 rounded-2xl border-2 border-border bg-white dark:bg-slate-950 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-sm"
                  onKeyDown={(e) => e.key === 'Enter' && createKey()}
                />
                <button
                  onClick={createKey}
                  disabled={!newKeyName.trim() || loading}
                  className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-primary text-white text-xs font-black uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                >
                  <Plus className="h-4 w-4" />
                  Create
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              icon={<Activity className="h-5 w-5 text-blue-500" />} 
              label="Total Usage" 
              value={keys.reduce((acc, k) => acc + (k.usageCount || 0), 0).toLocaleString()} 
              description="Requests this month"
            />
            <StatsCard 
              icon={<Zap className="h-5 w-5 text-amber-500" />} 
              label="Active Keys" 
              value={keys.length.toString()} 
              description="Total provisioned"
            />
            <StatsCard 
              icon={<Globe className="h-5 w-5 text-emerald-500" />} 
              label="Avg Latency" 
              value="42ms" 
              description="Global average"
            />
            <StatsCard 
              icon={<Lock className="h-5 w-5 text-purple-500" />} 
              label="API Status" 
              value="Active" 
              color="text-emerald-500"
              description="All systems go"
            />
          </div>
        </div>

        {error && (
          <div className="mb-12 p-5 rounded-[2rem] bg-red-50 dark:bg-red-500/5 border-2 border-red-500/10 text-red-600 dark:text-red-400 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="h-6 w-6" />
            </div>
            <span className="font-bold text-sm">{error}</span>
          </div>
        )}

        {/* New Key Alert */}
        {createdKey && (
          <div className="mb-16 p-10 rounded-[3rem] bg-primary/5 border-2 border-primary/20 shadow-3xl shadow-primary/10 animate-in zoom-in-95 duration-700 relative overflow-hidden group">
            <div className="absolute inset-0 dot-grid opacity-20 group-hover:opacity-30 transition-opacity" />
            <div className="absolute top-0 right-0 p-6">
              <button 
                onClick={() => setCreatedKey(null)}
                className="p-3 rounded-2xl hover:bg-primary/10 transition-all hover:rotate-90"
              >
                <Plus className="h-8 w-8 rotate-45 text-primary" />
              </button>
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start gap-8 mb-10">
                <div className="h-20 w-20 rounded-[2rem] bg-primary/20 flex items-center justify-center shrink-0 shadow-2xl shadow-primary/20">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="font-black text-4xl text-primary mb-3 tracking-tighter leading-none">Secure Your New Key</h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-xl text-lg font-medium leading-relaxed">
                    This is a one-time display. Store this key in a secure environment. 
                    Loss of this key will require generating a new one.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                <div className="flex-1 flex items-center gap-4 p-6 rounded-[2rem] bg-white dark:bg-slate-950 border-2 border-primary/30 shadow-inner group/code">
                  <code className="flex-1 font-mono text-xl break-all text-slate-900 dark:text-slate-100 px-2 select-all leading-none">{createdKey.key}</code>
                  <button
                    onClick={() => copyToClipboard(createdKey.key, 'new')}
                    className="p-3 rounded-xl hover:bg-primary/10 text-primary transition-colors"
                  >
                    {copiedId === 'new' ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                  </button>
                </div>
                <button
                  onClick={() => copyToClipboard(createdKey.key, 'new')}
                  className="px-12 py-6 rounded-[2rem] bg-primary text-white hover:bg-primary/90 transition-all flex items-center justify-center gap-4 text-sm font-black uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {copiedId === 'new' ? <Check className="h-6 w-6" /> : <Copy className="h-6 w-6" />}
                  {copiedId === 'new' ? 'Copied to Clipboard' : 'Copy API Key'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Keys Table Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 px-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <Terminal className="h-5 w-5 text-slate-500" />
              </div>
              <h2 className="text-2xl font-black tracking-tighter">Active Credentials</h2>
            </div>
            <div className="relative group sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Filter keys by name or ID..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-2 border-border bg-white dark:bg-slate-950 focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-bold text-sm"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-950 rounded-[2.5rem] border-2 border-border shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden relative group">
            <div className="absolute inset-0 dot-grid opacity-10 pointer-events-none" />
            
            {loading ? (
              <div className="p-32 text-center relative z-10">
                <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-8 shadow-xl shadow-primary/20"></div>
                <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px]">Syncing with Infrastructure...</p>
              </div>
            ) : filteredKeys.length === 0 ? (
              <div className="p-32 text-center relative z-10">
                <div className="h-24 w-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto mb-10 rotate-12 group-hover:rotate-0 transition-transform duration-700 shadow-inner">
                  <Key className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tighter">No Access Keys</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-12 text-lg font-medium leading-relaxed">
                  {searchQuery ? "Your search query yielded no results." : "You haven't provisioned any API keys yet. Create one above to get started."}
                </p>
                {!searchQuery && (
                  <button 
                    onClick={() => document.querySelector('input')?.focus()}
                    className="px-12 py-5 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-105 active:scale-95"
                  >
                    Provision First Key
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto relative z-10">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-border bg-slate-50/50 dark:bg-slate-900/50">
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Credential Name</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Access Token</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Requests</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Access</th>
                      <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-border">
                    {filteredKeys.map((key) => (
                      <tr key={key.id} className="group/row hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all duration-300">
                        <td className="px-10 py-8">
                          <div className="font-black text-slate-900 dark:text-slate-100 text-xl tracking-tighter group-hover/row:text-primary transition-colors">{key.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-2 uppercase tracking-widest flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            ID: {key.id.slice(0,16)}
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3">
                            <code className="text-sm font-mono text-slate-600 bg-slate-100 dark:bg-slate-900/80 px-4 py-2 rounded-xl border-2 border-border/50 font-bold">
                              {key.keyPreview}
                            </code>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex flex-col items-center">
                            <span className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tighter mb-1">{key.usageCount || 0}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Ops</span>
                          </div>
                        </td>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 font-bold">
                            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                              <Clock className="h-4 w-4 text-slate-400" />
                            </div>
                            {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <div className="flex items-center justify-end gap-3 opacity-0 group-hover/row:opacity-100 transition-all duration-300 translate-x-4 group-hover/row:translate-x-0">
                            <button 
                              onClick={() => deleteKey(key.id)}
                              className="p-3 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all border-2 border-transparent hover:border-red-500/20"
                              title="Revoke Access"
                            >
                              <Trash2 className="h-6 w-6" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
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
