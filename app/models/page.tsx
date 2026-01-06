'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  CHAT_MODELS, 
  IMAGE_MODELS, 
  VIDEO_MODELS,
  ChatModel,
  ImageModel,
  VideoModel 
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
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModelStatus {
  id: string;
  status: 'online' | 'offline' | 'checking';
  latency?: number;
}

type ModelType = (ChatModel | ImageModel | VideoModel) & { type: 'chat' | 'image' | 'video' };

const ALL_MODELS: ModelType[] = [
  ...CHAT_MODELS.map(m => ({ ...m, type: 'chat' as const })),
  ...IMAGE_MODELS.map(m => ({ ...m, type: 'image' as const })),
  ...VIDEO_MODELS.map(m => ({ ...m, type: 'video' as const })),
];

export default function ModelsPage() {
  const [statuses, setStatuses] = useState<Record<string, ModelStatus>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'chat' | 'image' | 'video'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Initialize statuses
    const initialStatuses: Record<string, ModelStatus> = {};
    ALL_MODELS.forEach(m => {
      initialStatuses[m.id] = { id: m.id, status: 'checking' };
    });
    setStatuses(initialStatuses);

    // Simulate status check
    const timer = setTimeout(() => {
      const updatedStatuses: Record<string, ModelStatus> = {};
      ALL_MODELS.forEach(m => {
        updatedStatuses[m.id] = { 
          id: m.id, 
          status: Math.random() > 0.05 ? 'online' : 'offline',
          latency: Math.floor(Math.random() * 800 + 100)
        };
      });
      setStatuses(updatedStatuses);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const filteredModels = useMemo(() => {
    return ALL_MODELS.filter(model => {
      const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           model.provider.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === 'all' || model.type === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [searchQuery, activeTab]);

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

  const handleModelClick = (model: ModelType) => {
    setSelectedModel(model);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedModel(null), 300); // Clear after animation
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="flex items-center gap-2 text-primary font-semibold mb-2">
              <Activity className="h-5 w-5" />
              <span className="tracking-wider uppercase text-sm">System Status</span>
            </div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Model Monitor
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl">
              Real-time performance metrics and availability status for our multi-modal AI infrastructure.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <StatCard 
              label="Active Models" 
              value={`${stats.online}/${stats.total}`} 
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            />
            <StatCard 
              label="Avg. Latency" 
              value={`${stats.avgLatency}ms`} 
              icon={<Zap className="h-4 w-4 text-amber-500" />}
            />
          </div>
        </div>

        {/* Filters & Search */}
        <div className="sticky top-20 z-30 mb-8 p-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500 delay-100">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by model name, ID or provider..."
              className="w-full pl-10 pr-4 py-2 bg-slate-100/50 dark:bg-slate-800/50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full md:w-auto">
            <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} icon={<Globe className="h-3.5 w-3.5" />} label="All" />
            <TabButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<MessageSquare className="h-3.5 w-3.5" />} label="Chat" />
            <TabButton active={activeTab === 'image'} onClick={() => setActiveTab('image')} icon={<ImageIcon className="h-3.5 w-3.5" />} label="Image" />
            <TabButton active={activeTab === 'video'} onClick={() => setActiveTab('video')} icon={<Video className="h-3.5 w-3.5" />} label="Video" />
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          {filteredModels.map((model) => (
            <ModelCard 
              key={model.id} 
              model={model} 
              status={statuses[model.id] || { id: model.id, status: 'checking' }} 
              onClick={() => handleModelClick(model)}
            />
          ))}
          
          {filteredModels.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <Filter className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">No models found</h3>
              <p className="text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
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

function StatCard({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 min-w-[160px]">
      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
        <p className="text-xl font-bold text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-1 md:flex-none justify-center",
        active 
          ? "bg-white dark:bg-slate-700 text-primary shadow-sm" 
          : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function ModelCard({ model, status, onClick }: { model: ModelType, status: ModelStatus, onClick: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 transition-all hover:shadow-lg hover:-translate-y-1 overflow-hidden cursor-pointer">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={cn(
          "p-2 rounded-xl",
          model.type === 'chat' ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600" :
          model.type === 'image' ? "bg-purple-50 dark:bg-purple-900/20 text-purple-600" :
          "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
        )}>
          {model.type === 'chat' ? <MessageSquare className="h-5 w-5" /> :
           model.type === 'image' ? <ImageIcon className="h-5 w-5" /> :
           <Video className="h-5 w-5" />}
        </div>
        
        <div className="flex items-center gap-2">
          {status.status === 'online' ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">Online</span>
            </div>
          ) : status.status === 'offline' ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              <span className="text-[10px] font-bold text-rose-600 uppercase tracking-tight">Offline</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Checking</span>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 relative z-10">
        <h3 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors flex items-center gap-2">
          {model.name}
          <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-y-1" />
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 h-8 mt-1 leading-relaxed">
          {model.description || `High-performance ${model.type} model powered by ${model.provider}.`}
        </p>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold tracking-wider">Provider</span>
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">{model.provider}</span>
          </div>
        </div>
        
        {status.latency && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase text-slate-400 dark:text-slate-500 font-bold tracking-wider">Latency</span>
            <div className="flex items-center gap-1 text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
              <Clock className="h-3 w-3 text-slate-400" />
              {status.latency}ms
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ModelDetailsModal({ model, status, onClose }: { model: ModelType, status: ModelStatus, onClose: () => void }) {
  const details = getModelDetails(model.id, model.type);
  
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-b border-slate-200 dark:border-slate-800 p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-2xl",
              model.type === 'chat' ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600" :
              model.type === 'image' ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600" :
              "bg-amber-100 dark:bg-amber-900/30 text-amber-600"
            )}>
              {model.type === 'chat' ? <MessageSquare className="h-8 w-8" /> :
               model.type === 'image' ? <ImageIcon className="h-8 w-8" /> :
               <Video className="h-8 w-8" />}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                  {model.name}
                </h2>
                {status.status === 'online' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900/50">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-tight">Online</span>
                  </div>
                ) : status.status === 'offline' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 dark:bg-rose-900/30 border border-rose-200 dark:border-rose-900/50">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-tight">Offline</span>
                  </div>
                ) : null}
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                {details?.longDescription || model.description || `High-performance ${model.type} model powered by ${model.provider}.`}
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {model.provider}
                </span>
                {details?.family && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {details.family}
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">
                  {model.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {details ? (
            <div className="space-y-6">
              {/* Strengths */}
              {details.strengths && details.strengths.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Strengths</h3>
                  </div>
                  <ul className="space-y-2">
                    {details.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Weaknesses */}
              {details.weaknesses && details.weaknesses.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingDown className="h-5 w-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Limitations</h3>
                  </div>
                  <ul className="space-y-2">
                    {details.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Use Cases */}
              {details.useCases && details.useCases.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Target className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Best For</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {details.useCases.map((useCase, idx) => (
                      <span 
                        key={idx}
                        className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-sm font-medium text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/30"
                      >
                        {useCase}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Technical Specifications */}
              {details.technicalSpecs && (
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Technical Specifications</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {details.technicalSpecs.contextWindow && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Context Window</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{details.technicalSpecs.contextWindow}</p>
                      </div>
                    )}
                    {details.technicalSpecs.architecture && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Architecture</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{details.technicalSpecs.architecture}</p>
                      </div>
                    )}
                    {details.technicalSpecs.releaseDate && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Release Date</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{details.technicalSpecs.releaseDate}</p>
                      </div>
                    )}
                    {status.latency && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-1">Current Latency</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-400" />
                          {status.latency}ms
                        </p>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <Info className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Limited Information Available</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Detailed information for this model is not yet available.
              </p>
              <div className="inline-block p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Model ID:</strong> {model.id}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Provider:</strong> {model.provider}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>Type:</strong> {model.type}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
