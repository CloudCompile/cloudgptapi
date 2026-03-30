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
  ChevronRight
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

  // Work in Progress - Show disabled state with warning
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-10 animate-in fade-in duration-700">
      {/* Work in Progress Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/50">
            <Loader2 className="h-6 w-6 text-amber-600 dark:text-amber-400 animate-spin" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl font-black text-amber-800 dark:text-amber-200 mb-1">
              Work in Progress
            </h2>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              This feature is temporarily unavailable while we make improvements.
              Please check back later.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
