import { ArrowRight, Bot, Code, Cpu, Image as ImageIcon, MessageSquare, Video, Zap, Terminal, Sparkles, Globe, Shield, Cloud, Layers, Database, Activity, Lock, Cpu as CpuIcon, Play } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <Link href="/models" className="text-sm font-bold hover:text-primary transition-colors">Models</Link>
            <Link href="/pricing" className="text-sm font-bold hover:text-primary transition-colors">Pricing</Link>
            <Link href="/about" className="text-sm font-bold hover:text-primary transition-colors">About</Link>
            <Link href="/docs" className="text-sm font-bold hover:text-primary transition-colors">Docs</Link>
            <Link 
              href="/dashboard" 
              className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-20 overflow-hidden dot-grid">
        <div className="absolute inset-0 mesh-gradient opacity-60" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700 shadow-sm border border-primary/20">
              <Sparkles className="h-3.5 w-3.5 fill-current" />
              <span>Next Generation AI Infrastructure</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 leading-[0.85]">
              Unified <span className="premium-text">Intelligence</span> <br />at Scale
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200 font-medium">
              The professional API gateway for global AI infrastructure. 
              Switch between 100+ models with zero latency and enterprise-grade reliability.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <Link 
                href="/dashboard" 
                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Get API Key
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link 
                href="/docs" 
                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-white dark:bg-slate-950 border border-border font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                Read Documentation
              </Link>
            </div>
          </div>

          {/* Product "Screenshot" Component */}
          <div className="mt-32 relative max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-[2.5rem] blur opacity-10 animate-pulse-slow" />
            <div className="relative bg-slate-950 rounded-[2.5rem] border border-white/5 shadow-3xl overflow-hidden aspect-[16/9] md:aspect-[21/9]">
              {/* Fake UI Header */}
              <div className="h-14 bg-white/[0.02] border-b border-white/5 flex items-center px-8 gap-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <div className="h-6 w-px bg-white/10 mx-2" />
                <div className="px-4 py-1.5 rounded-lg bg-white/5 text-[11px] text-white/40 font-mono tracking-wider uppercase">Project: Production-v1</div>
              </div>
              
              {/* Fake UI Content */}
              <div className="p-10 flex gap-10 h-full">
                <div className="w-72 flex flex-col gap-6">
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
                <div className="flex-1 flex flex-col gap-6">
                  <div className="h-full bg-white/[0.01] rounded-3xl border border-white/5 p-8 flex flex-col gap-6">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center shrink-0">
                        <Terminal className="w-5 h-5 text-primary" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-32 bg-white/10 rounded-full" />
                        <div className="h-20 bg-white/5 rounded-2xl p-4 font-mono text-xs text-white/40 leading-relaxed">
                          $ curl https://api.cloudgpt.com/v1/chat \<br />
                          &nbsp;&nbsp;-H "Authorization: Bearer $KEY" \<br />
                          &nbsp;&nbsp;-d '{"{"}"model": "gpt-5-mini"{"}"}'
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4 justify-end">
                      <div className="space-y-2 flex-1 items-end flex flex-col">
                        <div className="h-4 w-24 bg-white/5 rounded-full" />
                        <div className="h-24 w-full bg-primary/5 border border-primary/10 rounded-2xl p-5 text-xs text-white/70 leading-relaxed font-medium">
                          "Deployment successful. Latency: 42ms. <br />
                          Model: GPT-5 Mini (v1.2)<br />
                          Tokens: 1,024 cached"
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-white/20" />
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
      <section className="py-12 border-y border-border bg-white dark:bg-slate-950 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            <div className="flex flex-col items-center gap-1 group cursor-default">
              <span className="font-black text-2xl tracking-tighter group-hover:text-primary transition-colors">GPT-5 Mini</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">OpenAI</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-default">
              <span className="font-black text-2xl tracking-tighter group-hover:text-primary transition-colors">Claude Sonnet 4.5</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Anthropic</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-default">
              <span className="font-black text-2xl tracking-tighter group-hover:text-primary transition-colors">Gemini 3 Flash</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Google</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-default">
              <span className="font-black text-2xl tracking-tighter group-hover:text-primary transition-colors">Llama 3.3 70B</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Meta</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-default">
              <span className="font-black text-2xl tracking-tighter group-hover:text-primary transition-colors">Flux.1 Pro</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">Black Forest</span>
            </div>
            <div className="flex flex-col items-center gap-1 group cursor-default">
              <span className="font-black text-2xl tracking-tighter group-hover:text-primary transition-colors">DeepSeek V3.2</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black">DeepSeek</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mb-24">
            <h2 className="text-5xl font-black tracking-tighter mb-6 leading-none">Engineered for Developers.</h2>
            <p className="text-slate-600 dark:text-slate-400 text-xl leading-relaxed font-medium">
              We've abstracted the complexity of multiple AI providers into a single, elegant interface. 
              Focus on your product, not your infrastructure.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
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
      <section className="py-32 bg-slate-950 text-white overflow-hidden relative dot-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/90 to-slate-950" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-black tracking-widest uppercase mb-8 border border-blue-500/20">
                <Code className="h-3.5 w-3.5" />
                <span>Developer Experience</span>
              </div>
              <h2 className="text-6xl font-black tracking-tighter mb-8 leading-[0.9]">
                One API.<br />Infinite Models.
              </h2>
              <p className="text-slate-400 text-xl mb-10 leading-relaxed font-medium">
                Replace dozens of API keys and libraries with a single, elegant integration. 
                Switch models on the fly without changing a single line of your core logic.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl font-black tracking-tighter text-white">100+</div>
                  <div className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">Models</div>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tighter text-white">&lt;100ms</div>
                  <div className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">Latency</div>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tighter text-white">99.9%</div>
                  <div className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">Uptime</div>
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tighter text-white">SDK</div>
                  <div className="text-xs text-slate-500 font-black uppercase tracking-widest mt-1">Type-safe</div>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="rounded-3xl bg-black border border-slate-800 p-1 shadow-2xl shadow-blue-500/10">
                <div className="bg-slate-900/50 rounded-[1.4rem] p-8">
                  <div className="flex gap-1.5 mb-8">
                    <div className="h-3 w-3 rounded-full bg-red-500/20" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/20" />
                    <div className="h-3 w-3 rounded-full bg-green-500/20" />
                  </div>
                  <pre className="text-sm font-mono text-blue-400 leading-relaxed overflow-x-auto">
                    <code>{`// Switch models with one parameter
const response = await cloudgpt.chat.create({
  model: 'claude-3-5-sonnet',
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

      {/* CTA Section */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-8 leading-none">Ready to build?</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-12 max-w-xl mx-auto text-xl leading-relaxed font-medium">
            Join thousands of developers building the next generation of AI applications on CloudGPT.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              href="/dashboard" 
              className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-primary text-white font-black text-xl shadow-2xl shadow-primary/20 hover:bg-primary/90 hover:scale-105 transition-all flex items-center justify-center gap-3"
            >
              Get API Key
              <ArrowRight className="h-6 w-6" />
            </Link>
            <Link 
              href="/docs" 
              className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-white dark:bg-slate-950 border-2 border-border font-black text-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-3"
            >
              Read Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-border bg-slate-50/50 dark:bg-slate-950/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                <Cloud className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter">CloudGPT</span>
            </div>
            <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Link href="/models" className="hover:text-primary transition-colors">Models</Link>
              <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
              <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
              <Link href="/terms-of-service" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">Privacy</Link>
            </div>
            <div className="text-sm text-slate-400 font-bold">
              © {new Date().getFullYear()} CloudGPT Studio.
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
