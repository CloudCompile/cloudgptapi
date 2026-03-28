import { Shield, Users, Activity, Crown, AlertCircle, Tag, ArrowRight } from 'lucide-react';
import { getAllUsers } from '@/lib/admin-actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Force dynamic rendering to prevent prerendering errors with authentication
export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const users = await getAllUsers();

  const quickLinks = [
    { name: 'User Management', desc: 'Manage accounts, roles & permissions', href: '/admin/users', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { name: 'Error Logs', desc: 'View system errors and debugging logs', href: '/admin/error-logs', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { name: 'Plans & Features', desc: 'Configure subscription tiers & limits', href: '/admin/plans', icon: Crown, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { name: 'Promo Codes', desc: 'Create and distribute discount codes', href: '/admin/promo-codes', icon: Tag, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Admin Overview
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            System status, metrics, and quick access to management modules.
          </p>
        </div>
      </div>

      {/* High-Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Pro Users', value: users.filter(u => u.plan === 'pro').length.toString(), icon: Crown, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Admin Users', value: users.filter(u => u.role === 'admin').length.toString(), icon: Shield, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'System Health', value: '99.9%', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-2.5 rounded-xl", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </div>
              <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                Live <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold tracking-tight mb-6">Management Modules</h2>
      
      {/* Quick Links Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickLinks.map((link) => (
          <Link 
            key={link.name} 
            href={link.href}
            className="group p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:border-primary/50 hover:shadow-md transition-all flex items-start justify-between"
          >
            <div className="flex items-start gap-4">
              <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", link.bg)}>
                <link.icon className={cn("h-6 w-6", link.color)} />
              </div>
              <div>
                <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{link.name}</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{link.desc}</p>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
