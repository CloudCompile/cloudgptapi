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
  ChevronRight
} from 'lucide-react';

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

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50/50 dark:bg-slate-900/50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">API Management</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage your access keys and monitor usage across all AI models.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <input
                type="text"
                placeholder="Key name (e.g. Production)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="pl-4 pr-32 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none w-full md:w-64"
                onKeyDown={(e) => e.key === 'Enter' && createKey()}
              />
              <button
                onClick={createKey}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4" />
                Create
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="h-5 w-5" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {/* New Key Modal/Alert */}
        {createdKey && (
          <div className="mb-10 p-6 rounded-2xl bg-primary/5 border-2 border-primary/20 animate-in zoom-in-95 duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-primary">New API Key Created!</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Copy this key now. For your security, it won't be shown again.</p>
                </div>
              </div>
              <button 
                onClick={() => setCreatedKey(null)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
            
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white dark:bg-slate-950 border border-primary/30 shadow-inner">
              <code className="flex-1 font-mono text-sm break-all text-slate-800 dark:text-slate-200 px-2">{createdKey.key}</code>
              <button
                onClick={() => copyToClipboard(createdKey.key, 'new')}
                className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900 hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-2 text-xs font-bold"
              >
                {copiedId === 'new' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedId === 'new' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Keys Table */}
        <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-500">Loading your keys...</p>
            </div>
          ) : keys.length === 0 ? (
            <div className="p-16 text-center">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Key className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">No API keys yet</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">Create your first API key to start using the CloudGPT unified gateway.</p>
              <button 
                onClick={() => document.querySelector('input')?.focus()}
                className="px-6 py-2.5 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
              >
                Generate Key
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/50">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Key Preview</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Usage</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Used</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  {keys.map((key) => (
                    <tr key={key.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{key.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-tighter">ID: {key.id.slice(0,8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">
                            {key.keyPreview}
                          </code>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-center">
                          <span className="text-sm font-bold text-primary">{key.usageCount || 0}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Requests</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <Clock className="h-3.5 w-3.5" />
                          {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleDateString() : 'Never'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => deleteKey(key.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
                            title="Delete Key"
                          >
                            <Trash2 className="h-4 w-4" />
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
        
        {/* Quick Links */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickLink 
            icon={<Activity className="h-5 w-5 text-blue-500" />}
            title="System Status"
            description="Monitor real-time API performance."
            href="#"
          />
          <QuickLink 
            icon={<ExternalLink className="h-5 w-5 text-purple-500" />}
            title="Documentation"
            description="Explore our integration guides."
            href="/api-docs"
          />
          <QuickLink 
            icon={<ChevronRight className="h-5 w-5 text-emerald-500" />}
            title="Model Explorer"
            description="Browse all available AI models."
            href="/models"
          />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) {
  return (
    <a href={href} className="flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all hover:shadow-md group">
      <div className="mb-4">{icon}</div>
      <h4 className="font-bold mb-1 flex items-center gap-2">
        {title}
        <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    </a>
  );
}
