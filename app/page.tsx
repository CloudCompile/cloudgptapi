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
              icon={<MessageSquare className="h-6 w-6 text-blue-500" />}
              title="Chat API"
              description="Access GPT-4, Claude, and Llama through a unified interface."
              href="/api/chat"
            />
            <FeatureCard 
              icon={<ImageIcon className="h-6 w-6 text-purple-500" />}
              title="Image API"
              description="Generate stunning visuals with Flux, Stable Diffusion, and more."
              href="/api/image"
            />
            <FeatureCard 
              icon={<Video className="h-6 w-6 text-pink-500" />}
              title="Video API"
              description="Create high-quality AI videos from simple text prompts."
              href="/api/video"
            />
            <FeatureCard 
              icon={<Bot className="h-6 w-6 text-emerald-500" />}
              title="Memory API"
              description="Give your AI a long-term memory with our Substrate integration."
              href="/api/mem"
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
                  <code>{`const response = await fetch('https://cloudgpt.com/api/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4o',
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
