'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Settings,
  Zap,
  Book,
  Check,
  Save,
  ArrowLeft,
  Info,
  Play,
  Loader2,
  Shield,
  Search,
  Database,
  RefreshCw,
  MessageSquare,
  Plus,
  Trash2,
  FileText,
  History,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoreSnippet {
  id: string;
  title: string;
  content: string;
  source?: string;
  createdAt?: string;
}

interface FandomSettings {
  maxLoreTokens: number;
  autoSummarize: boolean;
  cacheMode: string;
  preferredSources: string[];
  wikiBaseUrl?: string;
}

export default function PluginSettingsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [memoryEnabled, setMemoryEnabled] = useState(false);
  const [searchPluginEnabled, setSearchPluginEnabled] = useState(false);
  const [settings, setSettings] = useState<FandomSettings>({
    maxLoreTokens: 800,
    autoSummarize: true,
    cacheMode: 'aggressive',
    preferredSources: ['fandom', 'wikipedia'],
    wikiBaseUrl: 'https://community.fandom.com/wiki/'
  });
  
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<{entities: string[], lore: string} | null>(null);
  const [testing, setTesting] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [showBetaWarning, setShowBetaWarning] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'library' | 'test'>('settings');
  const [snippets, setSnippets] = useState<LoreSnippet[]>([]);
  const [loadingSnippets, setLoadingSnippets] = useState(false);
  const [newSnippet, setNewSnippet] = useState({ title: '', content: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSnippets = snippets.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    fetchSettings();
    fetchSnippets();
  }, [id]);

  async function fetchSnippets() {
    setLoadingSnippets(true);
    try {
      const response = await fetch(`/api/keys/${id}/plugins/fandom/lore`);
      if (response.ok) {
        const data = await response.json();
        setSnippets(data.snippets || []);
      }
    } catch (err) {
      console.error('Failed to fetch snippets');
    } finally {
      setLoadingSnippets(false);
    }
  }

  async function addSnippet() {
    if (!newSnippet.title || !newSnippet.content) return;
    
    try {
      const response = await fetch(`/api/keys/${id}/plugins/fandom/lore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSnippet),
      });

      if (response.ok) {
        setNewSnippet({ title: '', content: '' });
        fetchSnippets();
      }
    } catch (err) {
      console.error('Failed to add snippet');
    }
  }

  async function deleteSnippet(snippetId: string) {
    try {
      const response = await fetch(`/api/keys/${id}/plugins/fandom/lore?snippetId=${snippetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchSnippets();
      }
    } catch (err) {
      console.error('Failed to delete snippet');
    }
  }

  async function fetchSettings() {
    try {
      const [fandomResp, memoryResp, searchResp] = await Promise.all([
        fetch(`/api/keys/${id}/plugins/fandom`),
        fetch(`/api/keys/${id}/plugins/memory`),
        fetch(`/api/keys/${id}/plugins/search`)
      ]);

      const fandomData = await fandomResp.json();
      const memoryData = await memoryResp.json();
      const searchData = await searchResp.json();

      if (fandomResp.ok) {
        setEnabled(Boolean(fandomData.enabled));
        if (fandomData.settings) {
          setSettings({
            ...fandomData.settings,
            wikiBaseUrl: fandomData.settings.wikiBaseUrl || 'https://community.fandom.com/wiki/'
          });
        }
      }

      if (memoryResp.ok) {
        setMemoryEnabled(Boolean(memoryData.enabled));
      }

      if (searchResp.ok) {
        setSearchPluginEnabled(Boolean(searchData.enabled));
      }
    } catch (err) {
      console.error('Failed to fetch plugin settings');
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    setSaveStatus('idle');
    try {
      // 1. Save fandom/main settings first (this is the most complex one)
      const fandomRes = await fetch(`/api/keys/${id}/plugins/fandom`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled, settings }),
      });

      if (!fandomRes.ok) throw new Error('Failed to save fandom settings');

      // 2. Save memory settings
      const memoryRes = await fetch(`/api/keys/${id}/plugins/memory`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: memoryEnabled }),
      });

      if (!memoryRes.ok) throw new Error('Failed to save memory settings');

      // 3. Save search settings
      const searchRes = await fetch(`/api/keys/${id}/plugins/search`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: searchPluginEnabled }),
      });

      if (!searchRes.ok) throw new Error('Failed to save search settings');

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      console.error('Plugin save error:', err);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }

  async function runTest() {
    if (!testQuery.trim()) return;

    setTesting(true);
    setTestResult(null);
    try {
      const response = await fetch(`/api/keys/${id}/plugins/fandom/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: testQuery }),
      });
      const data = await response.json();
      if (!response.ok) {
        setTestResult({ entities: [], lore: `Error: ${data.error || 'Unknown error'}` });
      } else {
        setTestResult({ entities: data.entities || [], lore: data.lore || 'No lore found.' });
      }
    } catch (err) {
      setTestResult({ entities: [], lore: 'Network error: could not reach the server.' });
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Loading plugin configuration...</p>
      </div>
    );
  }

  return (
    <>
      {showBetaWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight mb-2">Plugins are in Beta</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Everything in this section is a work in progress. Features may behave unexpectedly or change without notice.
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mt-3">
                  If you run into any bugs, please report them in our{' '}
                  <a
                    href="https://discord.gg/fFnnwZHV"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary font-bold hover:underline"
                  >
                    Discord server
                  </a>
                  .
                </p>
              </div>
              <button
                onClick={() => setShowBetaWarning(false)}
                className="w-full py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard/plugins')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tighter">Plugin Settings</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Key: <span className="font-mono text-xs">{String(id).slice(0, 8)}…</span>
            </p>
          </div>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all',
            saveStatus === 'success' ? 'bg-green-500 text-white' :
            saveStatus === 'error' ? 'bg-red-500 text-white' :
            'bg-primary text-primary-foreground hover:opacity-90',
            saving && 'opacity-60 cursor-not-allowed'
          )}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> :
           saveStatus === 'success' ? <Check className="h-4 w-4" /> :
           <Save className="h-4 w-4" />}
          {saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Error — try again' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        {(['settings', 'library', 'test'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all flex items-center gap-1.5',
              activeTab === tab
                ? 'bg-white dark:bg-slate-900 shadow-sm text-foreground'
                : 'text-slate-500 hover:text-foreground'
            )}
          >
            {tab === 'settings' && <Settings className="h-3.5 w-3.5" />}
            {tab === 'library' && <Book className="h-3.5 w-3.5" />}
            {tab === 'test' && <Play className="h-3.5 w-3.5" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Settings Tab ── */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Memory */}
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 mt-0.5">
                  <Database className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base">Memory</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Beta</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Persistent per-character memory. Remembers past interactions across sessions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMemoryEnabled(v => !v)}
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                  memoryEnabled ? 'bg-purple-500' : 'bg-slate-200 dark:bg-slate-700'
                )}
                aria-label="Toggle memory plugin"
              >
                <span className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200',
                  memoryEnabled ? 'translate-x-5' : 'translate-x-0'
                )} />
              </button>
            </div>
          </div>

          {/* Lorebook */}
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 mt-0.5">
                  <Book className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base">Lorebook / Wiki</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Beta</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Auto-injects character and world lore from Fandom/Wikipedia into context.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEnabled(v => !v)}
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                  enabled ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
                )}
                aria-label="Toggle lorebook plugin"
              >
                <span className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200',
                  enabled ? 'translate-x-5' : 'translate-x-0'
                )} />
              </button>
            </div>

            {enabled && (
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Lore Tokens</label>
                    <input
                      type="number"
                      min={100}
                      max={4000}
                      value={settings.maxLoreTokens}
                      onChange={e => setSettings(s => ({ ...s, maxLoreTokens: Number(e.target.value) }))}
                      className="mt-1.5 w-full px-3 py-2 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cache Mode</label>
                    <select
                      value={settings.cacheMode}
                      onChange={e => setSettings(s => ({ ...s, cacheMode: e.target.value }))}
                      className="mt-1.5 w-full px-3 py-2 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="aggressive">Aggressive</option>
                      <option value="moderate">Moderate</option>
                      <option value="none">None</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wiki Base URL</label>
                  <input
                    type="url"
                    value={settings.wikiBaseUrl || ''}
                    onChange={e => setSettings(s => ({ ...s, wikiBaseUrl: e.target.value }))}
                    className="mt-1.5 w-full px-3 py-2 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://community.fandom.com/wiki/"
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSummarize}
                    onChange={e => setSettings(s => ({ ...s, autoSummarize: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Auto-summarize long lore entries</span>
                </label>
              </div>
            )}
          </div>

          {/* Web Search */}
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 mt-0.5">
                  <Search className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base">Web Search</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Beta
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    Fetches real-time search results and injects them into context before each request.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSearchPluginEnabled(v => !v)}
                className={cn(
                  'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none',
                  searchPluginEnabled ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                )}
                aria-label="Toggle web search plugin"
              >
                <span className={cn(
                  'inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200',
                  searchPluginEnabled ? 'translate-x-5' : 'translate-x-0'
                )} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Library Tab ── */}
      {activeTab === 'library' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search snippets…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Add snippet */}
            <div className="border-t border-border pt-4 space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Add Snippet</p>
              <input
                type="text"
                placeholder="Title"
                value={newSnippet.title}
                onChange={e => setNewSnippet(s => ({ ...s, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <textarea
                placeholder="Content…"
                value={newSnippet.content}
                onChange={e => setNewSnippet(s => ({ ...s, content: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              />
              <button
                onClick={addSnippet}
                disabled={!newSnippet.title || !newSnippet.content}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
              >
                <Plus className="h-4 w-4" />
                Add Snippet
              </button>
            </div>
          </div>

          {loadingSnippets ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : filteredSnippets.length === 0 ? (
            <div className="text-center py-14 text-slate-400">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium">No lore snippets yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSnippets.map(snippet => (
                <div key={snippet.id} className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{snippet.title}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{snippet.content}</p>
                      {snippet.source && (
                        <p className="text-xs text-slate-400 mt-1.5">Source: {snippet.source}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteSnippet(snippet.id)}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                      aria-label="Delete snippet"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Test Tab ── */}
      {activeTab === 'test' && (
        <div className="space-y-4">
          {!enabled && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl text-sm text-amber-700 dark:text-amber-300">
              <Info className="h-4 w-4 flex-shrink-0" />
              <p>Enable the Lorebook plugin in Settings to use the test feature.</p>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 space-y-4">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Test Query</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Tell me about Gojo Satoru…"
                  value={testQuery}
                  onChange={e => setTestQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runTest()}
                  className="flex-1 px-3 py-2 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  onClick={runTest}
                  disabled={testing || !testQuery.trim()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50 hover:opacity-90 transition-opacity"
                >
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {testing ? 'Running…' : 'Run Test'}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Sends your query to the Lorebook VPS and shows exactly what lore would be injected into context.
              </p>
            </div>

            {testResult && (
              <div className="border-t border-border pt-4 space-y-4">
                {testResult.entities.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Entities Detected</p>
                    <div className="flex flex-wrap gap-1.5">
                      {testResult.entities.map((e, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {e}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Injected Lore</p>
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-sm text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                    {testResult.lore}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
}
