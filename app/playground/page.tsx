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

        if (!response.ok) throw new Error('Failed to get response');

        const data = await response.json();
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

        if (!response.ok) throw new Error('Failed to generate image');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } else if (mode === 'video') {
        const response = await fetch('/api/video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: selectedModel,
            prompt: input
          })
        });

        if (!response.ok) throw new Error('Failed to generate video');

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const currentModels = mode === 'chat' ? CHAT_MODELS : mode === 'image' ? IMAGE_MODELS : VIDEO_MODELS;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white dark:bg-slate-950 overflow-hidden">
      {/* Top Controls Bar */}
      <div className="h-14 border-b flex items-center justify-between px-4 glass shrink-0">
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white dark:bg-slate-950 shadow-sm">
            <Settings2 className="h-4 w-4 text-slate-500" />
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none border-none focus:ring-0"
            >
              {currentModels.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={() => handleModeChange(mode)}
            className="p-2 text-slate-500 hover:text-red-500 transition-colors"
            title="Clear Session"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Conversation/Result Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-50/30 dark:bg-slate-900/10">
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
          >
            {mode === 'chat' ? (
              messages.length === 0 ? (
                <EmptyState icon={<Sparkles className="h-10 w-10" />} title="Ready for Chat" description="Select a model and start a conversation." />
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={cn(
                    "flex gap-4 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300",
                    m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}>
                    <div className={cn(
                      "h-8 w-8 rounded-full shrink-0 flex items-center justify-center",
                      m.role === 'user' ? "bg-primary" : "bg-slate-200 dark:bg-slate-800"
                    )}>
                      {m.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm leading-relaxed",
                      m.role === 'user' 
                        ? "bg-primary text-white shadow-lg shadow-primary/10" 
                        : "bg-white dark:bg-slate-900 border shadow-sm text-slate-800 dark:text-slate-200"
                    )}>
                      {m.content}
                    </div>
                  </div>
                ))
              )
            ) : mode === 'image' ? (
              imageUrl ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative group rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 animate-in zoom-in-95 duration-500">
                    <img src={imageUrl} alt="Generated" className="max-w-full max-h-[70vh] object-contain" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <a href={imageUrl} download="generated-image.png" className="p-3 bg-white rounded-full text-black hover:scale-110 transition-transform">
                        <Download className="h-6 w-6" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState icon={<ImageIcon className="h-10 w-10" />} title="Image Generation" description="Enter a detailed prompt to create an image." />
              )
            ) : (
              videoUrl ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative group rounded-2xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 animate-in zoom-in-95 duration-500">
                    <video src={videoUrl} controls className="max-w-full max-h-[70vh]" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a href={videoUrl} download="generated-video.mp4" className="p-2 bg-white rounded-full text-black hover:scale-110 transition-transform flex items-center justify-center">
                        <Download className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState icon={<Video className="h-10 w-10" />} title="Video Generation" description="Transform your ideas into high-quality AI video." />
              )
            )}
            
            {loading && (
              <div className="flex gap-4 max-w-3xl mr-auto animate-pulse">
                <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0 flex items-center justify-center">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border text-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Generating response...
                </div>
              </div>
            )}
            
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                <Info className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 md:p-6 border-t bg-white dark:bg-slate-950">
            <div className="max-w-3xl mx-auto relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder={mode === 'chat' ? "Type a message..." : "Describe what you want to create..."}
                className="w-full pl-4 pr-14 py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none min-h-[60px] max-h-[200px]"
                rows={1}
              />
              <button
                onClick={handleSubmit}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-2 bottom-2 w-12 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:bg-slate-400 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-[10px] text-center mt-3 text-slate-400 uppercase tracking-widest font-bold">
              Powered by CloudGPT Unified API
            </p>
          </div>
        </div>

        {/* Right Panel: Sidebar Info (Hidden on Mobile) */}
        <div className="hidden lg:flex w-72 border-l flex-col bg-slate-50/50 dark:bg-slate-950/50 p-6 space-y-8">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Model Info</h3>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border shadow-sm">
              <p className="text-sm font-bold mb-1">
                {currentModels.find(m => m.id === selectedModel)?.name}
              </p>
              <p className="text-xs text-slate-500 line-clamp-3">
                Professional grade {mode} model optimized for high-quality outputs and low latency.
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Session Info</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5"><History className="h-3.5 w-3.5" /> Tokens</span>
                <span className="font-mono font-bold text-primary">0</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Latency</span>
                <span className="font-mono font-bold text-primary">0ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModeButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
        active 
          ? "bg-white dark:bg-slate-800 text-primary shadow-sm" 
          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 duration-700">
      <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6 border-2 border-primary/10">
        <div className="text-primary">{icon}</div>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-slate-500 max-w-xs">{description}</p>
    </div>
  );
}
