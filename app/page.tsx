import { ArrowRight, Bot, Code, Cpu, Image as ImageIcon, MessageSquare, Video, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100-4rem)]">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden hero-gradient">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 animate-in fade-in slide-in-from-bottom-3 duration-700">
              <Zap className="h-4 w-4 fill-current" />
              <span>The fastest AI API Gateway</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
              Unified API for <span className="text-primary">Every AI Model</span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
              Access chat, image, video, and memory-enhanced models through a single, lightning-fast endpoint. Build AI apps in minutes, not months.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
              <a 
                href="/dashboard" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5" />
              </a>
              <a 
                href="/playground" 
                className="w-full sm:w-auto px-8 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-800 font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
              >
                Live Playground
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Powerful Endpoints</h2>
            <p className="text-slate-600 dark:text-slate-400">Everything you need to build production-ready AI applications.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.8728 20C9.10898 20.6391 10.5124 21 12 21Z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 9H16" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                  <path d="M8 12H16" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M8 15H13" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" className="animate-spin-slow" />
                </svg>
              }
              title="Chat API"
              description="Access GPT-4, Claude, and Llama through a unified interface."
              href="/docs#chat"
            />
            <FeatureCard 
              icon={
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-purple-500" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                  <path d="M21 15L16 10L5 21" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M11 10L14 7L21 14" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
                  <path d="M12 3V21M3 12H21" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="0.2" strokeDasharray="1 3" />
                </svg>
              }
              title="Image API"
              description="Generate stunning visuals with Flux, Stable Diffusion, and more."
              href="/docs#image"
            />
            <FeatureCard 
              icon={
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-pink-500" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 7L16 12L23 17V7Z" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="1" y="5" width="15" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="8.5" cy="12" r="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M5 8.5C5 8.5 6.5 7 8.5 7C10.5 7 12 8.5 12 8.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                  <path d="M1 12H16" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                  <path d="M8.5 5V19" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
                </svg>
              }
              title="Video API"
              description="Create high-quality AI videos from simple text prompts."
              href="/docs#video"
            />
            <FeatureCard 
              icon={
                <svg viewBox="0 0 100 100" className="h-8 w-8 text-emerald-500 fill-current">
                  <path d="M50 10 L85 30 L85 70 L50 90 L15 70 L15 30 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                  <path d="M50 25 L72 40 L72 60 L50 75 L28 60 L28 40 Z" opacity="0.6" />
                  <circle cx="50" cy="50" r="8" className="animate-pulse" />
                  <path d="M50 10 V90 M15 30 L85 70 M15 70 L85 30" stroke="currentColor" strokeWidth="1" opacity="0.2" />
                </svg>
              }
              title="Memory API"
              description="Advanced Memory Integrated Free AI Chat with long-term cognitive recall."
              href="/docs#memory"
            />
          </div>
        </div>
      </section>

      {/* Code Snippet Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl font-bold mb-6 italic">Built by developers,<br />for developers.</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Code className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Single SDK</h3>
                    <p className="text-slate-600 dark:text-slate-400">One package, infinite possibilities. No more juggling dozens of different API keys.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Cpu className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Edge Runtime</h3>
                    <p className="text-slate-600 dark:text-slate-400">Deployed globally for sub-millisecond latency. Your users will love the speed.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
              <div className="rounded-2xl bg-slate-950 p-6 shadow-2xl border border-slate-800">
                <div className="flex gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <pre className="text-sm font-mono text-slate-300 overflow-x-auto">
                  <code>{`const response = await fetch('https://cloudgptapi.vercel.app/api/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
    'x-user-id': 'unique-user-123' // Optional: for user differentiation
  },
  body: JSON.stringify({
    model: 'openai',
    messages: [{ role: 'user', content: 'Hello AI!' }]
  })
});

const data = await response.json();
console.log(data.choices[0].message);`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} CloudGPT API. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description, href }: { icon: React.ReactNode, title: string, description: string, href: string }) {
  return (
    <div className="p-8 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all hover:shadow-xl group">
      <div className="h-12 w-12 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 mb-6 line-clamp-2">{description}</p>
      <a href={href} className="text-primary font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
        Learn more
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}
