'use client';

import { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Fingerprint,
  Copy,
  Check,
  Shield,
  LogOut,
  ExternalLink,
  Loader2,
  Lock,
  Key,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
  id: string;
  email: string;
  name?: string;
  username?: string;
  picture?: string;
  plan?: string;
  role?: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Get full profile details from the JWT + Supabase
        const res = await fetch('/api/settings/profile');
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
        }
      } catch (e) {
        console.error('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  function copyId() {
    if (!profile?.id) return;
    navigator.clipboard.writeText(profile.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black tracking-wider uppercase mb-3 border border-primary/20">
          <Lock className="h-3 w-3" />
          <span>Account</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
          Manage your account and security preferences.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
        </div>
      ) : (
        <>
          {/* User Information */}
          <div className="glass-card rounded-2xl sm:rounded-[2rem] border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-black text-sm uppercase tracking-widest">User Information</h2>
            </div>

            <div className="divide-y divide-white/5">
              {/* Avatar + Name */}
              <div className="px-6 py-5 flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {profile?.picture ? (
                    <img src={profile.picture} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-7 w-7 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="font-black text-base">
                    {profile?.name || profile?.username || 'User'}
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-0.5">
                    {profile?.plan?.replace('_', ' ') || 'Free'} Plan
                    {profile?.role === 'admin' && (
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Email</div>
                    <div className="text-sm font-bold">{profile?.email || '—'}</div>
                  </div>
                </div>
              </div>

              {/* Username */}
              {profile?.username && (
                <div className="px-6 py-4 flex items-center gap-3">
                  <User className="h-4 w-4 text-slate-500 shrink-0" />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Username</div>
                    <div className="text-sm font-bold">{profile.username}</div>
                  </div>
                </div>
              )}

              {/* User ID */}
              <div className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <Fingerprint className="h-4 w-4 text-slate-500 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
                      Identifier ID <span className="font-normal normal-case tracking-normal text-slate-600">(give to support)</span>
                    </div>
                    <div className="text-xs font-mono text-slate-400 truncate max-w-xs">
                      {profile?.id || '—'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={copyId}
                  className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-primary transition-colors shrink-0"
                  title="Copy ID"
                >
                  {copiedId ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="glass-card rounded-2xl sm:rounded-[2rem] border border-white/10 overflow-hidden">
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Shield className="h-4 w-4 text-amber-400" />
              </div>
              <h2 className="font-black text-sm uppercase tracking-widest">Security</h2>
            </div>

            <div className="divide-y divide-white/5">
              {/* API Keys link */}
              <Link
                href="/dashboard"
                className="px-6 py-4 flex items-center justify-between group hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Key className="h-4 w-4 text-slate-500 group-hover:text-primary transition-colors" />
                  <div>
                    <div className="text-sm font-black group-hover:text-white transition-colors">Manage API Keys</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">Create, rotate, or revoke access keys</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-primary transition-colors" />
              </Link>

              {/* Sign out */}
              <Link
                href="/api/auth/logout"
                className="px-6 py-4 flex items-center justify-between group hover:bg-red-500/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                  <div>
                    <div className="text-sm font-black group-hover:text-red-400 transition-colors">Sign Out</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">Sign out of your account</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-red-400 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Account info note */}
          <p className="text-xs text-slate-600 font-medium text-center">
            Account managed via{' '}
            <a
              href="https://kinde.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              Kinde Auth <ExternalLink className="h-3 w-3" />
            </a>
            . To change your password or social connections, visit your Kinde profile.
          </p>
        </>
      )}
    </div>
  );
}
