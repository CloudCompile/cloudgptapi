import { ArrowRight, CodeXml, Shield, Zap, Box, Globe, Cpu, Command, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { SignInButton } from '@clerk/nextjs';

export default function Home() {
  return (
    <main className="min-h-screen bg-black dark-theme selection:bg-zinc-800 selection:text-white">
      {/* Navigation */}
      <nav className="border-b border-zinc-800 bg-black/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.5 19C18.8807 19 20 17.8807 20 16.5C20 15.1193 18.8807 14 17.5 14C17.3881 14 17.2785 14.0073 17.1713 14.0215C16.8532 12.284 15.3344 11 13.5 11C12.4414 11 11.4933 11.4232 10.8041 12.1064C10.0881 11.4173 9.11718 11 8.05 11C6.08939 11 4.5 12.5894 4.5 14.55C4.5 14.6547 4.50456 14.7583 4.51341 14.8605C3.62647 15.421 3 16.3906 3 17.5C3 19.1569 4.34315 20.5 6 20.5H17.5C18.8807 20.5 20 19.3807 20 18C20 16.6193 18.8807 15.5 17.5 15.5V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 3V7M12 3L15 6M12 3L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-black text-white tracking-tight font-serif italic">CloudGPT</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a className="text-sm font-bold text-zinc-400 hover:text-white transition-colors" href="#features">Features</a>
            <a className="text-sm font-bold text-zinc-400 hover:text-white transition-colors" href="#providers">Providers</a>
            <Link className="text-sm font-bold text-zinc-400 hover:text-white transition-colors" href="/pricing">Pricing</Link>
          </div>
          <div className="flex items-center gap-4">
            <SignInButton mode="modal">
              <button className="hidden md:inline-flex text-sm font-bold text-zinc-400 hover:text-white transition-colors mr-4">Sign In</button>
            </SignInButton>
            <SignInButton mode="modal">
              <button className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black hover:bg-zinc-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">Get Started</button>
            </SignInButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-24 pb-32">
        {/* Animated background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-zinc-900/20 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-zinc-800/20 rounded-full filter blur-3xl opacity-50 animate-pulse delay-700"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/50 border border-zinc-800 text-zinc-400 text-xs font-bold mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
            <span className="tracking-widest uppercase text-[10px] sm:text-xs">The Next Generation AI Infrastructure</span>
          </div>

          {/* Hero Title */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[1.05] text-metallic-gunmetal">
            The Ultimate <br className="hidden md:block"/> AI Frontier.
          </h1>

          {/* Hero Description */}
          <p className="mt-8 text-xl text-zinc-500 max-w-2xl mx-auto leading-relaxed font-medium">
            Access 50+ enterprise-grade models from every major provider through a single, pitch-black, metallic-shiny interface. Built for those who demand the best.
          </p>

          {/* Hero CTAs */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link className="w-full sm:w-auto rounded-2xl bg-white px-8 py-4 text-base font-bold text-black shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:bg-zinc-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-2" href="/dashboard">
              Start Building <ArrowRight className="h-5 w-5" />
            </Link>
            <Link className="w-full sm:w-auto rounded-2xl bg-zinc-900 border border-zinc-800 px-8 py-4 text-base font-bold text-white hover:bg-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center gap-2" href="/playground">
              Try Playground <Command className="h-5 w-5" />
            </Link>
          </div>

          {/* Provider Logos */}
          <div className="mt-24 flex items-center justify-center gap-6 md:gap-12 grayscale opacity-30 overflow-x-auto py-4 border-y border-zinc-900/50 scrollbar-hide">
            <span className="text-xs font-black tracking-[0.3em] uppercase text-zinc-500 whitespace-nowrap">OpenAI</span>
            <span className="text-xs font-black tracking-[0.3em] uppercase text-zinc-500 whitespace-nowrap">Anthropic</span>
            <span className="text-xs font-black tracking-[0.3em] uppercase text-zinc-500 whitespace-nowrap">Google</span>
            <span className="text-xs font-black tracking-[0.3em] uppercase text-zinc-500 whitespace-nowrap">Meta</span>
            <span className="text-xs font-black tracking-[0.3em] uppercase text-zinc-500 whitespace-nowrap">Mistral</span>
            <span className="text-xs font-black tracking-[0.3em] uppercase text-zinc-500 whitespace-nowrap">GitHub</span>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-32 bg-black relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,0.5),transparent)] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.4em] mb-4">Elite Capabilities</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Engineered for Excellence</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<CodeXml className="h-7 w-7" />}
              title="Unified AI Core"
              description="A single, powerful integration point for all your AI needs. Minimal latency, maximum impact."
            />
            <FeatureCard 
              icon={<Shield className="h-7 w-7" />}
              title="Fort Knox Security"
              description="Enterprise-grade authentication and key management. Your data, protected by the best."
            />
            <FeatureCard 
              icon={<Zap className="h-7 w-7" />}
              title="Instant Scaling"
              description="From prototype to production in seconds. Our infrastructure scales as fast as you do."
            />
            <FeatureCard 
              icon={<Box className="h-7 w-7" />}
              title="Advanced Analytics"
              description="Complete visibility into every token. Optimize your spend with granular usage tracking."
            />
            <FeatureCard 
              icon={<Globe className="h-7 w-7" />}
              title="Global Edge"
              description="Deployed on the edge for worldwide performance. Speed is not an option, it is a requirement."
            />
            <FeatureCard 
              icon={<Cpu className="h-7 w-7" />}
              title="Model Intelligence"
              description="Access the latest reasoning and vision models the moment they are released."
            />
          </div>
        </div>
      </div>

      {/* Providers Section */}
      <div id="providers" className="py-32 bg-black border-y border-zinc-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-sm font-black text-zinc-500 uppercase tracking-[0.4em] mb-4">Integrations</h2>
              <h3 className="text-4xl font-black text-white mb-6 tracking-tight">The Best of AI, Unified.</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Direct access to the most advanced models from around the globe. No middlemen, no compromise.
              </p>
            </div>
            <Link href="/dashboard" className="text-sm font-bold text-white hover:text-zinc-400 flex items-center gap-2 transition-colors">
              View All Models <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['OpenAI', 'Anthropic', 'Google Gemini', 'Meta Llama', 'Mistral AI', 'GitHub Models', 'Liz AI', 'Meridian', 'StableHorde', 'Poe', 'Stripe', 'Clerk'].map((provider) => (
              <div key={provider} className="flex items-center gap-3 px-6 py-6 rounded-2xl border border-zinc-900 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all group">
                <div className="h-2 w-2 rounded-full bg-zinc-700 group-hover:bg-white transition-colors"></div>
                <span className="font-bold text-zinc-400 group-hover:text-white transition-colors tracking-tight">{provider}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-32 bg-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-[3rem] bg-zinc-950 border border-zinc-900 p-12 md:p-24 overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">Enter the Frontier.</h2>
              <p className="text-zinc-500 text-lg mb-12 font-medium tracking-wide">
                Join the elite group of developers building the future of AI.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/dashboard" className="w-full sm:w-auto rounded-2xl bg-white px-10 py-5 text-base font-bold text-black hover:bg-zinc-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-2 shadow-2xl">
                  Get Started Now
                </Link>
                <Link href="/pricing" className="w-full sm:w-auto rounded-2xl bg-zinc-900 border border-zinc-800 px-10 py-5 text-base font-bold text-white hover:bg-zinc-800 transition-all">
                  View Pricing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-zinc-900 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div className="max-w-xs">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.5 19C18.8807 19 20 17.8807 20 16.5C20 15.1193 18.8807 14 17.5 14C17.3881 14 17.2785 14.0073 17.1713 14.0215C16.8532 12.284 15.3344 11 13.5 11C12.4414 11 11.4933 11.4232 10.8041 12.1064C10.0881 11.4173 9.11718 11 8.05 11C6.08939 11 4.5 12.5894 4.5 14.55C4.5 14.6547 4.50456 14.7583 4.51341 14.8605C3.62647 15.421 3 16.3906 3 17.5C3 19.1569 4.34315 20.5 6 20.5H17.5C18.8807 20.5 20 19.3807 20 18C20 16.6193 18.8807 15.5 17.5 15.5V19Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M12 3V7M12 3L15 6M12 3L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-xl font-black text-white tracking-tight font-serif italic">CloudGPT</span>
              </div>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                The professional gateway for modern AI development. One API, every model, pitch black.
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              <div>
                <h4 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">Product</h4>
                <ul className="space-y-4">
                  <li><Link href="/playground" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Playground</Link></li>
                  <li><Link href="/pricing" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Pricing</Link></li>
                  <li><Link href="/docs" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Documentation</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">Company</h4>
                <ul className="space-y-4">
                  <li><Link href="/about" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">About</Link></li>
                  <li><a href="https://meridianlabsapp.website/" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Blog</a></li>
                  <li><Link href="/privacy-policy" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Privacy</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">Legal</h4>
                <ul className="space-y-4">
                  <li><Link href="/terms-of-service" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Terms</Link></li>
                  <li><a href="#" className="text-sm font-bold text-zinc-500 hover:text-white transition-colors">Security</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs font-bold text-zinc-600 tracking-widest">© 2026 CLOUD-GPT. ALL RIGHTS RESERVED.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-zinc-600 hover:text-white transition-colors font-bold text-xs tracking-widest">TWITTER</a>
              <a href="#" className="text-zinc-600 hover:text-white transition-colors font-bold text-xs tracking-widest">GITHUB</a>
              <a href="#" className="text-zinc-600 hover:text-white transition-colors font-bold text-xs tracking-widest">DISCORD</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group p-8 rounded-[2rem] border border-zinc-900 bg-zinc-950/50 hover:bg-zinc-900/50 hover:border-zinc-700 transition-all duration-500">
      <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:text-white group-hover:border-zinc-600 transition-all shadow-2xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-zinc-500 leading-relaxed font-medium">{description}</p>
    </div>
  );
}
