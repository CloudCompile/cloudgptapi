import type { Metadata } from 'next';
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { BookOpen, Cloud, FileText, LayoutDashboard, Rocket, Shield, Zap } from 'lucide-react';
import './globals.css';
import { SyncUser } from '@/components/sync-user';
import { UserStatus } from '@/components/user-status';

export const metadata: Metadata = {
  title: 'CloudGPT - Unified AI API',
  description: 'A unified API gateway for AI chat, image, and video generation',
  icons: {
    icon: '/favicon.ico',
  },
};

function LaunchBanner() {
  return (
    <div className="relative isolate flex items-center gap-x-6 overflow-hidden bg-slate-900 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <div className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl" aria-hidden="true">
        <div className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-primary to-emerald-500 opacity-30" style={{ clipPath: 'polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 52.8% 47.1%, 74.8% 41.9%)' }}></div>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <p className="text-sm leading-6 text-white">
          <strong className="font-semibold text-emerald-400">Meridian Labs x CloudGPT</strong>
          <svg viewBox="0 0 2 2" className="mx-2 inline h-0.5 w-0.5 fill-current" aria-hidden="true"><circle cx="1" cy="1" r="1" /></svg>
          The future of Cognitive Memory is here. Experience the integration upon launch.
        </p>
        <a href="https://meridianlabsapp.website/" target="_blank" className="flex-none rounded-full bg-slate-800 px-3.5 py-1 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-all border border-slate-700">
          Learn more <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
      <div className="flex flex-1 justify-end"></div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
            <Cloud className="h-6 w-6 text-white" />
          </div>
          <a href="/" className="text-xl font-bold tracking-tight hover:opacity-90">
            CloudGPT
          </a>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
          <a 
            href="https://meridianlabsapp.website/" 
            target="_blank" 
            className="group relative flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
            title="Meridian Labs"
          >
            <svg 
              viewBox="0 0 100 100" 
              className="h-6 w-6 fill-emerald-500 group-hover:scale-110 transition-transform duration-300"
              style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.4))' }}
            >
              <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" className="opacity-30" />
              <circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" strokeWidth="1" className="opacity-20" />
              <path d="M50 20 L80 50 L50 80 L20 50 Z" className="animate-pulse" />
              <path d="M50 35 L65 50 L50 65 L35 50 Z" fill="currentColor" opacity="0.8" />
              <circle cx="50" cy="50" r="5" fill="white" />
            </svg>
            <span className="absolute -bottom-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </a>
        </div>
        
        <nav className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6">
            <a href="/dashboard" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </a>
            <a href="/playground" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">
              <Zap className="h-4 w-4" />
              Playground
            </a>
            <a href="/models" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">
              <Rocket className="h-4 w-4" />
              Models
            </a>
            <a href="/pricing" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">
              <Zap className="h-4 w-4 text-amber-500" />
              Pricing
            </a>
            <a href="/docs" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">
              <BookOpen className="h-4 w-4" />
              Docs
            </a>
            <a href="/terms-of-service" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">
              <FileText className="h-4 w-4" />
              Terms
            </a>
            <a href="/privacy-policy" className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors dark:text-slate-300">
              <Shield className="h-4 w-4" />
              Privacy
            </a>
          </div>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />
          
          <div className="flex items-center gap-4">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserStatus />
              <UserButton 
                afterSignOutUrl="/" 
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9 border-2 border-primary/20"
                  }
                }}
              />
            </SignedIn>
          </div>
        </nav>
      </div>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    return (
      <html lang="en" className="scroll-smooth">
        <body className="min-h-screen bg-background antialiased selection:bg-primary/10 selection:text-primary">
          <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Configuration Required</h1>
            <p className="max-w-md text-slate-500 mb-6">
              Please add <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to your <code>.env.local</code> file to continue.
            </p>
            <a 
              href="https://dashboard.clerk.com/last-active?path=api-keys" 
              target="_blank" 
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20"
            >
              Get your keys from Clerk
            </a>
          </div>
        </body>
      </html>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <html lang="en" className="scroll-smooth">
        <body className="min-h-screen bg-background antialiased selection:bg-primary/10 selection:text-primary">
          <SyncUser />
          <LaunchBanner />
          <Header />
          <main>{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
