import { ArrowRight, Bot, Clock, Code, Cpu, Download, ExternalLink, Hash, Image as ImageIcon, Info, MessageSquare, Shield, Terminal, Video, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 mesh-gradient opacity-60 dark:opacity-40" />
      <div className="fixed inset-0 dot-grid opacity-30" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="lg:w-72 shrink-0 lg:sticky lg:top-32 h-fit animate-in fade-in slide-in-from-left-8 duration-1000">
            <nav className="p-6 rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none space-y-2">
              <div className="px-4 py-2 mb-4">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Documentation</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">API Guide</h3>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4 mt-6 mb-2">Getting Started</p>
                <DocNavLink href="#introduction" icon={<Info className="h-4 w-4" />} label="Introduction" />
                <DocNavLink href="#authentication" icon={<Shield className="h-4 w-4" />} label="Authentication" />
                <DocNavLink href="#base-url" icon={<Hash className="h-4 w-4" />} label="Base URL" />
                
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4 mt-8 mb-2">Endpoints</p>
                <DocNavLink href="#memory" icon={<Bot className="h-4 w-4" />} label="Advanced Memory" />
                <DocNavLink href="#chat" icon={<MessageSquare className="h-4 w-4" />} label="Chat Completions" />
                <DocNavLink href="#image" icon={<ImageIcon className="h-4 w-4" />} label="Image Generation" />
                <DocNavLink href="#video" icon={<Video className="h-4 w-4" />} label="Video Generation" />
                
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-4 mt-8 mb-2">Advanced</p>
                <DocNavLink href="#headers" icon={<Terminal className="h-4 w-4" />} label="Custom Headers" />
                <DocNavLink href="#ratelimits" icon={<Clock className="h-4 w-4" />} label="Rate Limits" />
                <DocNavLink href="#transparency" icon={<Shield className="h-4 w-4" />} label="Data & Privacy" />
                <DocNavLink href="#error-handling" icon={<Zap className="h-4 w-4" />} label="Error Handling" />
              </div>

              <div className="mt-8 p-4 rounded-3xl bg-primary/10 border border-primary/20">
                <p className="text-xs font-bold text-primary mb-2 flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  Need Help?
                </p>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  Our developer support team is available 24/7 for Enterprise customers.
                </p>
                <button className="w-full py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform">
                  Contact Support
                </button>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl animate-in fade-in slide-in-from-right-8 duration-1000">
            <header className="mb-16">
              <div className="flex items-center gap-2 text-primary font-bold mb-4">
                <div className="p-2 rounded-xl bg-primary/10 backdrop-blur-md border border-primary/20">
                  <Code className="h-5 w-5" />
                </div>
                <span className="tracking-[0.2em] uppercase text-xs">Developer Portal</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                Documentation
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed">
                Everything you need to integrate <span className="text-primary font-black">CloudGPT</span>'s powerful multi-modal AI infrastructure into your production applications.
              </p>
            </header>

            <div className="space-y-24 pb-24">
              
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-32">
                <div className="p-10 rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                      <Info className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Introduction</h2>
                  </div>
                  <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
                      CloudGPT provides a unified API for accessing the world's most advanced AI models. Whether you need text generation, image creation, or complex video synthesis, our infrastructure handles the heavy lifting.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4 mt-8">
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                        <h4 className="font-black text-slate-900 dark:text-white mb-2">Unified Access</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">One API key, dozens of models. Switch between providers with a single parameter.</p>
                      </div>
                      <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50">
                        <h4 className="font-black text-slate-900 dark:text-white mb-2">Enterprise Scale</h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">99.99% uptime guarantee and global low-latency edge deployment.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Authentication */}
              <section id="authentication" className="scroll-mt-32">
                <div className="p-10 rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
                      <Shield className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Authentication</h2>
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                    Secure your requests using standard Bearer token authentication. Your API key should be included in the <code className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold">Authorization</code> header.
                  </p>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative rounded-[2rem] bg-slate-900 overflow-hidden">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">HTTP Header</span>
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                        </div>
                      </div>
                      <div className="p-8">
                        <code className="text-sm sm:text-base text-emerald-400 font-mono leading-relaxed block whitespace-pre-wrap">
                          Authorization: Bearer YOUR_API_KEY
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Base URL */}
              <section id="base-url" className="scroll-mt-32">
                <div className="p-10 rounded-[2.5rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/20 dark:border-slate-800/50 shadow-2xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
                      <Hash className="h-6 w-6" />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Base URL</h2>
                  </div>
                  <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
                    All API requests should be made to our primary global endpoint:
                  </p>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <div className="relative rounded-[2rem] bg-slate-900 overflow-hidden">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Endpoint</span>
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                        </div>
                      </div>
                      <div className="p-8">
                        <code className="text-sm sm:text-base text-blue-400 font-mono leading-relaxed block whitespace-pre-wrap">
                          https://cloudgptapi.vercel.app/v1
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Memory API */}
              <section id="memory" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <svg viewBox="0 0 24 24" className="h-8 w-8 fill-current">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9h10v2H7z"/>
                    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" opacity="0.3"/>
                  </svg>
                  Infinite Memory Recall
                </h2>
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                    <p className="text-lg text-emerald-800 dark:text-emerald-300 font-medium">
                      Unleash the power of <strong>Long-Term Cognitive Memory</strong>! Every chat session across all models now features automatic, persistent recall. Your AI agents will remember user preferences, past interactions, and complex context across days, weeks, or months!
                    </p>
                  </div>
                  
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="h-8 w-8 text-emerald-500 mb-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                        </svg>
                      </div>
                      <h4 className="font-bold mb-1">Zero Latency</h4>
                      <p className="text-xs text-slate-500">Instant recall integrated directly into the inference stream.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="h-8 w-8 text-blue-500 mb-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      </div>
                      <h4 className="font-bold mb-1">User Isolation</h4>
                      <p className="text-xs text-slate-500">Cryptographically isolated memory silos per end-user.</p>
                    </div>
                    <div className="p-4 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50">
                      <div className="h-8 w-8 text-purple-500 mb-2">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <h4 className="font-bold mb-1">Auto-Sync</h4>
                      <p className="text-xs text-slate-500">Every response is automatically indexed for future recall.</p>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold italic text-slate-800 dark:text-slate-200">Activating Memory</h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Memory is enabled by default on the <code>/v1/chat/completions</code> endpoint. Simply provide a unique <code>x-user-id</code> to start building a persistent cognitive profile for your user.
                  </p>

                  <div className="rounded-xl bg-slate-950 p-6 shadow-2xl border border-slate-800 overflow-x-auto">
                    <pre className="text-sm font-mono text-slate-300">
                      <code>{`// Memory is AUTOMATIC when you provide a x-user-id
const response = await fetch('https://cloudgptapi.vercel.app/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
    'x-user-id': 'customer_unique_id_99' // <--- This activates isolated memory!
  },
  body: JSON.stringify({
    model: 'openai',
    messages: [{ role: 'user', content: 'My favorite coffee is an Oat Milk Latte.' }]
  })
});`}</code>
                    </pre>
                  </div>

                  <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20">
                    <h4 className="font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                      </svg>
                      How it works
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      When a request includes <code>x-user-id</code>, CloudGPT queries the <strong>PolliStack Agent Engine</strong> for relevant past interactions. This context is then seamlessly woven into the system prompt, giving the AI "memories" of previous conversations without any extra work from you!
                    </p>
                  </div>
                </div>
              </section>

              {/* Chat API */}
              <section id="chat" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MessageSquare className="h-6 w-6 text-blue-500" />
                  Chat Completions
                </h2>
                <div className="space-y-6">
                  <p className="text-slate-600 dark:text-slate-400">
                    Generate text completions using various LLMs like GPT-4o, Claude 3.5, and Llama 3.3.
                  </p>
                  
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border p-1 mb-6 flex items-center h-12 w-fit">
                    <span className="px-3 py-1 font-bold text-xs bg-blue-500 text-white rounded-lg mr-2">POST</span>
                    <code className="text-sm font-mono px-2">/v1/chat/completions</code>
                  </div>

                  <h3 className="text-lg font-bold">Request Body</h3>
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                        <tr>
                          <th className="px-6 py-3">Parameter</th>
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3">Required</th>
                          <th className="px-6 py-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr>
                          <td className="px-6 py-4 font-mono font-bold text-primary">model</td>
                          <td className="px-6 py-4">string</td>
                          <td className="px-6 py-4 text-red-500">Yes</td>
                          <td className="px-6 py-4 text-slate-500">The model ID to use (e.g., "openai", "claude")</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-mono font-bold text-primary">messages</td>
                          <td className="px-6 py-4">array</td>
                          <td className="px-6 py-4 text-red-500">Yes</td>
                          <td className="px-6 py-4 text-slate-500">Array of objects with <code>role</code> and <code>content</code></td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-mono font-bold text-primary">stream</td>
                          <td className="px-6 py-4">boolean</td>
                          <td className="px-6 py-4">No</td>
                          <td className="px-6 py-4 text-slate-500">Enable Server-Sent Events (SSE) streaming</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 className="text-lg font-bold">Example Usage</h3>
                  <div className="rounded-xl bg-slate-950 p-6 shadow-2xl border border-slate-800 overflow-x-auto">
                    <pre className="text-sm font-mono text-slate-300">
                      <code>{`curl -X POST https://cloudgptapi.vercel.app/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "openai",
    "messages": [{"role": "user", "content": "Explain quantum computing"}]
  }'`}</code>
                    </pre>
                  </div>
                </div>
              </section>

              {/* Image API */}
              <section id="image" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <ImageIcon className="h-6 w-6 text-purple-500" />
                  Image Generation
                </h2>
                <div className="space-y-6">
                  <p className="text-slate-600 dark:text-slate-400">
                    Create high-quality images from text descriptions using the OpenAI standard format.
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border p-1 mb-6 flex items-center h-12 w-fit">
                    <span className="px-3 py-1 font-bold text-xs bg-blue-500 text-white rounded-lg mr-2">POST</span>
                    <code className="text-sm font-mono px-2">/v1/images/generations</code>
                  </div>
                  <h3 className="text-lg font-bold">Example Usage</h3>
                  <div className="rounded-xl bg-slate-950 p-6 shadow-2xl border border-slate-800 overflow-x-auto">
                    <pre className="text-sm font-mono text-slate-300">
                      <code>{`const response = await fetch('/v1/images/generations', {
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
const imageUrl = data[0].url;`}</code>
                    </pre>
                  </div>
                  <p className="text-sm text-slate-500 italic">
                    Note: For direct binary responses, you can still use the legacy <code>/api/image</code> endpoint.
                  </p>
                </div>
              </section>

              {/* Video API */}
              <section id="video" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Video className="h-6 w-6 text-pink-500" />
                  Video Generation
                </h2>
                <div className="space-y-6">
                  <p className="text-slate-600 dark:text-slate-400">
                    Generate cinematic videos from text prompts.
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border p-1 mb-6 flex items-center h-12 w-fit">
                    <span className="px-3 py-1 font-bold text-xs bg-blue-500 text-white rounded-lg mr-2">POST</span>
                    <code className="text-sm font-mono px-2">/v1/video/generations</code>
                  </div>
                  <h3 className="text-lg font-bold">Example Usage</h3>
                  <div className="rounded-xl bg-slate-950 p-6 shadow-2xl border border-slate-800 overflow-x-auto">
                    <pre className="text-sm font-mono text-slate-300">
                      <code>{`const response = await fetch('/v1/video/generations', {
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
const videoUrl = data[0].url;`}</code>
                    </pre>
                  </div>
                  <p className="text-sm text-slate-500 italic">
                    Note: For direct binary responses, you can still use the legacy <code>/api/video</code> endpoint.
                  </p>
                </div>
              </section>

              {/* Custom Headers */}
              <section id="headers" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Terminal className="h-6 w-6 text-amber-500" />
                  Custom Headers
                </h2>
                <div className="space-y-6">
                  <p className="text-slate-600 dark:text-slate-400">
                    Control how CloudGPT identifies your users and manages their data storage.
                  </p>
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                        <tr>
                          <th className="px-6 py-3">Header</th>
                          <th className="px-6 py-3">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr>
                          <td className="px-6 py-4 font-mono font-bold text-primary">x-user-id</td>
                          <td className="px-6 py-4 text-slate-500">A unique identifier for your end-user. Used by PolliStack to isolate storage and memory.</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-mono font-bold text-primary">X-App-Source</td>
                          <td className="px-6 py-4 text-slate-500">Automatically set to "CloudGPT-API" for API requests. Can be used for custom tracking.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

              {/* Rate Limits */}
              <section id="ratelimits" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Clock className="h-6 w-6 text-pink-500" />
                  Rate Limits
                </h2>
                <div className="space-y-6">
                  <p className="text-slate-600 dark:text-slate-400">
                    To ensure fair usage and protect our upstream providers, CloudGPT implements per-minute rate limits based on your authentication status.
                  </p>
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900 text-slate-500 font-medium">
                        <tr>
                          <th className="px-6 py-3">User Type</th>
                          <th className="px-6 py-3">Chat</th>
                          <th className="px-6 py-3">Image</th>
                          <th className="px-6 py-3">Video</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        <tr>
                          <td className="px-6 py-4 font-bold">Anonymous (IP-based)</td>
                          <td className="px-6 py-4">10 / min</td>
                          <td className="px-6 py-4">5 / min</td>
                          <td className="px-6 py-4">2 / min</td>
                        </tr>
                        <tr>
                          <td className="px-6 py-4 font-bold text-primary">Authenticated (API Key)</td>
                          <td className="px-6 py-4">60 / min*</td>
                          <td className="px-6 py-4">30 / min*</td>
                          <td className="px-6 py-4">10 / min*</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-sm text-slate-500">
                    *Default limits for API keys. If you require higher throughput, please contact us for custom quota adjustments.
                  </p>
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-400 mb-1 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Headers
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-500">
                      Rate limit info is returned in the <code>X-RateLimit-Remaining</code> and <code>X-RateLimit-Reset</code> headers of every response.
                    </p>
                  </div>
                </div>
              </section>

              {/* Data & Transparency */}
              <section id="transparency" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-emerald-500" />
                  Data Handling & Transparency
                </h2>
                <div className="space-y-6 prose prose-slate dark:prose-invert max-w-none">
                  <p>
                    We believe in full transparency regarding how your data is handled. CloudGPT acts as a <strong>stateless router</strong>—we do not store your chat logs or generated content on our own servers. Instead, we propagate requests to specialized upstream providers.
                  </p>
                  
                  <h3 className="text-lg font-bold">How Routing Works</h3>
                  <p>
                    When you make a request, CloudGPT performs the following steps:
                  </p>
                  <ol>
                    <li><strong>Authentication:</strong> Verifies your API key or session.</li>
                    <li><strong>User Identification:</strong> Determines the user ID for storage isolation (see below).</li>
                    <li><strong>Provider Selection:</strong> Routes the request to providers like Pollinations, Routeway, or Meridian.</li>
                    <li><strong>Header Propagation:</strong> Passes custom headers to upstream providers so they can manage data isolation on their end.</li>
                  </ol>

                  <h3 className="text-lg font-bold">User Identification Chain</h3>
                  <p>
                    To ensure your users' data (like memory or images) is kept separate, we use a strict priority chain to identify the requester:
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border">
                    <ul className="list-none p-0 m-0 space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">1</span>
                        <span><strong>Client-Provided Header:</strong> If you pass an <code>x-user-id</code> header, it takes absolute priority.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold">2</span>
                        <span><strong>API Key Owner:</strong> If no header is present, the request is tied to the account that owns the API key.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold">3</span>
                        <span><strong>Session User:</strong> For website requests, we use the logged-in Clerk user.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-bold">4</span>
                        <span><strong>Anonymous IP:</strong> If all else fails, requests are tied to the requester's IP address.</span>
                      </li>
                    </ul>
                  </div>

                  <h3 className="text-lg font-bold">Where is data stored?</h3>
                  <p>
                    Data is stored at the <strong>edge provider</strong> level:
                  </p>
                  <ul>
                    <li><strong>Memory:</strong> Managed by Meridian Labs via Substrate. Your context is isolated by the user ID we provide.</li>
                    <li><strong>Images/Video:</strong> Cached by Pollinations or PolliStack for temporary retrieval.</li>
                    <li><strong>Logs:</strong> CloudGPT only logs metadata (request count, model used) for billing and rate-limiting purposes.</li>
                  </ul>
                </div>
              </section>

            </div>

            {/* Support Footer */}
            <div className="mt-24 pt-12 border-t text-center">
              <p className="text-slate-500 mb-6">Need more help? Join our community or contact support.</p>
              <div className="flex justify-center gap-4">
                <a href="https://github.com" className="px-6 py-2 rounded-lg bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors flex items-center gap-2">
                  GitHub Repository
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

function DocNavLink({ href, icon, label }: { href: string, icon: React.ReactNode, label: string }) {
  return (
    <a 
      href={href} 
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-primary transition-all group"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </a>
  );
}
