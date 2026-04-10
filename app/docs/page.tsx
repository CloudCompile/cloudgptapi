'use client';

import { Bot, Clock, Code, Crown, ExternalLink, Hash, Image as ImageIcon, Info, MessageSquare, Shield, Terminal, Video, Zap, Menu, X, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DocsPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 sm:pt-24 pb-8 sm:pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 mesh-gradient opacity-60 dark:opacity-40" />
      <div className="fixed inset-0 dot-grid opacity-30" />

      {/* Mobile Nav Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-24 right-6 z-50 h-14 w-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 relative">

          {/* Sidebar Navigation */}
          <aside className={cn(
            "lg:w-72 shrink-0 lg:sticky lg:top-32 h-fit transition-all duration-500 z-40",
            "fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-900 lg:bg-transparent lg:dark:bg-transparent p-6 lg:p-0 border-r lg:border-none",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}>
            <nav className="h-full lg:h-auto overflow-y-auto lg:overflow-visible p-0 lg:p-6 rounded-none lg:rounded-[2.5rem] lg:bg-white/60 lg:dark:bg-slate-900/60 lg:backdrop-blur-2xl lg:border lg:border-white/20 lg:dark:border-slate-800/50 lg:shadow-2xl lg:shadow-slate-200/50 lg:dark:shadow-none space-y-2">
              <div className="px-3 sm:px-4 py-1 sm:py-2 mb-3 sm:mb-4">
                <p className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em]">Documentation</p>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">API Guide</h3>
              </div>

              <div className="grid grid-cols-1 gap-1 sm:gap-2">
                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 sm:px-4 mt-4 lg:mt-6 mb-1 sm:mb-2">Getting Started</p>
                <DocNavLink onClick={() => setIsMobileMenuOpen(false)} href="#introduction" icon={<Info className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} label="Introduction" />
                <DocNavLink onClick={() => setIsMobileMenuOpen(false)} href="#authentication" icon={<Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} label="Auth" />
                <DocNavLink onClick={() => setIsMobileMenuOpen(false)} href="#base-url" icon={<Hash className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} label="Base URL" />

                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 sm:px-4 mt-6 lg:mt-8 mb-1 sm:mb-2">Endpoints</p>
                <DocNavLink onClick={() => setIsMobileMenuOpen(false)} href="#memory" icon={<Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} label="Memory" />
                <DocNavLink onClick={() => setIsMobileMenuOpen(false)} href="#chat" icon={<MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} label="Chat" />
                <DocNavLink onClick={() => setIsMobileMenuOpen(false)} href="#image" icon={<ImageIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} label="Image" />
                <DocNavLink onClick={() => setIsMobileMenuOpen(false)} href="#video" icon={<Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} label="Video" />

                <p className="text-[9px] sm:text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-3 sm:px-4 mt-6 lg:mt-8 mb-1 sm:mb-2">Advanced</p>
                <DocNavLink onClick={() => setIsMobileMenuOpen(false)} href="#headers" icon={<Terminal className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} label="Headers" />
                <DocNavLink onClick={() => setIsMobileMenuOpen(false)} href="#ratelimits" icon={<Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} label="Limits" />
                <DocNavLink onClick={() => setIsMobileMenuOpen(false)} href="#transparency" icon={<Shield className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} label="Privacy" />
                <DocNavLink onClick={() => setIsMobileMenuOpen(false)} href="#error-handling" icon={<Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />} label="Errors" />
              </div>

              <div className="mt-8 p-4 rounded-3xl bg-primary/10 border border-primary/20">
                <p className="text-xs font-bold text-primary mb-2 flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Need Help?
                </p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  Join our Discord community for developer support.
                </p>
                <a
                  href="https://discord.gg/f7xR8qga"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform text-center block"
                >
                  Join Discord
                </a>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 animate-in fade-in slide-in-from-right-8 duration-1000">
            <header className="mb-10 sm:mb-16">
              <div className="flex items-center gap-2 text-primary font-bold mb-3 sm:mb-4">
                <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10 backdrop-blur-md border border-primary/20">
                  <Code className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span className="tracking-[0.2em] uppercase text-[10px] sm:text-xs">Developer Portal</span>
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tight">
                Documentation
              </h1>
              <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                Everything you need to integrate <span className="text-primary font-black">Vetra</span>'s multi-modal AI infrastructure into your applications.
              </p>
            </header>

            <div className="space-y-12 sm:space-y-24 pb-12 sm:pb-24">

              {/* Introduction */}
              <section id="introduction" className="scroll-mt-24 sm:scroll-mt-32">
                <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <Info className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Introduction</h2>
                  </div>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4 sm:mb-6">
                      Vetra provides a unified API for accessing AI models across multiple providers. Text generation, image creation, and video synthesis are all available through a single OpenAI-compatible endpoint.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mt-6 sm:mt-8">
                      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-1 sm:mb-2">Unified Access</h4>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">One API key for 50+ models from Claude, OpenAI, DeepSeek, Google, and more.</p>
                      </div>
                      <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                        <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mb-1 sm:mb-2">OpenAI-Compatible</h4>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Drop-in replacement for the OpenAI SDK — just change the base URL and your existing code works.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Authentication */}
              <section id="authentication" className="scroll-mt-24 sm:scroll-mt-32">
                <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Authentication</h2>
                  </div>
                  <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6 sm:mb-8">
                    All requests require a Bearer token in the <code className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold">Authorization</code> header. Generate your API key from the dashboard — keys are prefixed <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">vtai_</code>.
                  </p>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl sm:rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative rounded-2xl sm:rounded-[2rem] bg-slate-900 overflow-hidden">
                      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/50">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">HTTP Header</span>
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                        </div>
                      </div>
                      <div className="p-5 sm:p-8">
                        <code className="text-xs sm:text-base text-emerald-400 font-mono leading-relaxed block whitespace-pre-wrap">
                          Authorization: Bearer vtai_your_api_key_here
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Base URL */}
              <section id="base-url" className="scroll-mt-24 sm:scroll-mt-32">
                <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
                      <Hash className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Base URL</h2>
                  </div>
                  <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6 sm:mb-8">
                    All API requests should be made to:
                  </p>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl sm:rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative rounded-2xl sm:rounded-[2rem] bg-slate-900 overflow-hidden">
                      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/50">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Endpoint</span>
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                        </div>
                      </div>
                      <div className="p-5 sm:p-8">
                        <code className="text-xs sm:text-base text-blue-400 font-mono leading-relaxed block whitespace-pre-wrap">
                          https://vetraai.vercel.app/v1
                        </code>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 sm:mt-6">
                    To use Vetra with the OpenAI SDK, set <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">baseURL</code> to this URL and your Vetra key as the API key. No other code changes needed.
                  </p>
                </div>
              </section>

              {/* Memory API */}
              <section id="memory" className="scroll-mt-24 sm:scroll-mt-32">
                <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
                      <Bot className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Memory</h2>
                  </div>

                  <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6 sm:mb-8">
                    Vetra supports per-user persistent memory. When a request includes an <code className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-xs">x-user-id</code> header, relevant memories from prior sessions are retrieved and injected into the context before the request is forwarded to the model. After the response, the interaction is stored for future retrieval.
                  </p>

                  <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Scoped per user</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Each <code>x-user-id</code> value maintains its own isolated memory store.</p>
                    </div>
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Cross-session</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Memory persists across separate API requests and sessions for the same user ID.</p>
                    </div>
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">Automatic</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">No extra API calls required — memory retrieval and storage happen inside the request pipeline.</p>
                    </div>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-3 sm:mb-4">Activating Memory</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    Pass a stable, unique identifier for your end-user in the <code className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-xs">x-user-id</code> header. This can be any string — a database UUID, a hashed email, etc.
                  </p>

                  <div className="relative group mb-4 sm:mb-6">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl sm:rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative rounded-2xl sm:rounded-[2rem] bg-slate-900 overflow-hidden">
                      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/50">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">JavaScript</span>
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                        </div>
                      </div>
                      <div className="p-5 sm:p-8 overflow-x-auto">
                        <pre className="text-xs sm:text-sm font-mono text-slate-300"><code>{`const response = await fetch('https://vetraai.vercel.app/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
    'x-user-id': 'user_abc123'  // activates memory for this user
  },
  body: JSON.stringify({
    model: 'openai',
    messages: [{ role: 'user', content: 'My name is Alex.' }]
  })
});`}</code></pre>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                      Memory write after each response is asynchronous and does not block the reply. If the memory service is unavailable, the request still completes normally.
                    </p>
                  </div>
                </div>
              </section>

              {/* Chat API */}
              <section id="chat" className="scroll-mt-24 sm:scroll-mt-32">
                <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Chat Completions</h2>
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                        <Crown className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Multi-Provider</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6 sm:mb-8">
                    Generate text completions using models like GPT-4.1, Claude Sonnet 4.6, DeepSeek V3.2, Gemini 2.5 Pro, and more. Compatible with the OpenAI Chat Completions API.
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-1 mb-6 sm:mb-8 flex items-center h-10 sm:h-12 w-fit">
                    <span className="px-3 py-1 font-bold text-xs bg-blue-500 text-white rounded-lg mr-2">POST</span>
                    <code className="text-sm font-mono px-2">/v1/chat/completions</code>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-3 sm:mb-4">Request Body</h3>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 mb-6 sm:mb-8">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                        <tr>
                          <th className="px-4 sm:px-6 py-3">Parameter</th>
                          <th className="px-4 sm:px-6 py-3">Type</th>
                          <th className="px-4 sm:px-6 py-3">Required</th>
                          <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-mono font-bold text-primary">model</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">string</td>
                          <td className="px-4 sm:px-6 py-4 text-red-500">Yes</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 hidden sm:table-cell">Model ID or alias (e.g. <code>"openai"</code>, <code>"claude"</code>, <code>"gemini-large"</code>)</td>
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-mono font-bold text-primary">messages</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">array</td>
                          <td className="px-4 sm:px-6 py-4 text-red-500">Yes</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 hidden sm:table-cell">Array of <code>{`{ role, content }`}</code> objects</td>
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-mono font-bold text-primary">stream</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">boolean</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-400">No</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 hidden sm:table-cell">Enable SSE streaming (default: false)</td>
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-mono font-bold text-primary">max_tokens</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">integer</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-400">No</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 hidden sm:table-cell">Maximum tokens to generate</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-3 sm:mb-4">Example</h3>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl sm:rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative rounded-2xl sm:rounded-[2rem] bg-slate-900 overflow-hidden">
                      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/50">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">cURL</span>
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                        </div>
                      </div>
                      <div className="p-5 sm:p-8 overflow-x-auto">
                        <pre className="text-xs sm:text-sm font-mono text-slate-300"><code>{`curl -X POST https://vetraai.vercel.app/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "openai",
    "messages": [{"role": "user", "content": "Explain quantum computing"}]
  }'`}</code></pre>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Image API */}
              <section id="image" className="scroll-mt-24 sm:scroll-mt-32">
                <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-purple-500/10 text-purple-600 group-hover:scale-110 transition-transform">
                      <ImageIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Image Generation</h2>
                  </div>
                  <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4 sm:mb-6">
                    Generate images from text using the OpenAI images API format.
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-1 mb-6 sm:mb-8 flex items-center h-10 sm:h-12 w-fit">
                    <span className="px-3 py-1 font-bold text-xs bg-blue-500 text-white rounded-lg mr-2">POST</span>
                    <code className="text-sm font-mono px-2">/v1/images/generations</code>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl sm:rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative rounded-2xl sm:rounded-[2rem] bg-slate-900 overflow-hidden">
                      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/50">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">JavaScript</span>
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                        </div>
                      </div>
                      <div className="p-5 sm:p-8 overflow-x-auto">
                        <pre className="text-xs sm:text-sm font-mono text-slate-300"><code>{`const response = await fetch('https://vetraai.vercel.app/v1/images/generations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "Cyberpunk city with neon lights",
    model: "flux",
    response_format: "url"
  })
});

const { data } = await response.json();
const imageUrl = data[0].url;`}</code></pre>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Video API */}
              <section id="video" className="scroll-mt-24 sm:scroll-mt-32">
                <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-pink-500/10 text-pink-600 group-hover:scale-110 transition-transform">
                      <Video className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Video Generation</h2>
                  </div>
                  <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4 sm:mb-6">
                    Generate short videos from text prompts.
                  </p>

                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 p-1 mb-6 sm:mb-8 flex items-center h-10 sm:h-12 w-fit">
                    <span className="px-3 py-1 font-bold text-xs bg-blue-500 text-white rounded-lg mr-2">POST</span>
                    <code className="text-sm font-mono px-2">/v1/video/generations</code>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl sm:rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative rounded-2xl sm:rounded-[2rem] bg-slate-900 overflow-hidden">
                      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/50">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">JavaScript</span>
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                        </div>
                      </div>
                      <div className="p-5 sm:p-8 overflow-x-auto">
                        <pre className="text-xs sm:text-sm font-mono text-slate-300"><code>{`const response = await fetch('https://vetraai.vercel.app/v1/video/generations', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: "A cat playing with a red ball",
    model: "veo"
  })
});

const { data } = await response.json();
const videoUrl = data[0].url;`}</code></pre>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Custom Headers */}
              <section id="headers" className="scroll-mt-24 sm:scroll-mt-32">
                <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
                      <Terminal className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Custom Headers</h2>
                  </div>
                  <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6 sm:mb-8">
                    Optional headers that control per-user context and data isolation.
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                        <tr>
                          <th className="px-4 sm:px-6 py-3">Header</th>
                          <th className="px-4 sm:px-6 py-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-mono font-bold text-primary">x-user-id</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 dark:text-slate-400">Stable identifier for your end-user. Used to scope memory and request context per user.</td>
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-mono font-bold text-primary">x-character-id</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 dark:text-slate-400">Character ID for SillyTavern or similar clients — used to scope lore and plugin context.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Rate Limits */}
              <section id="ratelimits" className="scroll-mt-24 sm:scroll-mt-32">
                <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-pink-500/10 text-pink-600 group-hover:scale-110 transition-transform">
                      <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Rate Limits</h2>
                  </div>
                  <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6 sm:mb-8">
                    Daily request limits per API key, based on plan. Limits reset at UTC midnight. During peak hours, effective limits may be lower.
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                        <tr>
                          <th className="px-4 sm:px-6 py-3">Plan</th>
                          <th className="px-4 sm:px-6 py-3">Chat</th>
                          <th className="px-4 sm:px-6 py-3">Image</th>
                          <th className="px-4 sm:px-6 py-3">Video</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-bold text-slate-900 dark:text-white">Free</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">100 / day</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">10 / day</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">5 / day</td>
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-bold text-primary">Pro</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">1,000 / day</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">50 / day</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">5 / day</td>
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-bold text-blue-600">Ultra</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">2,500 / day</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">100 / day</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">10 / day</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-2 text-sm">
                      <Info className="h-4 w-4" />
                      Response Headers
                    </h4>
                    <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-500">
                      Every response includes <code>X-RateLimit-Remaining</code>, <code>X-RateLimit-Reset</code>, <code>X-DailyLimit-Remaining</code>, and <code>X-DailyLimit-Reset</code> headers.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data & Transparency */}
              <section id="transparency" className="scroll-mt-24 sm:scroll-mt-32">
                <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
                      <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Data Handling</h2>
                  </div>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4 sm:mb-6">
                      Vetra routes requests to upstream providers. Chat messages and generated content are not stored on Vetra servers — only request metadata (model used, token count, timestamp) is logged for billing and rate-limiting.
                    </p>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-3 sm:mb-4">User Identification Priority</h3>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 mb-4 sm:mb-6">
                      <ul className="list-none p-0 m-0 space-y-3">
                        <li className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                          <span className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">x-user-id header</strong> — takes priority if provided by the caller.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">2</span>
                          <span className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">API key owner</strong> — request is attributed to the account that owns the key.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">3</span>
                          <span className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">Kinde session</strong> — for dashboard/browser requests.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300">4</span>
                          <span className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">IP address</strong> — fallback for unauthenticated requests.</span>
                        </li>
                      </ul>
                    </div>

                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mb-3 sm:mb-4">What Vetra stores</h3>
                    <ul className="space-y-2 list-none p-0 m-0">
                      <li className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">Usage logs:</strong> model ID, token count, request type, timestamp — used for billing and limits.</li>
                      <li className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">Memory:</strong> stored at the memory service level, keyed by user ID. Not stored on Vetra infrastructure directly.</li>
                      <li className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-white">Images/Video:</strong> generated media may be temporarily cached by upstream providers for retrieval.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Error Handling */}
              <section id="error-handling" className="scroll-mt-24 sm:scroll-mt-32">
                <div className="p-6 sm:p-10 rounded-2xl sm:rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-red-500/10 text-red-600 group-hover:scale-110 transition-transform">
                      <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                    </div>
                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Error Handling</h2>
                  </div>
                  <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6 sm:mb-8">
                    Errors follow standard HTTP status codes. The response body is JSON with an <code className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">error</code> field describing the issue.
                  </p>
                  <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                        <tr>
                          <th className="px-4 sm:px-6 py-3">Status</th>
                          <th className="px-4 sm:px-6 py-3">Meaning</th>
                          <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Common cause</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-mono font-bold text-amber-600">400</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">Bad Request</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 hidden sm:table-cell">Missing required field, invalid model ID</td>
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-mono font-bold text-red-600">401</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">Unauthorized</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 hidden sm:table-cell">Missing or invalid API key</td>
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-mono font-bold text-orange-600">403</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">Forbidden</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 hidden sm:table-cell">Model requires a higher plan tier</td>
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-mono font-bold text-yellow-600">429</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">Too Many Requests</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 hidden sm:table-cell">Rate limit or daily quota exceeded</td>
                        </tr>
                        <tr>
                          <td className="px-4 sm:px-6 py-4 font-mono font-bold text-red-700">500</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-600 dark:text-slate-400">Server Error</td>
                          <td className="px-4 sm:px-6 py-4 text-slate-500 hidden sm:table-cell">Upstream provider error or timeout</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

            </div>

            {/* Footer */}
            <div className="mt-24 pt-12 border-t border-slate-200 dark:border-slate-800 text-center">
              <p className="text-slate-500 dark:text-slate-400 mb-6">Questions? Join the Discord community.</p>
              <div className="flex justify-center gap-4">
                <a href="https://discord.gg/f7xR8qga" target="_blank" rel="noopener noreferrer" className="px-6 py-2 rounded-lg bg-primary text-white font-bold hover:scale-105 transition-transform flex items-center gap-2">
                  Join Discord
                  <ExternalLink className="h-4 w-4" />
                </a>
                <Link href="/playground" className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  Try the Playground
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function DocNavLink({ href, icon, label, onClick }: { href: string, icon: React.ReactNode, label: string, onClick?: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-primary transition-all group"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}
