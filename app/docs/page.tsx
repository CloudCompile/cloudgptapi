import { ArrowRight, Bot, Code, Cpu, Download, ExternalLink, Hash, Image as ImageIcon, Info, MessageSquare, Shield, Terminal, Video, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Sidebar Navigation */}
          <aside className="lg:w-64 shrink-0 lg:sticky lg:top-24 h-fit">
            <nav className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-3">Getting Started</p>
              <DocNavLink href="#introduction" icon={<Info className="h-4 w-4" />} label="Introduction" />
              <DocNavLink href="#authentication" icon={<Shield className="h-4 w-4" />} label="Authentication" />
              <DocNavLink href="#base-url" icon={<Hash className="h-4 w-4" />} label="Base URL" />
              
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-8 mb-4 px-3">Endpoints</p>
              <DocNavLink href="#chat" icon={<MessageSquare className="h-4 w-4" />} label="Chat Completions" />
              <DocNavLink href="#image" icon={<ImageIcon className="h-4 w-4" />} label="Image Generation" />
              <DocNavLink href="#video" icon={<Video className="h-4 w-4" />} label="Video Generation" />
              <DocNavLink href="#memory" icon={<Bot className="h-4 w-4" />} label="Memory & Context" />
              
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-8 mb-4 px-3">Advanced</p>
              <DocNavLink href="#headers" icon={<Terminal className="h-4 w-4" />} label="Custom Headers" />
              <DocNavLink href="#error-handling" icon={<Zap className="h-4 w-4" />} label="Error Handling" />
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            <header className="mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Documentation</h1>
              <p className="text-xl text-slate-600 dark:text-slate-400">
                Everything you need to integrate CloudGPT into your applications.
              </p>
            </header>

            <div className="space-y-20">
              
              {/* Introduction */}
              <section id="introduction" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Info className="h-6 w-6 text-primary" />
                  Introduction
                </h2>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                  <p>
                    CloudGPT is a unified AI API gateway that allows you to access multiple top-tier AI providers through a single, consistent interface. We handle the complexity of different API formats, authentication methods, and rate limits so you can focus on building your application.
                  </p>
                </div>
              </section>

              {/* Authentication */}
              <section id="authentication" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="h-6 w-6 text-emerald-500" />
                  Authentication
                </h2>
                <p className="mb-6 text-slate-600 dark:text-slate-400">
                  All API requests require authentication using a Bearer token in the <code>Authorization</code> header. You can generate API keys from your <Link href="/dashboard" className="text-primary hover:underline">Dashboard</Link>.
                </p>
                <div className="rounded-xl bg-slate-950 p-6 font-mono text-sm text-slate-300 border border-slate-800 shadow-xl">
                  <span className="text-slate-500"># HTTP Header</span><br />
                  <span className="text-primary">Authorization</span>: Bearer <span className="text-amber-400">cgpt_your_api_key_here</span>
                </div>
              </section>

              {/* Base URL */}
              <section id="base-url" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Hash className="h-6 w-6 text-blue-500" />
                  Base URL
                </h2>
                <p className="mb-4 text-slate-600 dark:text-slate-400">All API endpoints are relative to the following base URL:</p>
                <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 font-mono text-primary text-lg border border-slate-200 dark:border-slate-800">
                  https://cloudgptapi.vercel.app
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
                    <code className="text-sm font-mono px-2">/api/chat</code>
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
                      <code>{`curl -X POST https://cloudgptapi.vercel.app/api/chat \\
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
                    Create high-quality images from text descriptions.
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border p-1 mb-6 flex items-center h-12 w-fit">
                    <span className="px-3 py-1 font-bold text-xs bg-blue-500 text-white rounded-lg mr-2">POST</span>
                    <code className="text-sm font-mono px-2">/api/image</code>
                  </div>
                  <h3 className="text-lg font-bold">Example Usage</h3>
                  <div className="rounded-xl bg-slate-950 p-6 shadow-2xl border border-slate-800 overflow-x-auto">
                    <pre className="text-sm font-mono text-slate-300">
                      <code>{`const response = await fetch('/api/image', {
  method: 'POST',
  body: JSON.stringify({
    prompt: "Cyberpunk city with neon lights",
    model: "flux"
  })
});

const blob = await response.blob();
const imageUrl = URL.createObjectURL(blob);`}</code>
                    </pre>
                  </div>
                </div>
              </section>

              {/* Memory API */}
              <section id="memory" className="scroll-mt-24">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Bot className="h-6 w-6 text-emerald-500" />
                  Memory & Context
                </h2>
                <div className="space-y-6">
                  <p className="text-slate-600 dark:text-slate-400">
                    Use our specialized Memory API to give your AI a persistent context. Powered by Meridian, this endpoint remembers previous interactions for a truly personalized experience.
                  </p>
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border p-1 mb-6 flex items-center h-12 w-fit">
                    <span className="px-3 py-1 font-bold text-xs bg-blue-500 text-white rounded-lg mr-2">POST</span>
                    <code className="text-sm font-mono px-2">/api/mem</code>
                  </div>
                  <p className="text-sm text-slate-500 bg-emerald-500/10 p-4 rounded-lg border border-emerald-500/20">
                    <strong>Note:</strong> User differentiation is automatic. Each user's memory is isolated based on their <code>x-user-id</code> or Clerk session.
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
