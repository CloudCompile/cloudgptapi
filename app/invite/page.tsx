"use client";

import { useState } from 'react';
import { Check, X } from 'lucide-react';

export default function InvitePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

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
