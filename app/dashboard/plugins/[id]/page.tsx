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
  History
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
      // For testing, we'll call a special test endpoint or use the existing logic
      // Since we don't want to make a real proxy call, we'll simulate the detection/search
      // In a real app, you might have an API route for this
      
      // Simulate detection and lore search
      setTimeout(() => {
        const entities = testQuery.split(' ').filter(word => 
          word.length > 2 && word[0] === word[0].toUpperCase()
        );
        
        let lore = "No specific lore found for these entities.";
        if (entities.some(e => e.toLowerCase().includes('gojo'))) {
          lore = "Satoru Gojo is a major protagonist of the Jujutsu Kaisen series. He is a special grade jujutsu sorcerer and widely recognized as the strongest in the world. Gojo is the pride of the Gojo Family, the first person to inherit both the Limitless and the Six Eyes in four hundred years.";
        } else if (entities.some(e => e.toLowerCase().includes('sukuna'))) {
          lore = "Ryomen Sukuna, more often called just Sukuna, is a mighty cursed spirit known as the Disputed King of Curses. He serves as one of the primary antagonists of the Jujutsu Kaisen series.";
        }
        
        setTestResult({ entities, lore });
        setTesting(false);
      }, 1000);
    } catch (err) {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10 animate-in fade-in duration-700">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 overflow-hidden">
        <Link href="/dashboard" className="hover:text-primary transition-colors whitespace-nowrap">Dashboard</Link>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="text-slate-300 whitespace-nowrap">API Key Plugins</span>
        <ChevronRight className="h-3 w-3 shrink-0" />
        <span className="text-primary truncate max-w-[150px]">{id}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-primary transition-colors text-xs sm:text-sm font-bold mb-3 sm:mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Book className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter">Fandom Knowledge Plugin</h1>
              <p className="text-[11px] sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                Auto-inject lore and wiki data into your API requests.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={cn(
            "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border font-bold text-[10px] sm:text-sm transition-all",
            enabled 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" 
              : "bg-slate-100 border-slate-200 text-slate-400"
          )}>
            <div className={cn("h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full", enabled ? "bg-emerald-500" : "bg-slate-300")} />
            {enabled ? 'Active' : 'Disabled'}
          </div>
          <button 
            onClick={saveSettings}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl font-black text-[10px] sm:text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-black/10"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            {saveStatus === 'success' ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl w-full sm:w-fit border border-border overflow-x-auto no-scrollbar">
        {[
          { id: 'settings', label: 'Settings', icon: Settings },
          { id: 'library', label: 'Library', icon: Book },
          { id: 'test', label: 'Testing', icon: Play },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-sm font-black transition-all whitespace-nowrap flex-1 sm:flex-none justify-center",
              activeTab === tab.id 
                ? "bg-white dark:bg-slate-800 text-primary shadow-sm" 
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <tab.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Settings Column */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          {activeTab === 'settings' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Main Toggle Card */}
              <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all duration-700" />
                
                <div className="relative z-10 flex flex-col sm:flex-row items-start justify-between gap-6">
                  <div className="space-y-3 sm:space-y-4 max-w-md">
                    <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[9px] sm:text-[10px] font-black tracking-widest uppercase border border-primary/20">
                      <Zap className="h-3 w-3 fill-current" />
                      Feature Flag
                    </div>
                    <h2 className="text-lg sm:text-2xl font-black tracking-tight">Enable Knowledge Injection</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                      When enabled, our proxy will automatically scan your messages for fictional characters, 
                      places, or items and inject relevant lore from wikis into the prompt.
                    </p>
                    <div className="pt-1 sm:pt-2 flex items-center gap-4 sm:gap-6">
                      <button 
                        onClick={() => setEnabled(!enabled)}
                        className={cn(
                          "relative inline-flex h-6 w-10 sm:h-7 sm:w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20",
                          enabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 sm:h-5 sm:w-5 transform rounded-full bg-white transition-transform shadow-sm",
                          enabled ? "translate-x-5 sm:translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                      <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                        {enabled ? 'Plugin is ON' : 'Plugin is OFF'}
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:flex h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800 items-center justify-center text-slate-400 group-hover:scale-110 transition-transform duration-500 shrink-0">
                    <Database className="h-8 w-8 sm:h-10 sm:w-10" />
                  </div>
                </div>
              </div>

              {/* Configuration Card */}
              <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm space-y-6 sm:space-y-8">
                <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 sm:gap-3">
                  <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  Configuration
                </h3>

                {/* Additional Plugins */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-border rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-wide">Long-term Memory</span>
                      </div>
                      <button
                        onClick={() => setMemoryEnabled(!memoryEnabled)}
                        className={cn(
                          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
                          memoryEnabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          memoryEnabled ? "translate-x-5" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">Persist conversation memory per API key.</p>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-border rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-primary" />
                        <span className="text-xs font-black uppercase tracking-wide">Web Search</span>
                      </div>
                      <button
                        onClick={() => setSearchPluginEnabled(!searchPluginEnabled)}
                        className={cn(
                          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
                          searchPluginEnabled ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          searchPluginEnabled ? "translate-x-5" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">Inject live web snippets into prompts for any model.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                      Max Lore Tokens
                      <Info className="h-3 w-3" />
                    </label>
                    <div className="relative">
                      <input 
                        type="range" 
                        min="200" 
                        max="2000" 
                        step="100"
                        value={settings.maxLoreTokens}
                        onChange={(e) => setSettings({...settings, maxLoreTokens: parseInt(e.target.value)})}
                        className="w-full h-1.5 sm:h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <div className="flex justify-between mt-2 text-[9px] sm:text-[10px] font-bold text-slate-400">
                        <span>200</span>
                        <span className="text-primary font-black">{settings.maxLoreTokens} tokens</span>
                        <span>2000</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Cache Mode</label>
                    <select 
                      value={settings.cacheMode}
                      onChange={(e) => setSettings({...settings, cacheMode: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="aggressive">Aggressive (Faster)</option>
                      <option value="standard">Standard</option>
                      <option value="none">Disabled (Live lookup)</option>
                    </select>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Auto-Summarize</label>
                      <button 
                        onClick={() => setSettings({...settings, autoSummarize: !settings.autoSummarize})}
                        className={cn(
                          "relative inline-flex h-4.5 w-9 sm:h-5 sm:w-10 items-center rounded-full transition-colors",
                          settings.autoSummarize ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-3 w-3 sm:h-3.5 sm:w-3.5 transform rounded-full bg-white transition-transform",
                          settings.autoSummarize ? "translate-x-5 sm:translate-x-5.5" : "translate-x-1"
                        )} />
                      </button>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium leading-relaxed">
                      Use AI to condense long wiki pages into concise lore snippets before injection.
                    </p>
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 block">Preferred Sources</label>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {['Fandom', 'Wikipedia', 'Wiki.gg', 'Official'].map(source => (
                        <button
                          key={source}
                          onClick={() => {
                            const s = source.toLowerCase();
                            const current = settings.preferredSources;
                            if (current.includes(s)) {
                              setSettings({...settings, preferredSources: current.filter(x => x !== s)});
                            } else {
                              setSettings({...settings, preferredSources: [...current, s]});
                            }
                          }}
                          className={cn(
                            "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-tighter transition-all border",
                            settings.preferredSources.includes(source.toLowerCase())
                              ? "bg-primary/10 border-primary/20 text-primary"
                              : "bg-slate-50 dark:bg-slate-800 border-border text-slate-400 hover:border-slate-400"
                          )}
                        >
                          {source}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 sm:space-y-4 sm:col-span-2">
                    <label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 block">Fandom Wiki Base URL</label>
                    <input
                      type="url"
                      placeholder="https://community.fandom.com/wiki/"
                      value={settings.wikiBaseUrl || ''}
                      onChange={(e) => setSettings({ ...settings, wikiBaseUrl: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <p className="text-[10px] text-slate-400">
                      Example: https://jujutsu-kaisen.fandom.com/wiki/ (used by lore retrieval services).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Lore Library */}
              <div className="bg-white dark:bg-slate-900 border border-border rounded-3xl sm:rounded-[2rem] p-5 sm:p-8 shadow-sm space-y-6 sm:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2 sm:gap-3">
                    <Book className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Lore Library
                  </h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <div className="relative w-full sm:w-48">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-400" />
                      <input 
                        type="text"
                        placeholder="Search lore..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl pl-8 sm:pl-9 pr-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full whitespace-nowrap">
                      {snippets.length} Snippets
                    </div>
                  </div>
                </div>

                {/* Add Snippet Form */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-border/50 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Snippet Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Satoru Gojo" 
                        value={newSnippet.title}
                        onChange={(e) => setNewSnippet({...newSnippet, title: e.target.value})}
                        className="w-full bg-white dark:bg-slate-900 border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex items-end">
                      <button 
                        onClick={addSnippet}
                        disabled={!newSnippet.title || !newSnippet.content}
                        className="w-full h-10 sm:h-[46px] bg-primary text-white font-black rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-[10px] sm:text-sm"
                      >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        Add to Library
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Lore Content</label>
                    <textarea 
                      placeholder="The details about this character, place, or item..." 
                      value={newSnippet.content}
                      onChange={(e) => setNewSnippet({...newSnippet, content: e.target.value})}
                      className="w-full bg-white dark:bg-slate-900 border border-border rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px] sm:min-h-[100px] resize-none"
                    />
                  </div>
                </div>

                {/* Snippets List */}
                <div className="space-y-4">
                  {loadingSnippets ? (
                    <div className="flex justify-center py-8 sm:py-10">
                      <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary/50" />
                    </div>
                  ) : filteredSnippets.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      {filteredSnippets.map((snippet) => (
                        <div key={snippet.id} className="group bg-white dark:bg-slate-950 border border-border rounded-2xl p-4 sm:p-5 hover:border-primary/30 transition-all relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => deleteSnippet(snippet.id)}
                              className="p-1.5 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                            >
                              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </button>
                          </div>
                          <div className="space-y-1.5 sm:space-y-2">
                            <h4 className="font-black text-xs sm:text-sm pr-8">{snippet.title}</h4>
                            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                              {snippet.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 sm:py-12 border border-dashed border-border rounded-3xl">
                      <Database className="h-6 w-6 sm:h-8 sm:w-8 text-slate-200 dark:text-slate-800 mx-auto mb-3" />
                      <p className="text-xs sm:text-sm font-bold text-slate-400">
                        {searchQuery ? "No matching lore snippets found." : "Your lore library is empty."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Test Card */}
              <div className="bg-slate-950 text-white rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-primary/10 space-y-5 sm:space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-all duration-700" />
                
                <div className="relative z-10 space-y-5 sm:space-y-6">
                  <h3 className="text-lg sm:text-xl font-black tracking-tighter flex items-center gap-2 sm:gap-3">
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    Live Test
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3.5 sm:left-4 top-3.5 sm:top-4 h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-500" />
                      <textarea 
                        placeholder="Try: Tell me about Gojo Satoru..." 
                        value={testQuery}
                        onChange={(e) => setTestQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl pl-10 sm:pl-11 pr-4 py-3 sm:py-4 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all min-h-[100px] sm:min-h-[120px] resize-none font-medium"
                      />
                    </div>
                    
                    <button 
                      onClick={runTest}
                      disabled={testing || !testQuery.trim()}
                      className="w-full bg-primary text-white font-black py-3 sm:py-4 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm"
                    >
                      {testing ? <RefreshCw className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />}
                      {testing ? 'Scanning Wikia...' : 'Test Injection'}
                    </button>
                  </div>

                  {testResult && (
                    <div className="space-y-3 sm:space-y-4 animate-in slide-in-from-top-4 duration-500">
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {testResult.entities.map(e => (
                          <span key={e} className="px-2 py-0.5 sm:py-1 bg-emerald-500/20 text-emerald-400 text-[9px] sm:text-[10px] font-black uppercase rounded-lg border border-emerald-500/20">
                            {e}
                          </span>
                        ))}
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-5 space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-primary">
                          <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          Injected Lore
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic font-medium">
                          "{testResult.lore}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className="space-y-6 sm:space-y-8">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 shadow-sm">
            <h4 className="font-black text-xs sm:text-sm mb-4">Plugin Overview</h4>
            <div className="space-y-5 sm:space-y-6">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs font-black">Wiki Scraping</div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5 sm:mt-1">Retrieves real-time data from fandom communities and Wikipedia.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shrink-0">
                  <History className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs font-black">Lore Memory</div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5 sm:mt-1">Manually added snippets are prioritized over auto-scraped data.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <div className="text-[11px] sm:text-xs font-black">Fast Injection</div>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium mt-0.5 sm:mt-1">Optimized caching ensures minimal latency during prompt enrichment.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 text-white rounded-3xl sm:rounded-[2rem] p-6 sm:p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-all duration-700" />
            <div className="relative z-10">
              <h3 className="text-base sm:text-lg font-black tracking-tight mb-3 sm:mb-4">API Usage</h3>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium leading-relaxed mb-4 sm:mb-6">
                The Lore Library snippets are automatically injected into the system prompt when the Fandom plugin is enabled.
              </p>
              <div className="p-3 sm:p-4 bg-white/5 rounded-xl border border-white/10 font-mono text-[9px] sm:text-[10px] text-primary">
                {"{ \"fandom_enabled\": true }"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
