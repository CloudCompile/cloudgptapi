'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CHAT_MODELS, 
  IMAGE_MODELS, 
  VIDEO_MODELS,
  ChatModel,
  ImageModel,
  VideoModel,
  PREMIUM_MODELS
} from '@/lib/providers';
import { getModelDetails, ModelDetails } from '@/lib/model-details';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  Search,
  Zap,
  Cpu,
  Globe,
  Filter,
  ArrowUpRight,
  X,
  Info,
  TrendingUp,
  TrendingDown,
  Target,
  Settings,
  Crown,
  Heart,
  Sparkles,
  BookOpen,
  Send,
  User,
  Coffee,
  LayoutGrid,
  List,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getModelMultiplier, getMultiplierLabel, getMultiplierDescription } from './multiplier-utils';

interface ModelStatus {
  id: string;
  status: 'online' | 'offline' | 'checking' | 'maintenance';
  latency?: number;
}

type ModelType = (ChatModel | ImageModel | VideoModel) & { type: 'chat' | 'image' | 'video' };
type FilteredModelType = ModelType & { isRoleplay: boolean };

// Countdown hook for downtime
function useCountdown(targetDate?: string) {
  const [timeLeft, setTimeLeft] = useState<{hours: number, minutes: number, seconds: number} | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - Date.now();
      
      if (difference <= 0) {
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}

const ALL_MODELS: ModelType[] = [
  ...CHAT_MODELS.filter(m => m.provider !== 'kivest').map(m => ({ ...m, type: 'chat' as const })),
  ...IMAGE_MODELS.map(m => ({ ...m, type: 'image' as const })),
  ...VIDEO_MODELS.map(m => ({ ...m, type: 'video' as const })),
];

export default function ModelsPage() {
  const [statuses, setStatuses] = useState<Record<string, ModelStatus>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'chat' | 'image' | 'video' | 'free' | 'premium' | 'roleplay'>('roleplay');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [usage, setUsage] = useState<{
    plan: string;
    limit: number;
    remaining: number;
    used: number;
    resetAt: number;
    isPeakHours: boolean;
  } | null>(null);

  const PROVIDERS = useMemo(() => {
    const providers = new Set(ALL_MODELS.map(m => m.provider.toLowerCase()));
    // Filter out disabled providers
    providers.delete('kivest');
    return ['all', ...Array.from(providers)].sort();
  }, []);

  const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
    all: 'All',
    pollinations: 'Pollinations',
    openrouter: 'OpenRouter',
    kivest: '',  // Temporarily disabled
    liz: 'Liz',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    deepseek: 'DeepSeek',
    moonshot: 'Moonshot',
    xai: 'xAI',
    zhipu: 'Zhipu',
    minimax: 'MiniMax',
    shalom: '',
    github: 'GitHub',
    stablehorde: 'Stable Horde',
    poe: 'Poe',
    claude: 'Claude',
    gemini: 'Gemini',
    meridian: 'Meridian',
  };

  function getProviderDisplayName(provider: string): string {
    return PROVIDER_DISPLAY_NAMES[provider] || provider;
  }

  const fetchStatuses = useCallback(async () => {
    try {
      const response = await fetch('/api/status');
      if (!response.ok) throw new Error('Failed to fetch status');
      
      const providerStatuses = await response.json();
      const updatedStatuses: Record<string, ModelStatus> = {};
      
      ALL_MODELS.forEach(m => {
        const providerName = m.provider.toLowerCase();
        const pStatus = providerStatuses[providerName];
        
        // Check if model has active downtime
        const isInDowntime = m.downtimeUntil && new Date(m.downtimeUntil).getTime() > Date.now();
        
        if (isInDowntime) {
          updatedStatuses[m.id] = { id: m.id, status: 'maintenance' };
        } else if (pStatus) {
          updatedStatuses[m.id] = { 
            id: m.id, 
            status: pStatus.status,
            latency: pStatus.latency
          };
        } else {
          // Default for providers not in our check list
          updatedStatuses[m.id] = { 
            id: m.id, 
            status: 'online',
            latency: Math.floor(Math.random() * 400 + 100)
          };
        }
      });
      
      setStatuses(updatedStatuses);
      setIsLoading(false);
    } catch (err) {
      console.error('Status fetch error:', err);
      // Fallback to random if API fails
      const fallbackStatuses: Record<string, ModelStatus> = {};
      ALL_MODELS.forEach(m => {
        fallbackStatuses[m.id] = { id: m.id, status: 'online', latency: 200 };
      });
      setStatuses(fallbackStatuses);
      setIsLoading(false);
    }
  }, []);

  const fetchUsage = useCallback(async () => {
    try {
      const response = await fetch('/api/usage');
      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (err) {
      console.error('Usage fetch error:', err);
    }
  }, []);

  useEffect(() => {
    // Initialize statuses
    const initialStatuses: Record<string, ModelStatus> = {};
    ALL_MODELS.forEach(m => {
      initialStatuses[m.id] = { id: m.id, status: 'checking' };
    });
    setStatuses(initialStatuses);

    fetchStatuses();
    fetchUsage();
    const interval = setInterval(() => {
      fetchStatuses();
      fetchUsage();
    }, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [fetchStatuses, fetchUsage]);

  const filteredModels = useMemo(() => {
    return ALL_MODELS.map(model => ({
      ...model,
      isRoleplay: model.id.includes('kimi') || 
                  model.id.includes('glm') || 
                  model.id.includes('deepseek') || 
                  model.id.includes('llama') ||
                  model.id.includes('qwen') ||
                  model.id.includes('mistral')
    } as FilteredModelType)).filter(model => {
      const isFree = model.id.endsWith(':free') || !PREMIUM_MODELS.has(model.id);
      
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.provider.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesTab = activeTab === 'all' || model.type === activeTab;
      if (activeTab === 'free') {
        matchesTab = isFree;
      } else if (activeTab === 'premium') {
        matchesTab = !isFree;
      } else if (activeTab === 'roleplay') {
        matchesTab = model.isRoleplay && model.type === 'chat';
      }

      const matchesProvider = selectedProvider === 'all' || model.provider.toLowerCase() === selectedProvider;
      
      return matchesSearch && matchesTab && matchesProvider;
    }).sort((a, b) => {
      // First sort by Roleplay status (Roleplay first)
      if (a.isRoleplay !== b.isRoleplay) {
        return a.isRoleplay ? -1 : 1;
      }

      // Then sort by Premium status (Premium first)
      const isPremiumA = !((a.id.endsWith(':free') || !PREMIUM_MODELS.has(a.id)));
      const isPremiumB = !((b.id.endsWith(':free') || !PREMIUM_MODELS.has(b.id)));
      
      if (isPremiumA !== isPremiumB) {
        return isPremiumA ? -1 : 1;
      }
      
      // Then sort by context window descending
      const contextA = (a as any).contextWindow || 0;
      const contextB = (b as any).contextWindow || 0;
      
      if (contextA !== contextB) {
        return contextB - contextA;
      }
      
      // Fallback to name
      return a.name.localeCompare(b.name);
    });
  }, [searchQuery, activeTab, selectedProvider]);

  const stats = useMemo(() => {
    const online = Object.values(statuses).filter(s => s.status === 'online').length;
    const avgLatency = Math.round(
      Object.values(statuses)
        .filter(s => s.latency)
        .reduce((acc, curr) => acc + (curr.latency || 0), 0) / 
      (Object.values(statuses).filter(s => s.latency).length || 1)
    );
    return { online, total: ALL_MODELS.length, avgLatency };
  }, [statuses]);

  // Global downtime check
  const pollinationsDowntime = ALL_MODELS.find(m => m.provider === 'pollinations')?.downtimeUntil;
  const globalCountdown = useCountdown(pollinationsDowntime);

  const handleModelClick = (model: ModelType) => {
    setSelectedModel(model);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedModel(null), 300); // Clear after animation
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 sm:pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 mesh-gradient opacity-60 dark:opacity-40" />
      <div className="fixed inset-0 dot-grid opacity-30" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-8 sm:mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="text-left">
            <div className="flex items-center justify-start gap-2 text-primary font-bold mb-2 sm:mb-4">
              <div className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl bg-primary/10 backdrop-blur-md border border-primary/20">
                <Heart className="h-3.5 w-3.5 sm:h-5 sm:w-5 fill-current" />
              </div>
              <span className="tracking-[0.2em] uppercase text-[9px] sm:text-xs">Creative Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-2 sm:mb-6 tracking-tight leading-[0.9]">
              The Model <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-pink-500">Multiverse</span>
            </h1>
            <p className="text-sm sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed font-medium hidden sm:block">
              Choose your partner for creative writing, storytelling, and complex roleplay. Our models are optimized for lengthy histories and deep character immersion.
            </p>
          </div>
          
          <div className="flex overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:flex lg:flex-wrap justify-start gap-2 sm:gap-4">
            <StatCard 
              label="Active" 
              value={`${stats.online}/${stats.total}`} 
              icon={<CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-500" />}
              trend="+10 today"
            />
            <StatCard 
              label="Latency" 
              value={`${stats.avgLatency}ms`} 
              icon={<Zap className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />}
              trend="-12ms"
            />
            {usage && (
              <StatCard 
                label="Usage" 
                value={`${usage.used}/${usage.limit}`} 
                icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />}
                trend={`${usage.remaining} left`}
              />
            )}
          </div>
        </div>

        {/* Multiplier Explainer Section */}
        <div className="mb-8 sm:mb-16 p-5 sm:p-10 rounded-[1.5rem] sm:rounded-[2.5rem] bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
          <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10">
            <div className="flex-shrink-0">
              <div className="p-3 sm:p-4 rounded-2xl sm:rounded-[1.5rem] bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                <TrendingUp className="h-8 w-8 sm:h-10 sm:w-10" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mb-2 sm:mb-4 tracking-tight">What are Request Multipliers?</h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-4 font-medium">
                Each model has a <span className="font-bold text-blue-600 dark:text-blue-400">request multiplier</span> that determines how your API quota is consumed. For example:
              </p>
              <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                  <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">0.5x Model</div>
                  <div className="text-lg sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">1 request = 0.5 quota</div>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 mt-2">Discounted, efficient models</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm ring-2 ring-blue-400/30">
                  <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">1x Model</div>
                  <div className="text-lg sm:text-2xl font-black text-blue-600 dark:text-blue-400">1 request = 1 quota</div>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 mt-2">Standard cost models</p>
                </div>
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 backdrop-blur-sm">
                  <div className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">5x Model</div>
                  <div className="text-lg sm:text-2xl font-black text-amber-600 dark:text-amber-400">1 request = 5 quota</div>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-500 mt-2">Premium, powerful models</p>
                </div>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-4 italic">Your daily limit is divided by each model's multiplier. Higher multipliers use quota faster but offer superior capabilities.</p>
            </div>
          </div>
        </div>

        {/* Global Maintenance Banner */}
        {globalCountdown && (
          <div className="mb-6 sm:mb-12 p-4 sm:p-8 rounded-[1.2rem] sm:rounded-[2.5rem] bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
              <div className="flex items-start gap-3 sm:gap-6">
                <div className="p-2 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                  <Clock className="h-5 w-5 sm:h-8 sm:w-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base sm:text-2xl font-black text-amber-900 dark:text-amber-100 mb-0.5 sm:mb-2">Provider Maintenance</h3>
                  <p className="text-[10px] sm:text-base text-amber-800/80 dark:text-amber-400/80 font-medium max-w-xl">
                    Pollinations models are currently undergoing scheduled maintenance. Service is expected to return shortly.
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-center md:items-end gap-1 sm:gap-2 px-4 sm:px-8 py-2 sm:py-4 rounded-xl sm:rounded-3xl bg-amber-500/20 border border-amber-500/30 w-full sm:w-auto">
                <span className="text-[8px] sm:text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">Estimated Return</span>
                <span className="text-xl sm:text-4xl font-mono font-black text-amber-700 dark:text-amber-300">
                  {String(globalCountdown.hours).padStart(2, '0')}:{String(globalCountdown.minutes).padStart(2, '0')}:{String(globalCountdown.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="sticky top-16 sm:top-24 z-30 mb-6 sm:mb-12 flex flex-col gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-2 duration-700 delay-200">
          <div className="p-1.5 sm:p-3 rounded-[1.2rem] sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none flex flex-col md:flex-row items-center gap-2 sm:gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-5 sm:w-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search models..."
                className="w-full pl-10 sm:pl-14 pr-4 sm:pr-6 py-2.5 sm:py-4 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-[1rem] sm:rounded-[2rem] focus:ring-2 focus:ring-primary/20 transition-all outline-none text-base font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-1 p-1 sm:p-2 bg-slate-100/50 dark:bg-slate-800/50 rounded-[1rem] sm:rounded-[2rem] w-full md:w-auto overflow-x-auto no-scrollbar">
              <TabButton active={activeTab === 'roleplay'} onClick={() => setActiveTab('roleplay')} icon={<Sparkles className="h-3.5 w-3.5" />} label="Roleplay" />
              <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} icon={<Globe className="h-3.5 w-3.5" />} label="All" />
              <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare className="h-3.5 w-3.5" />} label="Chat" />
              <TabButton active={activeTab === 'image'} onClick={() => setActiveTab('image')} icon={<ImageIcon className="h-3.5 w-3.5" />} label="Image" />
              <TabButton active={activeTab === 'free'} onClick={() => setActiveTab('free')} icon={<Zap className="h-3.5 w-3.5" />} label="Free" />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100/50 dark:bg-slate-800/50 rounded-xl sm:rounded-2xl ml-auto border border-white/10 dark:border-slate-800/30">
              <button 
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'grid' ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-white dark:bg-slate-700 text-primary shadow-sm" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Provider Quick Filter */}
          <div className="flex items-center gap-2 px-3 sm:px-6 py-1.5 sm:py-3 overflow-x-auto no-scrollbar bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl rounded-[1rem] sm:rounded-[2rem] border border-white/10 dark:border-slate-800/30">
            {PROVIDERS.filter(p => p !== '').map(provider => (
              <button
                key={provider}
                onClick={() => setSelectedProvider(provider)}
                className={cn(
                  "px-2.5 sm:px-4 py-0.5 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-bold transition-all whitespace-nowrap border capitalize",
                  selectedProvider === provider
                    ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105"
                    : "bg-white/50 dark:bg-slate-800/50 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-primary/50"
                )}
              >
                {getProviderDisplayName(provider)}
              </button>
            ))}
          </div>
        </div>

        {/* Models Grid/List */}
        <div className={cn(
          "animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300",
          viewMode === 'grid' 
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "flex flex-col gap-3"
        )}>
          {filteredModels.map((model, i) => (
            viewMode === 'grid' ? (
              <ModelCard 
                key={model.id} 
                model={model} 
                status={statuses[model.id] || { id: model.id, status: 'checking' }} 
                onClick={() => handleModelClick(model)}
                index={i}
              />
            ) : (
              <ModelListItem
                key={model.id}
                model={model}
                status={statuses[model.id] || { id: model.id, status: 'checking' }}
                onClick={() => handleModelClick(model)}
                index={i}
              />
            )
          ))}
          
          {filteredModels.length === 0 && (
            <div className="col-span-full py-32 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 mb-6 shadow-xl">
                <Filter className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No models found</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">Try adjusting your search or filters to find what you're looking for.</p>
            </div>
          )}
        </div>
      </div>


      {/* Model Details Modal */}
      {isModalOpen && selectedModel && (
        <ModelDetailsModal 
          model={selectedModel} 
          status={statuses[selectedModel.id] || { id: selectedModel.id, status: 'checking' }}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend?: string }) {
  return (
    <div className="px-3 sm:px-8 py-3 sm:py-6 rounded-xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 shadow-xl shadow-slate-200/40 dark:shadow-none flex items-center gap-2.5 sm:gap-6 min-w-[140px] sm:min-w-[200px] transition-all hover:scale-105 hover:bg-white/80 dark:hover:bg-slate-900/80 shrink-0">
      <div className="p-2 sm:p-4 rounded-lg sm:rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-inner shrink-0">
        {React.cloneElement(icon as React.ReactElement, { className: cn((icon as React.ReactElement).props.className, "h-3.5 w-3.5 sm:h-5 sm:w-5") })}
      </div>
      <div className="min-w-0">
        <p className="text-[9px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{label}</p>
        <div className="flex items-baseline gap-1 sm:gap-2">
          <p className="text-sm sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
          {trend && (
            <span className={cn(
              "text-[7px] sm:text-[10px] font-bold px-1 sm:px-2 py-0.5 rounded-full hidden sm:inline-block",
              trend.startsWith('+') ? "bg-emerald-100/50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-amber-100/50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400"
            )}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 sm:gap-3 px-2.5 sm:px-6 py-1.5 sm:py-3 rounded-[0.8rem] sm:rounded-[1.5rem] text-[10px] sm:text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none justify-center",
        active 
          ? "bg-white dark:bg-slate-700 text-primary shadow-lg scale-105 z-10" 
          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/30 dark:hover:bg-slate-800/30"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { className: "h-3 w-3 sm:h-4 sm:w-4" })}
      <span className={cn(active ? "inline" : "hidden sm:inline")}>{label}</span>
    </button>
  );
}

function ModelCard({ model, status, onClick, index }: { model: FilteredModelType, status: ModelStatus, onClick: () => void, index: number }) {
  const countdown = useCountdown(model.downtimeUntil);
  const isFree = model.id.endsWith(':free') || !PREMIUM_MODELS.has(model.id);
  const isRoleplay = model.isRoleplay;
  
  const typeColors: Record<'chat' | 'image' | 'video', string> = {
    chat: isRoleplay 
      ? "from-pink-500/20 to-purple-500/20 text-pink-600 dark:text-pink-400 border-pink-200/50 dark:border-pink-800/50 shadow-pink-500/10" 
      : "from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-800/50 shadow-blue-500/10",
    image: "from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border-purple-200/50 dark:border-purple-800/50 shadow-purple-500/10",
    video: "from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-800/50 shadow-amber-500/10"
  };

  const typeIcons: Record<'chat' | 'image' | 'video', React.ReactNode> = {
    chat: isRoleplay ? <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" /> : <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />,
    image: <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />,
    video: <Video className="h-5 w-5 sm:h-6 sm:w-6" />
  };

  return (
    <>
      {/* Desktop Card */}
      <div 
        onClick={onClick}
        className={cn(
          "hidden sm:flex group relative flex-col p-0 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(16,185,129,0.15)] hover:-translate-y-2 overflow-hidden cursor-pointer animate-in fade-in zoom-in-95",
          index % 2 === 0 ? "delay-75" : "delay-150"
        )}>
        
        {/* Top Gradient Header */}
        <div className={cn(
          "h-32 w-full bg-gradient-to-br relative overflow-hidden transition-all duration-500 group-hover:h-36",
          typeColors[model.type]
        )}>
          <div className="absolute inset-0 dot-grid opacity-20" />
          <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="absolute bottom-4 left-6 flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/90 dark:bg-slate-950/90 shadow-xl backdrop-blur-md border border-white/50 dark:border-slate-800/50 group-hover:scale-110 transition-transform duration-500">
              {typeIcons[model.type]}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Model Tier</span>
              {isFree ? (
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black text-sm">
                  <Zap className="w-3 h-3" />
                  <span>FREE</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-black text-sm">
                  <Target className="w-3 h-3" />
                  <span>PREMIUM</span>
                </div>
              )}
            </div>
          </div>

          {/* Status Badge Over Image */}
          <div className="absolute top-4 right-6">
            {status.status === 'maintenance' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/90 text-white shadow-lg backdrop-blur-md">
                <Clock className="w-3 h-3 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Maintenance</span>
              </div>
            ) : status.status === 'online' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/90 text-white shadow-lg backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Online</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-500/90 text-white shadow-lg backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-[10px] font-black uppercase tracking-widest">{status.status}</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-8 pt-6 flex flex-col flex-1 relative z-10">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors flex items-center gap-2 tracking-tight">
              {model.name}
              <span className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-sm border border-blue-200 dark:border-blue-800">
                x{getModelMultiplier(model.id)}
              </span>
              <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50 font-bold group-hover:border-primary/30 transition-colors">
                {model.id}
              </code>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 h-10 mt-4 leading-relaxed font-medium group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              {model.description || `High-performance ${model.type} model powered by ${model.provider}.`}
            </p>
          </div>

          <div className="mt-auto pt-6 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 group-hover:border-primary/30 transition-colors">
                <Globe className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-[0.2em]">Provider</span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 capitalize">{model.provider}</span>
              </div>
            </div>
            
            {status.latency && (
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-[0.2em]">Latency</span>
                <div className="flex items-center gap-1 text-xs font-mono font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 group-hover:border-primary/30 transition-colors">
                  <Zap className="h-3 sm:w-3 text-primary" />
                  {status.latency}ms
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile List Item */}
      <div 
        onClick={onClick}
        className="sm:hidden flex items-center gap-3 p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 active:scale-[0.98] transition-all shadow-sm group"
      >
        <div className={cn(
          "p-2.5 rounded-xl bg-gradient-to-br shrink-0",
          model.type === 'chat' && isRoleplay ? "from-pink-500 to-purple-600 text-white" :
          model.type === 'chat' ? "from-blue-500 to-indigo-600 text-white" :
          model.type === 'image' ? "from-purple-500 to-pink-600 text-white" :
          "from-amber-500 to-orange-600 text-white"
        )}>
          {isRoleplay ? <Sparkles className="h-5 w-5 animate-pulse" /> :
           React.cloneElement(typeIcons[model.type] as React.ReactElement, { className: "h-5 w-5" })}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate tracking-tight">
              {model.name}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-[10px] border border-blue-200 dark:border-blue-800">
                x{getModelMultiplier(model.id)}
              </span>
            </h3>
            {status.status === 'online' ? (
              <div className="flex items-center gap-1">
                <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{status.latency}ms</span>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            ) : status.status === 'maintenance' ? (
              <Clock className="w-3 h-3 text-amber-500" />
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400">{model.provider}</span>
            <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-1">
              {isFree ? (
                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-emerald-500">Free</span>
              ) : (
                <span className="text-[8px] font-black uppercase tracking-[0.15em] text-amber-500">Premium</span>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
          <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
        </div>
      </div>
    </>
  );
}


function ModelListItem({ model, status, onClick, index }: { model: FilteredModelType, status: ModelStatus, onClick: () => void, index: number }) {
  const isFree = model.id.endsWith(':free') || !PREMIUM_MODELS.has(model.id);
  const isRoleplay = model.isRoleplay;
  
  const typeIcons: Record<'chat' | 'image' | 'video', React.ReactNode> = {
    chat: isRoleplay ? <Sparkles className="h-4 w-4 animate-pulse" /> : <MessageSquare className="h-4 w-4" />,
    image: <ImageIcon className="h-4 w-4" />,
    video: <Video className="h-4 w-4" />
  };

  return (
    <div 
      onClick={onClick}
      className="group flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 hover:border-primary/40 hover:bg-white/80 dark:hover:bg-slate-900/80 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 animate-in slide-in-from-left-4 fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className={cn(
        "p-3.5 rounded-2xl bg-gradient-to-br shrink-0 shadow-lg transition-transform group-hover:scale-110 duration-500",
        model.type === 'chat' && isRoleplay ? "from-pink-500 to-purple-600 text-white shadow-purple-500/20" :
        model.type === 'chat' ? "from-blue-500 to-indigo-600 text-white shadow-blue-500/20" :
        model.type === 'image' ? "from-purple-500 to-pink-600 text-white shadow-purple-500/20" :
        "from-amber-500 to-orange-600 text-white shadow-amber-500/20"
      )}>
        {typeIcons[model.type]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
          <h3 className="text-lg font-black text-slate-900 dark:text-white truncate tracking-tight group-hover:text-primary transition-colors">
            {model.name}
            <span className="ml-2 px-2 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-xs border border-blue-200 dark:border-blue-800">
              x{getModelMultiplier(model.id)}
            </span>
          </h3>
          <div className="flex items-center gap-2">
            {isFree ? (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest border border-emerald-500/10">Free</span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest border border-amber-500/10">Premium</span>
            )}
            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">{model.provider}</span>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1 font-medium group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
          {model.description || `High-performance ${model.type} model powered by ${model.provider}.`}
        </p>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 sm:ml-4 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/50 pt-3 sm:pt-0">
        <div className="flex flex-col items-start sm:items-end min-w-[80px]">
          <span className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-[0.2em] mb-0.5">Latency</span>
          <div className="flex items-center gap-1.5 text-xs font-mono font-black text-slate-900 dark:text-white">
            <Zap className="h-3 w-3 text-primary" />
            {status.latency || '---'}ms
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end min-w-[80px]">
          <span className="text-[9px] uppercase text-slate-400 dark:text-slate-500 font-black tracking-[0.2em] mb-0.5">Status</span>
          {status.status === 'online' ? (
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-500 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </div>
          ) : status.status === 'maintenance' ? (
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-500 uppercase tracking-widest">
              <Clock className="w-3 h-3 animate-pulse" />
              Maint.
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              {status.status}
            </div>
          )}
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 group-hover:bg-primary/10 group-hover:border-primary/20 transition-all ml-auto sm:ml-0">
          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-primary transition-all translate-x-0 group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
}


function ModelDetailsModal({ model, status, onClose }: { model: ModelType, status: ModelStatus, onClose: () => void }) {
  const details = getModelDetails(model.id, model.type);
  const countdown = useCountdown(model.downtimeUntil);
  const isFree = model.id.endsWith(':free') || !PREMIUM_MODELS.has(model.id);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] sm:rounded-[3rem] shadow-2xl border border-white/20 dark:border-slate-800/50 overflow-hidden animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background mesh in modal */}
        <div className="absolute inset-0 mesh-gradient opacity-20" />
        <div className="absolute inset-0 dot-grid opacity-10" />

        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 p-4 sm:p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 transition-all hover:rotate-90 shadow-lg border border-slate-200/50 dark:border-slate-700/50"
          >
            <X className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 dark:text-slate-400" />
          </button>
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-8 text-center sm:text-left">
            <div className={cn(
              "p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-2xl shrink-0 transition-transform hover:scale-105 duration-500",
              model.type === 'chat' && (model as any).isRoleplay ? "bg-gradient-to-br from-pink-500 to-purple-600 text-white shadow-purple-500/40" :
              model.type === 'chat' ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/40" :
              model.type === 'image' ? "bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-purple-500/40" :
              "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/40"
            )}>
              {(model as any).isRoleplay ? <Sparkles className="h-6 w-6 sm:h-10 sm:w-10 animate-pulse" /> :
               model.type === 'chat' ? <MessageSquare className="h-6 w-6 sm:h-10 sm:w-10" /> :
               model.type === 'image' ? <ImageIcon className="h-6 w-6 sm:h-10 sm:w-10" /> :
               <Video className="h-6 w-6 sm:h-10 sm:w-10" />}
            </div>
            
            <div className="flex-1 min-w-0 sm:pt-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 mb-3">
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight truncate max-w-full">
                  {model.name}
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                  {isFree ? (
                    <div className="flex items-center gap-1 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 backdrop-blur-md">
                      <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-500" />
                      <span className="text-[10px] sm:text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Free</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 backdrop-blur-md">
                      <Target className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 dark:text-amber-400" />
                      <span className="text-[10px] sm:text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Premium</span>
                    </div>
                  )}
                </div>
                {status.status === 'maintenance' && countdown ? (
                  <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20 backdrop-blur-md">
                      <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                      <span className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Maintenance</span>
                    </div>
                    <div className="text-center px-4 py-1 rounded-full bg-amber-500/20 dark:bg-amber-500/30 border border-amber-500/30">
                      <span className="text-lg sm:text-2xl font-mono font-black text-amber-700 dark:text-amber-300">
                        {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                      </span>
                    </div>
                  </div>
                ) : status.status === 'online' ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/20 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Online</span>
                  </div>
                ) : status.status === 'offline' ? (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-xs font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest">Offline</span>
                  </div>
                ) : null}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3 mb-6">
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Model ID:</span>
                <code className="text-[10px] sm:text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl text-primary border border-slate-200 dark:border-slate-700/50 select-all cursor-copy font-bold truncate max-w-[200px] sm:max-w-none" title="Click to copy">
                  {model.id}
                </code>
              </div>
              <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium px-2 sm:px-0">
                {details?.longDescription || model.description || `High-performance ${model.type} model powered by ${model.provider}.`}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-200px)] p-5 sm:p-10 relative z-10">
          {/* Maintenance Notice */}
          {status.status === 'maintenance' && countdown && (
            <div className="mb-8 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-start gap-4">
                <div className="p-2.5 sm:p-3 rounded-xl bg-amber-500/20 text-amber-600 shrink-0">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-lg font-black text-amber-900 dark:text-amber-200 mb-1 sm:mb-2">Scheduled Maintenance</h4>
                  <p className="text-[11px] sm:text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                    This model is currently undergoing scheduled maintenance. Service will be restored in{' '}
                    <span className="font-mono font-bold whitespace-nowrap">{countdown.hours}h {countdown.minutes}m {countdown.seconds}s</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-8 sm:mb-10">
            <span className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 uppercase tracking-widest">
              {model.provider}
            </span>
            {details?.family && (
              <span className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-primary/10 text-[10px] sm:text-xs font-black text-primary border border-primary/20 backdrop-blur-md uppercase tracking-widest">
                {details.family}
              </span>
            )}
            <span className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-md text-[10px] sm:text-xs font-black text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 capitalize uppercase tracking-widest">
              {model.type}
            </span>
          </div>

          {details ? (
            <div className="space-y-10">
              {/* Request Multiplier */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Request Multiplier</h3>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/5 to-cyan-500/5 dark:from-blue-500/10 dark:to-cyan-500/10 border border-blue-200/30 dark:border-blue-800/30 backdrop-blur-sm">
                  <div className="flex items-baseline gap-4 mb-4">
                    <span className="text-4xl sm:text-5xl font-black text-blue-600 dark:text-blue-400">{getMultiplierLabel(getModelMultiplier(model.id))}</span>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">per request</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {getMultiplierDescription(getModelMultiplier(model.id))}
                  </p>
                </div>
              </section>

              {/* Strengths */}
              {details.strengths && details.strengths.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Capabilities</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {details.strengths.map((strength, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 group hover:border-emerald-500/30 transition-colors">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{strength}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Weaknesses */}
              {details.weaknesses && details.weaknesses.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-75">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                      <TrendingDown className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Limitations</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {details.weaknesses.map((weakness, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 group hover:border-amber-500/30 transition-colors">
                        <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}


              {/* Use Cases */}
              {details.useCases && details.useCases.length > 0 && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                      <Target className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Best Use Cases</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {details.useCases.map((useCase, idx) => (
                      <div key={idx} className="px-6 py-3 rounded-2xl bg-primary/5 dark:bg-primary/10 border border-primary/10 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-primary/10 transition-colors cursor-default">
                        {useCase}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Technical Specifications */}
              {details.technicalSpecs && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Technical Specs</h3>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {details.technicalSpecs.contextWindow && (
                      <div className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-1 sm:mb-2">Context</p>
                        <p className="text-sm sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">{details.technicalSpecs.contextWindow}</p>
                      </div>
                    )}
                    {details.technicalSpecs.architecture && (
                      <div className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-1 sm:mb-2">Arch</p>
                        <p className="text-sm sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">{details.technicalSpecs.architecture}</p>
                      </div>
                    )}
                    {details.technicalSpecs.releaseDate && (
                      <div className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-1 sm:mb-2">Released</p>
                        <p className="text-sm sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">{details.technicalSpecs.releaseDate}</p>
                      </div>
                    )}
                    {details.technicalSpecs.maxTokens && (
                      <div className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-1 sm:mb-2">Output</p>
                        <p className="text-sm sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">{details.technicalSpecs.maxTokens}</p>
                      </div>
                    )}
                    {status.latency && (
                      <div className="p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                        <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em] mb-1 sm:mb-2">Latency</p>
                        <p className="text-sm sm:text-xl font-black text-primary tracking-tight flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
                          {status.latency}ms
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-500">
              <div className="p-8 rounded-[2.5rem] bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 mb-8 shadow-inner">
                <Settings className="h-16 w-16 text-slate-400 animate-spin-slow" />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">System Analysis</h3>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium leading-relaxed">
                Detailed intelligence for this model is currently being indexed. Full metrics will be available in the next sync.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

