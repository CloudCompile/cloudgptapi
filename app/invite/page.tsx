"use client";

import { X } from 'lucide-react';

export default function InvitePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="fixed inset-0 mesh-gradient opacity-60 dark:opacity-40" />
      <div className="fixed inset-0 dot-grid opacity-30" />

      <div className="max-w-xl mx-auto relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-2 border-red-200 dark:border-red-800/50 text-center">
          <div className="h-16 w-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
            <X className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-4">
            Invite Codes Disabled
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Invite codes are no longer available. If you need access to a paid plan, please subscribe through our pricing page.
          </p>
          <a 
            href="/pricing"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm uppercase tracking-wider hover:scale-105 active:scale-95 transition-all"
          >
            View Pricing
          </a>
        </div>
      </div>
    </div>
  );
}