import { ArrowRight, Code, Users, Sparkles, Heart } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8">
            <Link href="/models" className="text-sm font-bold hover:text-primary transition-colors">Models</Link>
            <Link href="/pricing" className="text-sm font-bold hover:text-primary transition-colors">Pricing</Link>
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

      <main className="flex-1 pt-24 sm:pt-32 pb-16 sm:pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Story Section */}
            <div className="space-y-10 sm:space-y-12">
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter mb-4 sm:mb-6">
                  Our <span className="premium-text">Story</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
                  Vetra was born from a vision to democratize access to the world's most powerful artificial intelligence models through a single, unified interface.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-8 sm:py-12 border-y border-border/50">
                <div className="space-y-4 sm:space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold tracking-wider uppercase">
                    <Users className="h-3.5 w-3.5" />
                    <span>The Founders</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight">CJ Hauser & Aaron Miller</h2>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    Before founding Vetra, CJ and Aaron spent over a year as core contributors at Pollinations.ai. During their time there, they deep-dived into the complexities of generative AI and global infrastructure.
                  </p>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                    Inspired by the potential of decentralized AI and community-driven development, they decided to build something new. Something that would simplify the developer experience while putting the community at the heart of the system.
                  </p>
                </div>
                <div className="relative mt-8 md:mt-0">
                  <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full" />
                  <div className="relative glass border border-border/50 p-6 sm:p-8 rounded-3xl space-y-5 sm:space-y-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-bold">Community Driven</div>
                        <div className="text-[10px] sm:text-sm text-slate-500">Built by developers, for developers.</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0">
                        <Code className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-bold">Open Standard</div>
                        <div className="text-[10px] sm:text-sm text-slate-500">OpenAI compatible API endpoints.</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-accent/20 flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-bold">Transparent Tech</div>
                        <div className="text-[10px] sm:text-sm text-slate-500">Real-time status and usage logs.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center pt-8 sm:pt-12">
                <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6">Ready to join the revolution?</h3>
                <Link 
                  href="https://vetraai.vercel.app/" 
                  className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-primary text-white font-bold text-base sm:text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] transition-all"
                >
                  Get Started Now
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border/50 bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <Logo className="mx-auto mb-6 grayscale opacity-50" />
          <p className="text-sm text-slate-500 font-medium">
            © 2026 Vetra. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
