'use client';

import React from 'react';
import Link from 'next/link';
import { Cloud, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  return (
    <Link 
      href="/" 
      className={cn(
        "group flex items-center gap-3 transition-all duration-300 hover:scale-[1.02]", 
        className
      )}
    >
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 shadow-2xl shadow-primary/20 overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Cloud className="relative h-6 w-6 text-primary group-hover:text-white transition-colors" />
        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 shadow-sm border border-white/10">
          <Zap className="h-2.5 w-2.5 text-secondary fill-secondary" />
        </div>
      </div>
      {!iconOnly && (
        <span className="text-2xl font-black tracking-tighter flex items-center">
          <span className="text-foreground">Cloud</span>
          <span className="premium-text ml-1">GPT</span>
        </span>
      )}
    </Link>
  );
}
