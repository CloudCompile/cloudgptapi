'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Zap, 
  Rocket, 
  BookOpen, 
  FileText, 
  Shield, 
  Cloud,
  MessageSquare,
  Image as ImageIcon,
  Video as VideoIcon,
  Settings,
  ChevronRight,
  User,
  Activity,
  Code,
  Lock,
  ExternalLink,
  X
} from 'lucide-react';
import { cn, hasProAccess } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Logo } from './Logo';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Playground', href: '/playground', icon: Zap },
  { name: 'Models', href: '/models', icon: Rocket },
  { name: 'Documentation', href: '/docs', icon: BookOpen },
];

const secondaryNavigation = [
  { name: 'About', href: '/about', icon: User },
  { name: 'Pricing', href: '/pricing', icon: Activity },
  { name: 'Terms', href: '/terms-of-service', icon: FileText },
  { name: 'Privacy', href: '/privacy-policy', icon: Shield },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { user, isSignedIn } = useUser();
  const [plan, setPlan] = useState<string>('free');

  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/profile', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data?.profile?.plan) setPlan(String(data.profile.plan));
      })
      .catch(() => undefined);
  }, [isSignedIn]);

  const isPro = hasProAccess(plan);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-r border-border/50 transition-transform duration-300 ease-in-out lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full pt-6 sm:pt-8 pb-4 sm:pb-6 overflow-y-auto">
          <div className="px-6 sm:px-8 mb-6 sm:mb-10 flex items-center justify-between">
            <Logo />
            {onClose && (
              <button 
                onClick={onClose}
                className="lg:hidden p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <nav className="flex-1 px-3 sm:px-4 space-y-8 sm:space-y-10">
          <div>
            <h3 className="px-3 sm:px-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 sm:mb-4">
              Platform
            </h3>
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl transition-all duration-300',
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/50'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 transition-colors',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'
                      )}
                    />
                    {item.name}
                    {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 sm:h-4 sm:w-4 animate-in slide-in-from-left-2" />}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="px-3 sm:px-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 sm:mb-4">
              Resources
            </h3>
            <div className="space-y-1">
              {secondaryNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-bold rounded-xl sm:rounded-2xl transition-all duration-300',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/50'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 transition-colors',
                        isActive ? 'text-primary' : 'text-slate-400 group-hover:text-primary'
                      )}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="px-3 sm:px-4 mt-auto space-y-4">
          <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-100 dark:bg-slate-900/50 border border-border/50">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              </div>
              <div>
                <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">{isPro ? 'Current Plan' : 'Pro Plan'}</div>
                <div className="text-xs sm:text-sm font-bold">{isPro ? 'Active Subscription' : 'Unlimited Access'}</div>
              </div>
            </div>
            {isPro ? (
              <div className="flex items-center justify-center gap-1.5 w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Active
              </div>
            ) : (
              <Link 
                href="/pricing"
                className="flex items-center justify-center gap-1.5 w-full py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white dark:bg-slate-950 text-[10px] sm:text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-border"
              >
                Upgrade
                <ExternalLink className="h-3 w-3" />
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 sm:py-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-950 border border-border shadow-sm">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-black truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}` 
                  : user?.firstName || user?.username || 'User'}
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">Developer</div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  );
}
