"use client";

import { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InvitePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then(res => {
        if (res.ok) setIsSignedIn(true);
      })
      .catch(() => setIsSignedIn(false))
      .finally(() => setCheckingAuth(false));
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }) });
      const data = await res.json();
      if (res.ok) setResult({ ok: true, message: 'Your account was upgraded to Pro.' });
      else setResult({ ok: false, message: data?.error || 'Failed to use invite code.' });
    } catch (err) {
      setResult({ ok: false, message: 'Network error' });
    } finally {
      setLoading(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-black mb-4">Sign In Required</h1>
        <p className="text-slate-400 mb-6">You need to sign in to use an invite code.</p>
        <button
          onClick={() => router.push('/sign-in')}
          className="px-4 py-2 bg-primary text-white rounded-lg font-bold"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-black mb-4">Enter Invite Code</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="Paste invite code"
          className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-white/5"
        />

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg font-bold"
        >
          {loading ? 'Applying...' : 'Apply Code'}
        </button>
      </form>

      {result && (
        <div className={`mt-4 p-3 rounded-lg ${result.ok ? 'bg-emerald-900/30' : 'bg-red-900/20'}`}>
          <div className="flex items-center gap-2">
            {result.ok ? <Check className="h-4 w-4 text-emerald-400" /> : <X className="h-4 w-4 text-red-400" />}
            <div className="font-bold">{result.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}
