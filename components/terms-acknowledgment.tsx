'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TermsAcknowledgment() {
  const [isOpen, setIsOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const acknowledged = localStorage.getItem('terms_acknowledged_v2');
    if (!acknowledged) {
      setIsOpen(true);
    }
  }, []);

  const handleAcknowledge = () => {
    if (isChecked) {
      localStorage.setItem('terms_acknowledged_v2', 'true');
      setIsOpen(false);
    }
  };

  if (!isClient) return null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-border shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
            We Updated Our Policies
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please review our updated Terms of Service and Privacy Policy.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <Link
            href="/terms-of-service"
            target="_blank"
            className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="font-bold text-slate-900 dark:text-white">Terms of Service</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">View →</span>
          </Link>
          <Link
            href="/privacy-policy"
            target="_blank"
            className="flex items-center justify-between p-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="font-bold text-slate-900 dark:text-white">Privacy Policy</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">View →</span>
          </Link>
        </div>

        <label className="flex items-start gap-3 mb-6 cursor-pointer">
          <div className="mt-0.5">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 text-primary focus:ring-primary focus:ring-offset-2"
            />
          </div>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            I have read and agree to the updated Terms of Service and Privacy Policy
          </span>
        </label>

        <button
          onClick={handleAcknowledge}
          disabled={!isChecked}
          className={cn(
            "w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all",
            isChecked
              ? "bg-primary text-white hover:scale-[1.02] active:scale-[0.98]"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
          )}
        >
          {isChecked ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-5 w-5" />
              Acknowledge
            </span>
          ) : (
            "Please agree to continue"
          )}
        </button>
      </div>
    </div>
  );
}