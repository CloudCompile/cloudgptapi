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
          <div className="max-w-2xl mx-auto">
            <div className="space-y-8 sm:space-y-10">
              <div className="text-center">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter mb-4 sm:mb-6">
                  About <span className="premium-text">Me</span>
                </h1>
                <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                  I'm the creator behind this platform.
                </p>
              </div>

              <div className="glass border border-border/50 rounded-3xl p-8 sm:p-12 space-y-6">
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  I built this to make AI accessible to everyone. No complicated setups, no expensive paywalls—just a simple, powerful API that works.
                </p>
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  My focus is on quality, reliability, and user experience. Every feature, every model, every endpoint exists because it solves a real problem.
                </p>
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  I'm passionate about democratizing technology and removing barriers to innovation. That's what drives everything I do here.
                </p>
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
