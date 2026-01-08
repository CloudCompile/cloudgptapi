'use client';

import React from 'react';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/nextjs';
import { Cloud, LayoutDashboard, Zap, Rocket, BookOpen, FileText, Shield, Menu, X } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { UserStatus } from './user-status';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

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
          The future of Cognitive Memory is here.
        </p>
        <a href="https://meridianlabsapp.website/" target="_blank" className="flex-none rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-white shadow-sm hover:bg-slate-700 transition-all border border-slate-700">
          Learn more <span aria-hidden="true">&rarr;</span>
        </a>
      </div>
      <div className="flex flex-1 justify-end"></div>
    </div>
  );
}

function Header({ isAppPage }: { isAppPage: boolean }) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-200",
      isAppPage ? "lg:hidden glass" : "glass"
    )}>
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          {isAppPage && (
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          )}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <Cloud className="h-5 w-5 text-white" />
            </div>
            <Link href="/" className="text-lg font-bold tracking-tight">
              CloudGPT
            </Link>
          </div>
        </div>
        
        {!isAppPage && (
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/models" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Models</Link>
            <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Pricing</Link>
            <Link href="/docs" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Docs</Link>
          </nav>
        )}

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
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isAppPage && (
        <div className="lg:hidden border-t border-border bg-background p-4 space-y-2 animate-in slide-in-from-top duration-200">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100">
            <LayoutDashboard className="h-5 w-5" /> Dashboard
          </Link>
          <Link href="/playground" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100">
            <Zap className="h-5 w-5" /> Playground
          </Link>
          <Link href="/models" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100">
            <Rocket className="h-5 w-5" /> Models
          </Link>
          <Link href="/docs" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg hover:bg-slate-100">
            <BookOpen className="h-5 w-5" /> Docs
          </Link>
        </div>
      )}
    </header>
  );
}

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  
  const isAppPage = pathname !== '/' && !!user;
  const isLandingPage = pathname === '/';

  return (
    <div className="min-h-screen bg-background dot-grid">
      {isLandingPage && <LaunchBanner />}
      <Header isAppPage={isAppPage} />
      
      <div className="flex">
        {isAppPage && <Sidebar />}
        <main className={cn(
          "flex-1 transition-all duration-300 relative",
          isAppPage ? "lg:pl-72" : ""
        )}>
          <div className="min-h-screen relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
