'use client';

import { useState, useEffect } from 'react';
import { 
  Puzzle, 
  Book, 
  Search, 
  Activity, 
  ChevronRight, 
  Zap, 
  Shield, 
  Database,
  Key,
  ArrowRight,
  Info,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ApiKey {
  id: string;
  name: string;
  fandomEnabled: boolean;
}

export default function PluginsPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchKeys();
  }, []);

  async function fetchKeys() {
    setLoading(true);
    try {
      const response = await fetch('/api/keys');
      const data = await response.json();
      
      // For each key, we'd ideally know if plugins are enabled
      // For now, we'll just list the keys and let users click into them
      setKeys(data.keys || []);
    } catch (err) {
      console.error('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  }

  const filteredKeys = keys.filter(key => 
    key.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availablePlugins = [
    {
      id: 'fandom',
      name: 'Fandom Knowledge',
      description: 'Automatically inject lore and wiki data into your AI requests based on detected entities.',
      icon: Book,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      status: 'Stable'
    },
    {
      id: 'memory',
      name: 'Long-term Memory',
      description: 'Give your AI agents persistent memory across different sessions and characters.',
      icon: Database,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      status: 'Native'
    },
    {
      id: 'websearch',
      name: 'Web Search',
      description: 'Enable real-time web browsing and information retrieval for more accurate responses.',
      icon: Search,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      status: 'Beta'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4 border border-primary/20">
            <Puzzle className="h-3.5 w-3.5 fill-current" />
            <span>Plugin Marketplace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">Plugins & Extensions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium text-sm sm:text-base">Enhance your API keys with specialized knowledge and capabilities.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Key Selector - Priority on Mobile */}
        <div className="lg:col-span-1 lg:order-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-border rounded-[2rem] p-6 sm:p-8 shadow-sm">
            <h3 className="text-xl font-black tracking-tight mb-2 sm:mb-6">1. Select API Key</h3>
            <p className="text-xs text-slate-400 font-medium mb-6">Choose a key to configure plugins for.</p>
            
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search your keys..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <div className="py-10 text-center">
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Loading keys...</span>
                </div>
              ) : filteredKeys.length > 0 ? (
                filteredKeys.map((key) => (
                  <Link 
                    key={key.id}
                    href={`/dashboard/plugins/${key.id}`}
                    className="flex items-center justify-between p-4 rounded-2xl border border-transparent hover:border-border hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-white dark:bg-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors shadow-sm">
                        <Key className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-black tracking-tight truncate">{key.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">ID: {key.id.substring(0, 8)}...</div>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                  </Link>
                ))
              ) : (
                <div className="py-10 text-center">
                  <p className="text-xs font-bold text-slate-400">No keys found</p>
                  <Link href="/dashboard" className="text-[10px] font-black text-primary uppercase mt-2 block hover:underline">
                    Create your first key
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="hidden lg:block bg-slate-900 text-white rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/30 transition-all duration-700" />
            <div className="relative z-10">
              <h3 className="text-lg font-black tracking-tight mb-4">API Documentation</h3>
              <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
                Learn how to programmatically control plugins and integrate them into your own applications.
              </p>
              <Link 
                href="/docs" 
                className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:gap-3 transition-all"
              >
                View Docs
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Available Plugins List */}
        <div className="lg:col-span-2 lg:order-1 space-y-6">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            2. Choose Plugin
            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-400 uppercase tracking-widest ml-2">
              {availablePlugins.length}
            </span>
          </h2>
          
          <div className="grid sm:grid-cols-2 gap-4">
            {availablePlugins.map((plugin) => (
              <div key={plugin.id} className="group relative bg-white dark:bg-slate-900 border border-border rounded-[2rem] p-6 hover:border-primary/30 transition-all duration-500 shadow-sm overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-all" />
                
                <div className="relative z-10 space-y-4">
                  <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500", plugin.bgColor, plugin.color)}>
                    <plugin.icon className="h-6 w-6" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-lg tracking-tight">{plugin.name}</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {plugin.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                      {plugin.description}
                    </p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary group-hover:gap-3 transition-all">
                      Select a key to configure
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Info className="h-7 w-7" />
            </div>
            <div>
              <h4 className="font-black text-lg tracking-tight">How Plugins Work</h4>
              <p className="text-sm text-slate-500 font-medium mt-1 leading-relaxed">
                Plugins are attached to specific API keys. When you make a request using a key with plugins enabled, 
                our proxy automatically processes the input and enriches it with the selected capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
