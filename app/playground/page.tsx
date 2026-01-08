'use client';

import { useState, useRef, useEffect } from 'react';
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
  Info
} from 'lucide-react';
import { CHAT_MODELS, IMAGE_MODELS, VIDEO_MODELS } from '@/lib/providers';
import { cn } from '@/lib/utils';

type Mode = 'chat' | 'image' | 'video';

export default function PlaygroundPage() {
  const [mode, setMode] = useState<Mode>('chat');
  const [selectedModel, setSelectedModel] = useState(CHAT_MODELS[0].id);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [error, setError] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setImageUrl('');
    setVideoUrl('');
    setMessages([]);
    setError('');
    if (newMode === 'chat') setSelectedModel(CHAT_MODELS[0].id);
    if (newMode === 'image') setSelectedModel(IMAGE_MODELS[0].id);
    if (newMode === 'video') setSelectedModel(VIDEO_MODELS[0].id);
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

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
          throw new Error(data.error?.message || 'Failed to get response');
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
          const data = await response.json();
          throw new Error(data.error || 'Failed to generate image');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
        setInput('');
      } else if (mode === 'video') {
        const response = await fetch('/api/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            prompt: input
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to generate video');
        }

        const data = await response.json();
        setVideoUrl(data.url);
        setInput('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentModels = mode === 'chat' ? CHAT_MODELS : mode === 'image' ? IMAGE_MODELS : VIDEO_MODELS;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-slate-950 overflow-hidden relative">
      <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />
      <div className="absolute inset-0 dot-grid opacity-[0.03] pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="h-16 border-b flex items-center justify-between px-6 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1 p-1 bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl border border-border/50">
            <ModeButton 
              active={mode === 'chat'} 
              onClick={() => handleModeChange('chat')}
              icon={<MessageSquare className="h-4 w-4" />}
              label="Chat"
            />
            <ModeButton 
              active={mode === 'image'} 
              onClick={() => handleModeChange('image')}
              icon={<ImageIcon className="h-4 w-4" />}
              label="Image"
            />
            <ModeButton 
              active={mode === 'video'} 
              onClick={() => handleModeChange('video')}
              icon={<Video className="h-4 w-4" />}
              label="Video"
            />
          </div>

          <div className="h-6 w-px bg-border/50" />

          <div className="flex items-center gap-3 px-4 py-2 rounded-xl border bg-white dark:bg-slate-900 shadow-sm hover:border-primary/30 transition-colors group">
            <Settings2 className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none border-none focus:ring-0 cursor-pointer min-w-[140px]"
            >
              {currentModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleModeChange(mode)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-sm font-bold"
            title="Clear Session"
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Left Panel: Conversation/Result Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth"
          >
            {mode === 'chat' ? (
              messages.length === 0 ? (
                <EmptyState 
                  icon={<Sparkles className="h-12 w-12" />} 
                  title="Universal Chat" 
                  description="Experience the power of any LLM through our unified interface. Start by typing a message below." 
                />
              ) : (
                <div className="max-w-4xl mx-auto space-y-8">
                  {messages.map((m, i) => (
                    <div key={i} className={cn(
                      "flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
                      m.role === 'user' ? "flex-row-reverse" : "flex-row"
                    )}>
                      <div className={cn(
                        "h-10 w-10 rounded-2xl shrink-0 flex items-center justify-center border shadow-sm",
                        m.role === 'user' 
                          ? "bg-primary border-primary/20 text-white shadow-primary/20" 
                          : "bg-white dark:bg-slate-900 border-border"
                      )}>
                        {m.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                      </div>
                      <div className={cn(
                        "flex-1 p-6 rounded-[2rem] text-sm leading-relaxed border transition-all duration-300",
                        m.role === 'user' 
                          ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-xl" 
                          : "bg-white dark:bg-slate-900 border-border shadow-sm hover:border-primary/20"
                      )}>
                        <div className="prose dark:prose-invert max-w-none">
                          {m.content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : mode === 'image' ? (
              imageUrl ? (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-900 animate-in zoom-in-95 duration-700 max-w-4xl w-full">
                    <img src={imageUrl} alt="Generated" className="w-full h-auto object-contain" />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center gap-6 backdrop-blur-sm">
                      <a 
                        href={imageUrl} 
                        download="generated-image.png" 
                        className="h-16 w-16 bg-white rounded-full text-slate-950 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
                      >
                        <Download className="h-8 w-8" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState 
                  icon={<ImageIcon className="h-12 w-12" />} 
                  title="Creative Studio" 
                  description="Transform text into breathtaking visuals using state-of-the-art diffusion models." 
                />
              )
            ) : (
              videoUrl ? (
                <div className="flex flex-col items-center justify-center h-full p-4">
                  <div className="relative group rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-900 animate-in zoom-in-95 duration-700 max-w-4xl w-full">
                    <video src={videoUrl} controls className="w-full h-auto" />
                    <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <a 
                        href={videoUrl} 
                        download="generated-video.mp4" 
                        className="h-12 w-12 bg-white rounded-full text-slate-950 flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-2xl"
                      >
                        <Download className="h-6 w-6" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState 
                  icon={<Video className="h-12 w-12" />} 
                  title="Motion Forge" 
                  description="Bring your ideas to life with cinematic AI video generation. Describe your scene below." 
                />
              )
            )}
            
            {loading && (
              <div className="max-w-4xl mx-auto flex gap-6 animate-pulse">
                <div className="h-10 w-10 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center border border-border">
                  <Bot className="h-5 w-5 text-slate-400" />
                </div>
                <div className="flex-1 p-6 rounded-[2rem] bg-white/50 dark:bg-slate-900/50 border border-border/50 text-sm flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                  <span className="text-slate-500 font-medium">CloudGPT is thinking...</span>
                </div>
              </div>
            )}
            
            {error && (
              <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-3 animate-in slide-in-from-top-2">
                <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                  <Info className="h-4 w-4" />
                </div>
                <span className="font-bold">{error}</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-6 md:p-10 bg-gradient-to-t from-white dark:from-slate-950 via-white/80 dark:via-slate-950/80 to-transparent">
            <div className="max-w-4xl mx-auto relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-emerald-500/20 rounded-[2.5rem] blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
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
                  placeholder={mode === 'chat' ? "Ask anything... (Shift + Enter for new line)" : "Describe your creation in detail..."}
                  className="w-full pl-6 pr-20 py-6 rounded-[2rem] border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-0 focus:border-primary transition-all outline-none resize-none min-h-[80px] max-h-[300px] text-base font-medium shadow-xl shadow-slate-200/50 dark:shadow-none"
                  rows={1}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim() || loading}
                  className="absolute right-3 top-3 bottom-3 w-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center disabled:opacity-30 hover:scale-105 active:scale-95 transition-all shadow-lg z-10"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">API Online</span>
              </div>
              <div className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
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
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Provider</div>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                  CloudGPT Unified
                  <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                </p>
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
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-[0.2em]">Live Metrics</h3>
            </div>
            
            <div className="grid gap-4">
              <MetricCard label="Tokens" value="0" sub="Approximate" />
              <MetricCard label="Latency" value="0ms" sub="Response time" />
              <MetricCard label="Context" value="128k" sub="Max window" />
            </div>
          </section>

          <div className="mt-auto p-6 rounded-[2rem] bg-slate-900 dark:bg-white text-white dark:text-slate-900 relative overflow-hidden group">
            <div className="absolute inset-0 dot-grid opacity-10 group-hover:opacity-20 transition-opacity" />
            <div className="relative z-10">
              <h4 className="text-sm font-black mb-2">Need more power?</h4>
              <p className="text-[11px] font-bold opacity-70 mb-4 leading-relaxed">
                Unlock specialized models and higher rate limits with Pro.
              </p>
              <button className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">
                Upgrade Now
              </button>
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

function ModeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300",
        active 
          ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg shadow-slate-200/50 dark:shadow-none scale-105" 
          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-800/50"
      )}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
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
