'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { Crown, Shield, Zap, ArrowUpCircle } from 'lucide-react';
import { cn, hasProAccess } from '@/lib/utils';
import Link from 'next/link';

// Global cache for profile to avoid redundant fetches on navigation
let profileCache: { role: string; plan: string; timestamp: number } | null = null;

export function UserStatus() {
  const { isSignedIn } = useUser();
  const [profile, setProfile] = useState<{ role: string; plan: string } | null>(profileCache);

  useEffect(() => {
    if (!isSignedIn) return;

    const refreshProfile = () => {
      const now = Date.now();
      // Use cache if it's less than 30 seconds old
      if (profileCache && now - profileCache.timestamp < 1000 * 30) {
        setProfile(profileCache);
        return;
      }

      fetch('/api/profile', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.profile) {
            const newProfile = { ...data.profile, timestamp: now };
            profileCache = newProfile;
            setProfile(newProfile);
          }
        })
        .catch(err => console.error('Failed to fetch user profile:', err));
    };

    refreshProfile();
    window.addEventListener('focus', refreshProfile);
    return () => window.removeEventListener('focus', refreshProfile);
  }, [isSignedIn]);

  if (!isSignedIn || !profile) return null;
  
  const isPro = hasProAccess(profile.plan);
  const isAdmin = profile.role === 'admin' || profile.plan === 'admin';

  return (
    <div className="flex items-center gap-3 mr-2">
      <div className="flex items-center gap-2">
        {isAdmin && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-900/50 text-purple-700 dark:text-purple-400">
            <Shield className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Admin</span>
          </div>
        )}
        
        {isPro ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400">
            <Crown className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{profile.plan}</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
            <Zap className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Free</span>
          </div>
        )}
      </div>

      {!isPro && (
        <Link 
          href="/pricing"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm shadow-primary/20"
        >
          <ArrowUpCircle className="h-3.5 w-3.5" />
          Upgrade
        </Link>
      )}
    </div>
  );
}
