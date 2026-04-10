'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useCountdown } from '@/lib/hooks/useCountdown';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  Send, 
  Loader2, 
  Download, 
  Trash2, 
  Settings2,
  Sparkles,
  Bot,
  User,
  Zap,
  History,
  Info,
  Clock,
  Search,
  X,
  ChevronDown,
  Filter,
  Globe
} from 'lucide-react';
import { CHAT_MODELS, IMAGE_MODELS, VIDEO_MODELS, PREMIUM_MODELS, ULTRA_MODELS, ChatModel } from '@/lib/providers';
import { cn, hasProAccess, hasVideoAccess } from '@/lib/utils';
import { getModelUsageWeight } from '@/lib/api-keys-utils';
import Link from 'next/link';

type Mode = 'chat' | 'image' | 'video';

// Provider display name mapping
const PROVIDER_DISPLAY_NAMES: Record<string, string> = {
  pollinations: 'Pollinations',
  openrouter: 'OpenRouter',
  stablehorde: 'Stable Horde',
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
  bluesminds: 'Bluesminds',
  mino: 'Mino',
};

function formatProviderName(provider: string): string {
  const name = PROVIDER_DISPLAY_NAMES[provider];
  if (!name) return '';  // Hide if empty
  return name;
}


export default function PlaygroundPage() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [profile, setProfile] = useState<{ plan: string } | null>(null);
  const [mode, setMode] = useState<Mode>('chat');
  const availableChatModels = CHAT_MODELS.filter(m => m.provider !== 'kivest');
  const [selectedModel, setSelectedModel] = useState(availableChatModels[0]?.id || '');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  
  // Model selector modal state
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [modelSearch, setModelSearch] = useState('');
  const [modelFilter, setModelFilter] = useState<'all' | 'free' | 'premium'>('all');
  
  const currentModels = mode === 'chat' ? CHAT_MODELS.filter(m => m.provider !== 'kivest') : mode === 'image' ? IMAGE_MODELS : VIDEO_MODELS;
  const selectedModelData = currentModels.find(m => m.id === selectedModel);
  const countdown = useCountdown(selectedModelData?.downtimeUntil);

  // Filtered models for selector
  const filteredModels = useMemo(() => {
    return currentModels.filter(m => {
      const isPremium = PREMIUM_MODELS.has(m.id);
      const matchesSearch = m.name.toLowerCase().includes(modelSearch.toLowerCase()) || 
                          m.id.toLowerCase().includes(modelSearch.toLowerCase());
      const matchesFilter = modelFilter === 'all' || 
                          (modelFilter === 'premium' && isPremium) ||
                          (modelFilter === 'free' && !isPremium);
      return matchesSearch && matchesFilter;
    });
  }, [currentModels, modelSearch, modelFilter]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication status and fetch profile
    fetch('/api/profile')
      .then(res => {
        if (res.ok) {
          setIsSignedIn(true);
          return res.json();
        } else {
          setIsSignedIn(false);
          return null;
        }
      })
      .then(data => {
        if (data?.profile) {
          setProfile(data.profile);
        }
      })
      .catch(err => {
        console.error('Failed to fetch user profile:', err);
        setIsSignedIn(false);
      });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Close modal on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showModelSelector) {
        setShowModelSelector(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [showModelSelector]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setImageUrl('');
    setVideoUrl('');
    setMessages([]);
    setError('');
    if (newMode === 'chat') setSelectedModel(availableChatModels[0]?.id || '');
    if (newMode === 'image') setSelectedModel(IMAGE_MODELS[0].id);
    if (newMode === 'video') setSelectedModel(VIDEO_MODELS[0].id);
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    // Check if model is premium and user is not pro
    const isPremium = PREMIUM_MODELS.has(selectedModel);
    const isPro = hasProAccess(profile?.plan);
    const canAccessVideo = hasVideoAccess(profile?.plan);
    
    if (isPremium && !isPro) {
      setError('This model is only available for Pro members. Please upgrade your plan to use it.');
      return;
    }

    if (mode === 'video' && !canAccessVideo) {
      setError('Video generation is only available for Video Pro and Enterprise members. Please upgrade your plan to use it.');
      return;
    }

    if (countdown) {
      setError('This model is currently undergoing maintenance. Please try again later.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (mode === 'chat') {
        const newMessages = [...messages, { role: 'user', content: input }];
        setMessages(newMessages);
        setInput('');
        
        const response = await fetch('/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            messages: newMessages
          })
        });

        const data = await response.json();
        
        if (!response.ok) {
          let errorMessage = 'Failed to get response';
          try {
            const data = await response.json();
            errorMessage = data.error?.message || data.error || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const assistantMessage = data.choices?.[0]?.message?.content || 'No response';
        setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
      } else if (mode === 'image') {
        const response = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            prompt: input
          })
        });

        if (!response.ok) {
          let errorMessage = 'Failed to generate image';
          try {
            const data = await response.json();
            errorMessage = data.error?.message || data.error || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setInput('');
      } else if (mode === 'video') {
        const response = await fetch('/v1/video/generations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            prompt: input
          })
        });

        if (!response.ok) {
          let errorMessage = 'Failed to generate video';
          try {
            const data = await response.json();
            errorMessage = data.error?.message || data.error || errorMessage;
          } catch (e) {
            errorMessage = response.statusText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (data.data && data.data[0] && data.data[0].url) {
          setVideoUrl(data.data[0].url);
        } else {
          throw new Error('No video URL returned from API');
        }
        setInput('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-4rem)] bg-white dark:bg-slate-950 overflow-hidden relative">
      <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-[0.03] pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="h-auto border-b border-border/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 py-3 sm:py-2 relative z-20">
        <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-border/50 shrink-0">
            <ModeButton 
              active={mode === 'chat'} 
              onClick={() => handleModeChange('chat')}
              icon={<MessageSquare className="h-3.5 w-3.5" />}
              label="Chat"
            />
            <ModeButton 
              active={mode === 'image'} 
              onClick={() => handleModeChange('image')}
              icon={<ImageIcon className="h-3.5 w-3.5" />}
              label="Image"
            />
            <ModeButton 
              active={mode === 'video'} 
              onClick={() => handleModeChange('video')}
              icon={<Video className="h-3.5 w-3.5" />}
              label="Video"
            />
          </div>

          <div className="hidden sm:block h-6 w-px bg-border/50" />

          {/* Model Selector Button */}
          <button
            onClick={() => setShowModelSelector(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-white dark:bg-slate-900 shadow-sm hover:border-primary/30 transition-colors group shrink-0 min-w-[180px]"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary group-hover:text-primary transition-colors" />
            <span className="text-xs sm:text-sm font-bold truncate max-w-[120px]">
              {selectedModelData?.name || 'Select Model'}
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-[10px] border border-blue-200 dark:border-blue-800">
              x{getModelUsageWeight(selectedModel)}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary transition-colors" />
          </button>
        </div>

        <div className="flex items-center justify-between w-full sm:w-auto gap-3">
          <div className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black text-primary uppercase tracking-wider">{profile?.plan || 'Free'}</span>
          </div>

          <button 
            onClick={() => handleModeChange(mode)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-xs font-bold ml-auto"
            title="Clear Session"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden xs:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Model Selector Modal */}
      {showModelSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">Select Model</h2>
                <button
                  onClick={() => setShowModelSelector(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>
              
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search models..."
                    value={modelSearch}
                    onChange={(e) => setModelSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-slate-50 dark:bg-slate-800 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div className="flex gap-2">
                  <FilterButton active={modelFilter === 'all'} onClick={() => setModelFilter('all')}>All</FilterButton>
                  <FilterButton active={modelFilter === 'free'} onClick={() => setModelFilter('free')}>Free</FilterButton>
                  <FilterButton active={modelFilter === 'premium'} onClick={() => setModelFilter('premium')}>Premium</FilterButton>
                </div>
              </div>
            </div>

            {/* Model List */}
            <div className="overflow-y-auto max-h-[60vh] p-3 sm:p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredModels.map(m => {
                  const isPremium = PREMIUM_MODELS.has(m.id);
                  const isUltra = ULTRA_MODELS.has(m.id);
                  const isSelected = m.id === selectedModel;
                  const weight = getModelUsageWeight(m.id);
                  
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setShowModelSelector(false);
                        setModelSearch('');
                      }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl text-left transition-all border-2",
                        isSelected 
                          ? "bg-primary/10 border-primary shadow-md" 
                          : "bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        isUltra ? "bg-purple-100 dark:bg-purple-900/30" : isPremium ? "bg-amber-100 dark:bg-amber-900/30" : "bg-emerald-100 dark:bg-emerald-900/30"
                      )}>
                        {isUltra ? (
                          <Zap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        ) : isPremium ? (
                          <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        ) : (
                          <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {formatProviderName(m.provider) && (
                            <span className="text-[10px] font-medium text-slate-400 uppercase">{formatProviderName(m.provider)}</span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-black text-[9px]">
                            x{weight}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {filteredModels.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-500 font-medium">No models found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left Panel: Conversation/Result Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-8 scroll-smooth"
          >
            {mode === 'chat' ? (
              messages.length === 0 ? (
                <EmptyState 
                  icon={<Sparkles className="h-10 w-10 sm:h-12 sm:w-12" />} 
                  title="Universal Chat" 
                  description="Experience the power of any LLM through our unified interface. Start by typing a message below." 
                />
              ) : (
                <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                  {messages.map((m, i) => (
                    <div key={i} className={cn(
                      "flex gap-3 sm:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
                      m.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl shrink-0 flex items-center justify-center border shadow-sm",
                        m.role === 'user' 
                          ? "bg-primary border-primary/20 text-white shadow-primary/20" 
                          : "bg-white dark:bg-slate-900 border-border"
                      )}>
                        {m.role === 'user' ? <User className="h-4 w-4 sm:h-5 sm:w-5" /> : <Bot className="h-4 w-4 sm:h-5 sm:w-5" />}
                      </div>
                      <div className={cn(
                        "flex-1 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] text-xs sm:text-sm leading-relaxed border transition-all duration-300",
                        m.role === 'user' 
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xl" 
                          : "bg-white dark:bg-slate-900 border-border shadow-sm hover:border-primary/20"
                      )}>
                        <div className="prose dark:prose-invert max-w-none prose-sm sm:prose-base">
                          {m.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : mode === 'image' ? (
              imageUrl ? (
                <div className="flex flex-col items-center justify-center h-full p-2 sm:p-4">
                  <div className="relative group rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-white dark:border-slate-900 animate-in zoom-in-95 duration-700 max-w-4xl w-full">
                    <img src={imageUrl} alt="Generated" className="w-full h-auto object-contain" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-4 sm:gap-6 backdrop-blur-sm">
                      <a 
                        href={imageUrl} 
                        download="generated-image.png" 
                        className="h-12 w-12 sm:h-16 sm:w-16 bg-white rounded-full text-slate-950 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
                      >
                        <Download className="h-6 w-6 sm:h-8 sm:w-8" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState 
                  icon={<ImageIcon className="h-10 w-10 sm:h-12 sm:w-12" />} 
                  title="Creative Studio" 
                  description="Transform text into breathtaking visuals using diffusion models." 
                />
              )
            ) : (
              videoUrl ? (
                <div className="flex flex-col items-center justify-center h-full p-2 sm:p-4">
                  <div className="relative group rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 sm:border-8 border-white dark:border-slate-900 animate-in zoom-in-95 duration-700 max-w-4xl w-full">
                    <video src={videoUrl} controls className="w-full h-auto" />
                    <div className="absolute top-4 sm:top-8 right-4 sm:right-8 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <a 
                        href={videoUrl} 
                        download="generated-video.mp4" 
                        className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-full text-slate-950 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
                      >
                        <Download className="h-5 w-5 sm:h-6 sm:w-6" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState 
                  icon={<Video className="h-10 w-10 sm:h-12 sm:w-12" />} 
                  title="Motion Forge" 
                  description="Bring your ideas to life with cinematic AI video generation." 
                />
              )
            )}
            
            {loading && (
              <div className="max-w-4xl mx-auto flex gap-3 sm:gap-6 animate-pulse">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center border border-border">
                  <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                </div>
                <div className="flex-1 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white/50 dark:bg-slate-900/50 border border-border/50 text-xs sm:text-sm flex items-center gap-2 sm:gap-3">
                  <div className="flex gap-1">
                    <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                  <span className="text-slate-500 font-medium">Vetra is thinking...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="max-w-4xl mx-auto p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs sm:text-sm flex items-center justify-between gap-3 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
                    <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  </div>
                  <span className="font-bold">{error}</span>
                </div>
                {error.includes('Pro members') && (
                  <Link 
                    href="/pricing"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-colors shrink-0"
                  >
                    Upgrade
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 sm:p-6 md:p-10 bg-gradient-to-t from-white dark:from-slate-950 via-white/80 dark:via-slate-950/80 to-transparent">
            <div className="max-w-4xl mx-auto relative group">
              {countdown && (
                <div className="mb-3 sm:mb-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-center justify-between animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 animate-pulse" />
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-100">Model Maintenance</p>
                      <p className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400">Temporarily unavailable.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Back In</p>
                    <p className="text-xs sm:text-sm font-mono font-black text-amber-600 dark:text-amber-400">
                      {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-emerald-500/20 rounded-2xl sm:rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit();
                    }
                  }}
                  placeholder={mode === 'chat' ? "Ask anything..." : "Describe your creation..."}
                  className="w-full pl-5 sm:pl-6 pr-16 sm:pr-20 py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-0 focus:border-primary transition-all outline-none resize-none min-h-[60px] sm:min-h-[80px] max-h-[200px] sm:max-h-[300px] text-base font-medium shadow-xl shadow-slate-200/50 dark:shadow-none"
                  rows={1}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim() || loading}
                  className="absolute right-2 sm:right-3 top-2 sm:top-3 bottom-2 sm:top-3 h-auto sm:bottom-3 w-12 sm:w-14 rounded-xl sm:rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center disabled:opacity-30 hover:scale-105 active:scale-95 transition-all shadow-lg z-10"
                >
                  {loading ? <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin" /> : <Send className="h-5 w-5 sm:h-6 sm:w-6" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-6">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">API Online</span>
              </div>
              <div className="h-0.5 w-0.5 sm:h-1 sm:w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] truncate max-w-[150px] sm:max-w-none">
                {currentModels.find(m => m.id === selectedModel)?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Right Panel: Sidebar Info (Hidden on Mobile) */}
        <div className="hidden xl:flex w-80 border-l border-border/50 flex-col bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm p-8 space-y-10 overflow-y-auto">
          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Model Config</h3>
            </div>
            
            <div className="space-y-6">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-border shadow-sm hover:border-primary/30 transition-all group">
                {formatProviderName(selectedModelData?.provider || '') && (
                  <>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Provider</div>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                      {formatProviderName(selectedModelData?.provider || '')}
                      <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                    </p>
                  </>
                )}
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Model ID</div>
                <code className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg text-primary border border-border block w-fit">
                  {selectedModel}
                </code>
              </div>

              <div className="p-5 rounded-3xl bg-slate-100/50 dark:bg-slate-900/50 border border-dashed border-border">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {['High Speed', 'Context Aware', 'JSON Mode', 'Function Calling'].map(cap => (
                    <span key={cap} className="text-[9px] font-bold px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-border text-slate-600 dark:text-slate-400">
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <History className="h-4 w-4 text-emerald-500" />
              </div>
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Model Info</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Context Window</div>
                <div className="text-lg font-black text-slate-900 dark:text-slate-100">
                  {(selectedModelData as ChatModel)?.contextWindow ? `${(selectedModelData as ChatModel).contextWindow}k` : 'N/A'}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Provider</div>
                <div className="text-sm font-bold text-slate-900 dark:text-slate-100 capitalize">
                  {selectedModelData?.provider || 'Vetra'}
                </div>
              </div>
            </div>
          </section>

          <div className="mt-auto p-6 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 relative overflow-hidden group">
            <div className="absolute inset-0 dot-grid opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10">
              <h4 className="text-sm font-black mb-2">Need more power?</h4>
              <p className="text-[11px] font-bold opacity-70 mb-4 leading-relaxed">
                Unlock specialized models and higher rate limits with Pro.
              </p>
              <Link 
                href="/pricing"
                className="block w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl text-center"
              >
                Upgrade Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string, value: string, sub: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
        <span className="text-[9px] font-bold text-slate-400">{sub}</span>
      </div>
      <div className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{value}</div>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
        active 
          ? "bg-primary text-white shadow-md" 
          : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function ModeButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300",
        active 
          ? "bg-white dark:bg-slate-800 text-primary shadow-sm border border-border/50" 
          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
      )}
    >
      {icon}
      <span className={cn(
        "transition-all duration-300",
        active ? "inline" : "hidden sm:inline"
      )}>{label}</span>
    </button>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in-95 duration-1000">
      <div className="relative mb-8 group">
        <div className="absolute -inset-4 bg-primary/10 rounded-[2.5rem] blur-2xl group-hover:bg-primary/20 transition-all duration-700" />
        <div className="relative h-24 w-24 rounded-[2rem] bg-white dark:bg-slate-900 border-2 border-primary/20 flex items-center justify-center shadow-2xl shadow-primary/10 group-hover:scale-110 transition-transform duration-700">
          <div className="text-primary group-hover:rotate-12 transition-transform duration-700">{icon}</div>
        </div>
      </div>
      <h3 className="text-3xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">{title}</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-md text-base font-medium leading-relaxed">{description}</p>
      
      <div className="grid grid-cols-2 gap-4 mt-12 w-full max-w-sm">
        {[
          { label: "High Precision", icon: <Zap className="h-3 w-3" /> },
          { label: "Low Latency", icon: <History className="h-3 w-3" /> }
        ].map(item => (
          <div key={item.label} className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-border">
            <span className="text-primary">{item.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
