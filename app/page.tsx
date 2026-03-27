import { ArrowRight, Bot, Code, Cpu, Image as ImageIcon, MessageSquare, Video, Zap, Terminal, Sparkles, Globe, Shield, Cloud, Layers, Database, Activity, Lock, Cpu as CpuIcon, Play, Users, Mail, ExternalLink, Crown } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 sm:pt-48 pb-12 sm:pb-20 overflow-hidden dot-grid">
        <div className="absolute inset-0 mesh-gradient opacity-60" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700 shadow-sm border border-primary/20">
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              <span>Next Generation AI Infrastructure</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 sm:mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 leading-[0.85]">
              Intelligence <br /><span className="premium-text">Unbound</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200 font-medium">
              Vetra is a Pollinations-powered API gateway for global AI infrastructure. 
              Access fast chat, image, and video generation with enterprise-grade reliability.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl bg-primary text-white font-bold text-base sm:text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Get API Key
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/docs" 
                className="w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-xl bg-white dark:bg-slate-950 border border-border font-bold text-base sm:text-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                Read Documentation
              </Link>
            </div>
          </div>

          {/* Product "Screenshot" Component */}
          <div className="mt-16 sm:mt-32 relative max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-3xl sm:rounded-[2.5rem] blur opacity-10 animate-pulse-slow" />
            <div className="relative bg-slate-950 rounded-3xl sm:rounded-[2.5rem] border border-white/5 shadow-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9]">
              {/* Fake UI Header */}
              <div className="h-10 sm:h-14 bg-white/[0.02] border-b border-white/5 flex items-center px-4 sm:px-8 gap-3 sm:gap-4">
                <div className="flex gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white/10" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white/10" />
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-white/10" />
                </div>
                <div className="h-4 sm:h-6 w-px bg-white/10 mx-1 sm:mx-2" />
                <div className="px-2 sm:px-4 py-1 rounded-lg bg-white/5 text-[9px] sm:text-[11px] text-white/40 font-mono tracking-wider uppercase">Project: Production-v1</div>
              </div>
              
              {/* Fake UI Content */}
              <div className="p-3 sm:p-4 md:p-10 flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-10 h-full overflow-hidden">
                <div className="hidden md:flex w-72 flex-col gap-6">
                  <div className="space-y-3">
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mb-4">Endpoints</div>
                    <div className="h-11 bg-primary/10 border border-primary/20 rounded-xl flex items-center px-4 gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                      <div className="text-xs font-bold text-primary">Chat Completions</div>
                    </div>
                    <div className="h-11 bg-white/[0.02] border border-white/5 rounded-xl flex items-center px-4 gap-3 opacity-40">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <div className="text-xs font-bold text-white/60">Image Generation</div>
                    </div>
                    <div className="h-11 bg-white/[0.02] border border-white/5 rounded-xl flex items-center px-4 gap-3 opacity-40">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <div className="text-xs font-bold text-white/60">Audio Processing</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-4 sm:gap-6 min-w-0">
                  <div className="h-full bg-white/[0.01] rounded-2xl sm:rounded-3xl border border-white/5 p-4 md:p-8 flex flex-col gap-4 sm:gap-6 overflow-hidden">
                    <div className="flex gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center shrink-0">
                        <Terminal className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                      </div>
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="h-3 sm:h-4 w-24 sm:w-32 bg-white/10 rounded-full" />
                        <div className="h-auto md:h-20 bg-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 font-mono text-[9px] sm:text-[10px] md:text-xs text-white/40 leading-relaxed break-all md:break-normal">
                          $ curl https://vetraai.vercel.app/v1/chat/completions \<br />
                          &nbsp;&nbsp;-H "Authorization: Bearer $KEY" \<br />
                          &nbsp;&nbsp;-d '{"{"}"model": "gpt-5-mini"{"}"}'
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 sm:gap-4 justify-end">
                      <div className="space-y-2 flex-1 items-end flex flex-col min-w-0">
                        <div className="h-3 sm:h-4 w-16 sm:w-24 bg-white/5 rounded-full" />
                        <div className="h-auto w-full bg-primary/5 border border-primary/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 text-[9px] sm:text-[10px] md:text-xs text-white/70 leading-relaxed font-medium text-right">
                          "Deployment successful. Latency: 42ms. <br />
                          Model: GPT-5 Mini (v1.2)<br />
                          Tokens: 1,024 cached"
                        </div>
                      </div>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white/20" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats/Showcase Section */}
      <section className="py-8 sm:py-12 border-y border-border bg-white dark:bg-slate-950 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 items-center">
            <div className="flex flex-col items-center gap-1 group cursor-default">
              <span className="font-black text-xl sm:text-2xl tracking-tighter group-hover:text-primary transition-colors">GPT-5 Mini</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black text-center">OpenAI</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-default">
              <span className="font-black text-xl sm:text-2xl tracking-tighter group-hover:text-primary transition-colors">OpenAI GPT-5 Mini</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black text-center">Pollinations</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-default">
              <span className="font-black text-xl sm:text-2xl tracking-tighter group-hover:text-primary transition-colors">DeepSeek V3.2</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black text-center">Pollinations</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-default">
              <span className="font-black text-xl sm:text-2xl tracking-tighter group-hover:text-primary transition-colors">OpenAI GPT-5 Nano</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black text-center">Pollinations</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-default">
              <span className="font-black text-xl sm:text-2xl tracking-tighter group-hover:text-primary transition-colors">Flux</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black text-center">Pollinations</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-default">
              <span className="font-black text-xl sm:text-2xl tracking-tighter group-hover:text-primary transition-colors">DeepSeek V3.2</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black text-center">DeepSeek</span>
            </div>
          </div>
        </div>
      </section>

      {/* Pollinations Section */}
      <section className="py-8 sm:py-12 bg-slate-50 dark:bg-slate-900/50 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
            <div className="flex flex-col gap-2 text-center md:text-left items-center md:items-start">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary w-fit">
                <Crown className="h-3.5 w-3.5" />
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Premium Models</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tighter">Pollinations Integration</h3>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium max-w-lg">
                Access Pollinations chat, image, and video models through one unified OpenAI-compatible API.
              </p>
            </div>
            <div className="flex gap-8 sm:gap-12 items-center overflow-x-auto pb-4 md:pb-0 scrollbar-hide w-full md:w-auto justify-start sm:justify-center md:justify-end">
              <div className="flex flex-col items-center gap-1 group cursor-default shrink-0">
                <span className="font-black text-lg sm:text-xl tracking-tighter group-hover:text-primary transition-colors">Kimi K2 Thinking</span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">Reasoning</span>
              </div>
              <div className="flex flex-col items-center gap-1 group cursor-default shrink-0">
                <span className="font-black text-lg sm:text-xl tracking-tighter group-hover:text-primary transition-colors">Perplexity Sonar</span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">Reasoning</span>
              </div>
              <div className="flex flex-col items-center gap-1 group cursor-default shrink-0">
                <span className="font-black text-lg sm:text-xl tracking-tighter group-hover:text-primary transition-colors">Seedream Pro</span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">Image</span>
              </div>
              <div className="flex flex-col items-center gap-1 group cursor-default shrink-0">
                <span className="font-black text-lg sm:text-xl tracking-tighter group-hover:text-primary transition-colors">Veo</span>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-slate-400 font-black">Video</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 sm:py-32 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-12 sm:mb-24 text-center sm:text-left">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter mb-4 sm:mb-6 leading-none">Engineered for Developers.</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-xl leading-relaxed font-medium">
              We've packaged Pollinations models into a single, elegant interface. 
              Focus on your product, not your infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<MessageSquare className="h-6 w-6" />}
              title="Chat & Reasoning"
              description="Access the most advanced LLMs with unified parameters and streaming support."
              href="/docs#chat"
              color="blue"
            />
            <FeatureCard 
              icon={<ImageIcon className="h-6 w-6" />}
              title="Image Generation"
              description="State-of-the-art text-to-image models with high-resolution output."
              href="/docs#image"
              color="purple"
            />
            <FeatureCard 
              icon={<Video className="h-6 w-6" />}
              title="Video & Motion"
              description="Create cinematic AI videos and animations from simple descriptions."
              href="/docs#video"
              color="pink"
            />
            <FeatureCard 
              icon={<Terminal className="h-6 w-6" />}
              title="Unified API"
              description="One schema to rule them all. Switch models by changing a single string."
              href="/docs"
              color="emerald"
            />
            <FeatureCard 
              icon={<Activity className="h-6 w-6" />}
              title="Real-time Analytics"
              description="Monitor usage, latency, and costs across all models in a single dashboard."
              href="/dashboard"
              color="orange"
            />
            <FeatureCard 
              icon={<Lock className="h-6 w-6" />}
              title="Enterprise Security"
              description="Granular API key permissions and comprehensive audit logging."
              href="/pricing"
              color="cyan"
            />
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-16 sm:py-32 bg-slate-950 text-white overflow-hidden relative dot-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 sm:gap-20">
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-6 sm:mb-8 border border-blue-500/20">
                <Code className="h-3.5 w-3.5" />
                <span>Developer Experience</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-6 sm:mb-8 leading-[0.9]">
                One API.<br />Pollinations Models.
              </h2>
              <p className="text-slate-400 text-base sm:text-xl mb-8 sm:mb-10 leading-relaxed font-medium">
                Replace fragmented integrations with a single, elegant Pollinations-powered API. 
                Switch models on the fly without changing a single line of your core logic.
              </p>
              
              <div className="grid grid-cols-2 gap-6 sm:gap-8 max-w-sm mx-auto lg:mx-0">
                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tighter text-white">Text</div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Chat</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tighter text-white">&lt;100ms</div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Latency</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tighter text-white">99.9%</div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Uptime</div>
                </div>
                <div>
                  <div className="text-3xl sm:text-4xl font-black tracking-tighter text-white">Media</div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Image/Video</div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="rounded-2xl sm:rounded-3xl bg-black border border-slate-800 p-1 shadow-2xl shadow-blue-500/10">
                <div className="bg-slate-900/50 rounded-xl sm:rounded-[1.4rem] p-4 sm:p-8">
                  <div className="flex gap-1.5 mb-6 sm:mb-8">
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-red-500/20" />
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-500/20" />
                    <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-green-500/20" />
                  </div>
                  <pre className="text-[10px] sm:text-sm font-mono text-blue-400 leading-relaxed overflow-x-auto">
                    <code>{`// Switch models with one parameter
const response = await vetra.chat.create({
  model: 'openai',
  messages: [
    { role: 'user', content: 'Design a space station' }
  ],
  temperature: 0.7,
  max_tokens: 1024
});

console.log(response.content);`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-32 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-12 sm:mb-24 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] sm:text-xs font-black tracking-widest uppercase mb-4 sm:mb-6 border border-emerald-500/20">
              <Users className="h-3.5 w-3.5" />
              <span>The Minds Behind Vetra</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tighter mb-4 sm:mb-6 leading-none">Built by Developers, for Developers.</h2>
            <p className="text-slate-600 dark:text-slate-400 text-base sm:text-xl leading-relaxed font-medium">
              Built by developers focused on making Pollinations integration reliable, fast, and simple.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl">
            <div className="group p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-border hover:border-primary/50 transition-all duration-500">
              <div className="flex items-start justify-between mb-6 sm:mb-8">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <span className="text-xl sm:text-2xl font-black">CH</span>
                </div>
                <div className="flex gap-2">
                  <a href="#" className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-border hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-1 tracking-tighter">CJ Hauser</h3>
              <p className="text-primary font-bold text-xs sm:text-sm mb-3 sm:mb-4 uppercase tracking-widest">Lead Architect</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Pioneering the integration of multi-modal AI systems and cognitive memory architectures.
              </p>
            </div>

            <div className="group p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-border hover:border-primary/50 transition-all duration-500">
              <div className="flex items-start justify-between mb-6 sm:mb-8">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                  <span className="text-xl sm:text-2xl font-black">AM</span>
                </div>
                <div className="flex gap-2">
                  <a href="#" className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-border hover:text-primary transition-colors">
                    <Mail className="h-4 w-4" />
                  </a>
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-black mb-1 tracking-tighter">Aaron Miller</h3>
              <p className="text-primary font-bold text-xs sm:text-sm mb-3 sm:mb-4 uppercase tracking-widest">Systems Engineer</p>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Optimizing global infrastructure and low-latency API gateways for enterprise scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-40 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-6 sm:mb-8 leading-none">Ready to build?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8 sm:mb-12 max-w-xl mx-auto text-lg sm:text-xl leading-relaxed font-medium">
            Join thousands of developers building the next generation of AI applications on Vetra.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-primary text-white font-black text-lg sm:text-xl shadow-2xl shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              Get API Key
              <ArrowRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>
            <Link 
              href="/docs" 
              className="w-full sm:w-auto px-8 sm:px-12 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-950 border-2 border-border font-black text-lg sm:text-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
            >
              Read Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 sm:py-20 border-t border-border bg-slate-50/50 dark:bg-slate-950/50 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 sm:gap-12 mb-12 sm:mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                  <Cloud className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl sm:text-2xl font-black tracking-tighter">Vetra</span>
              </div>
              <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mb-6">
                The next generation of AI infrastructure. Built for developers shipping with Pollinations.
              </p>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <a href="https://vetraai.vercel.app/" target="_blank" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-primary hover:opacity-80 transition-all flex items-center gap-1.5">
                  Vetra <ExternalLink className="h-3 w-3" />
                </a>
                <span className="hidden sm:inline text-slate-300">|</span>
                <a href="https://pollinations.ai" target="_blank" className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all flex items-center gap-1.5">
                  Pollinations API <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-4 sm:mb-6">Platform</h4>
              <ul className="space-y-3 sm:space-y-4">
                <li><Link href="/models" className="text-xs sm:text-sm font-bold text-slate-500 hover:text-primary transition-colors">Models</Link></li>
                <li><Link href="/pricing" className="text-xs sm:text-sm font-bold text-slate-500 hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="text-xs sm:text-sm font-bold text-slate-500 hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="/playground" className="text-xs sm:text-sm font-bold text-slate-500 hover:text-primary transition-colors">Playground</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white mb-4 sm:mb-6">Legal</h4>
              <ul className="space-y-3 sm:space-y-4">
                <li><Link href="/terms-of-service" className="text-xs sm:text-sm font-bold text-slate-500 hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy-policy" className="text-xs sm:text-sm font-bold text-slate-500 hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/security" className="text-xs sm:text-sm font-bold text-slate-500 hover:text-primary transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 sm:pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="text-[10px] sm:text-sm text-slate-400 font-bold text-center md:text-left">
              © {new Date().getFullYear()} Vetra. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300">Crafted by CJ Hauser & Aaron Miller</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, href, color }: { icon: React.ReactNode, title: string, description: string, href: string, color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    pink: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
  };

  return (
    <Link href={href} className="group p-8 rounded-[2.5rem] bg-white dark:bg-slate-950 border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 relative overflow-hidden">
      <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border", colorMap[color])}>
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 tracking-tighter">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8 font-medium">{description}</p>
      <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover:translate-x-0">
        Learn More
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
}
