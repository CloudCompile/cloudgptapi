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
        "group flex items-center gap-3 transition-all duration-300 hover:scale-105", 
        className
      )}
    >
      <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20 overflow-hidden">
        <div className="absolute inset-0 premium-gradient opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 shimmer opacity-30" />
        <Cloud className="relative h-6 w-6 text-white" />
        <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white dark:bg-slate-900 shadow-sm border border-border/50">
          <Zap className="h-2.5 w-2.5 text-primary fill-primary" />
        </div>
      </div>
      {!iconOnly && (
        <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
          Cloud<span className="premium-text">GPT</span>
        </span>
      )}
    </Link>
  );
}
