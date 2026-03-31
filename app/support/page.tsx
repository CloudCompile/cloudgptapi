'use client';

import { MessageCircle, Book, Mail, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const supportOptions = [
  {
    title: 'Join Our Discord',
    description: 'Connect with our community, get help from other developers, and chat with the team.',
    icon: MessageCircle,
    href: 'https://discord.gg/f7xR8qga',
    cta: 'Join Discord',
  },
  {
    title: 'Documentation',
    description: 'Browse our API docs, guides, and tutorials to get started with Vetra.',
    icon: Book,
    href: '/docs',
    cta: 'View Docs',
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 relative overflow-hidden">
      <div className="fixed inset-0 mesh-gradient opacity-60 dark:opacity-40" />
      <div className="fixed inset-0 dot-grid opacity-30" />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12 sm:mb-16 text-center">
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            Support
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-medium max-w-2xl mx-auto">
            Get help with Vetra. Choose your preferred way to reach out.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {supportOptions.map((option) => (
            <a
              key={option.title}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group p-8 sm:p-10 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border-2 border-white/20 dark:border-slate-800/50 hover:border-primary/30 transition-all duration-500"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <option.icon className="h-7 w-7 text-primary" />
                </div>
                <ExternalLink className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                {option.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-medium mb-6">
                {option.description}
              </p>
              <div className="inline-flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                {option.cta}
                <ExternalLink className="h-4 w-4" />
              </div>
            </a>
          ))}
        </div>

        <div className="mt-16 text-center p-8 rounded-3xl bg-white/40 dark:bg-slate-900/40 border border-border">
          <p className="text-slate-600 dark:text-slate-400 font-medium">
            Can&apos;t find what you&apos;re looking for?{' '}
            <a 
              href="https://discord.gg/f7xR8qga" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary font-bold hover:underline"
            >
              Join our Discord
            </a>
            {' '}and ask the community!
          </p>
        </div>
      </div>
    </div>
  );
}