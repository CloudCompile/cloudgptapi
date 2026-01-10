'use client';

import React from 'react';
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
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserButton, useUser } from '@clerk/nextjs';
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

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 z-50 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl border-r border-border/50">
      <div className="flex flex-col flex-grow pt-8 pb-6 overflow-y-auto">
        <div className="px-8 mb-10">
          <Logo />
        </div>
        
        <nav className="flex-1 px-4 space-y-10">
          <div>
            <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
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
                      'group flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300',
                      isActive
                        ? 'bg-primary text-white shadow-lg shadow-primary/20'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/50'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 transition-colors',
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-primary'
                      )}
                    />
                    {item.name}
                    {isActive && <ChevronRight className="ml-auto h-4 w-4 animate-in slide-in-from-left-2" />}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
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
                      'group flex items-center px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/50'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5 transition-colors',
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

        <div className="px-4 mt-auto">
          <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-900/50 border border-border/50 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-500">Pro Plan</div>
                <div className="text-sm font-bold">Unlimited Access</div>
              </div>
            </div>
            <Link 
              href="/pricing"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-white dark:bg-slate-950 text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-border"
            >
              Upgrade
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="flex items-center gap-3 px-4 py-4 rounded-3xl bg-white dark:bg-slate-950 border border-border shadow-sm">
            <UserButton 
              afterSignOutUrl="/" 
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10 rounded-xl"
                }
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black truncate">{user?.fullName || user?.username || 'User'}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">Developer</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
