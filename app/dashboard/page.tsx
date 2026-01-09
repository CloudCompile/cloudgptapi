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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4 border border-primary/20">
            <Zap className="h-3.5 w-3.5 fill-current" />
            <span>Developer Console</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">API Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Create and manage access keys for your applications.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-border p-4 rounded-2xl shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Status</div>
              <div className="text-sm font-bold">Systems Operational</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content: Key List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-[2rem] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-border flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search keys..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/50 border border-border rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <button 
                onClick={fetchKeys}
                className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors"
                title="Refresh keys"
              >
                <RefreshCcw className={cn("h-4 w-4", loading && "animate-spin")} />
              </button>
            </div>

            <div className="divide-y divide-border">
              {filteredKeys.length > 0 ? (
                filteredKeys.map((key) => (
                  <div key={key.id} className="p-8 hover:bg-muted/30 transition-colors group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Key className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-lg tracking-tight">{key.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <code className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase tracking-wider">
                              {key.keyPreview}
                            </code>
                            <button 
                              onClick={() => copyToClipboard(key.keyPreview, key.id)}
                              className="text-slate-400 hover:text-primary transition-colors"
                            >
                              {copiedId === key.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Last used {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                        </span>
                        <button 
                          onClick={() => deleteKey(key.id)}
                          className="p-2 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-20 text-center">
                  <div className="h-16 w-16 bg-muted rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
                    <Key className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-black tracking-tight mb-2">No API keys found</h3>
                  <p className="text-slate-400 max-w-xs mx-auto text-sm font-medium">
                    {searchQuery ? "No keys match your search criteria." : "Create your first API key to start using CloudGPT."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Create Key & Info */}
        <div className="space-y-6">
          <div className="bg-slate-950 text-white rounded-[2rem] p-8 shadow-2xl shadow-primary/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-all duration-700" />
            <div className="relative z-10">
              <h3 className="text-xl font-black tracking-tighter mb-6 flex items-center gap-3">
                <Plus className="h-5 w-5 text-primary" />
                New API Key
              </h3>
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Production App Key..." 
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
                <button 
                  onClick={createKey}
                  className="w-full bg-primary text-white font-black py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Generate Key
                </button>
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-xs font-bold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-border rounded-[2rem] p-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6">Security Tips</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="h-5 w-5 rounded bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                  <Lock className="h-3 w-3" />
                </div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">Never share your API keys or expose them in client-side code.</p>
              </li>
              <li className="flex gap-3">
                <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Shield className="h-3 w-3" />
                </div>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">Rotate your keys regularly to maintain high security standards.</p>
              </li>
            </ul>
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
