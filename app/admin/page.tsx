import { currentUser } from '@clerk/nextjs/server';
import { Shield, Users, CreditCard, Activity, Search, AlertCircle, Check, X, ArrowUpRight, Crown, Package } from 'lucide-react';
import { getAllUsers, promoteUser, assignPlan } from '@/lib/admin-actions';
import { supabaseAdmin } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export default async function AdminPage() {
  const user = await currentUser();

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user?.id || '')
    .single();

  const isAdmin = !!profile && profile.role === 'admin' && !error;

  if (!user || !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
          This area is restricted to administrators only. Your account ({user?.emailAddresses[0].emailAddress || 'Not signed in'}) does not have permission to view this page.
        </p>
        <a 
          href="/"
          className="mt-8 px-6 py-2 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-lg hover:opacity-90 transition-all"
        >
          Return Home
        </a>
      </div>
    );
  }

  const users = await getAllUsers();

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Managing CloudGPT platform users and subscriptions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total Users', value: users.length.toString(), icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Pro Users', value: users.filter(u => u.plan === 'pro').length.toString(), icon: Crown, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Admin Users', value: users.filter(u => u.role === 'admin').length.toString(), icon: Shield, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
          { label: 'System Health', value: '99.9%', icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
        ].map((stat) => (
          <div key={stat.label} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
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

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">User Management</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary w-64"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold">Stripe Product</th>
                <th className="px-6 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((userProfile) => (
                <tr key={userProfile.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold">
                        {userProfile.email?.[0].toUpperCase() || '?'}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{userProfile.email}</span>
                        <span className="text-xs text-slate-500 font-mono">{userProfile.id.substring(0, 8)}...</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium",
                      userProfile.role === 'admin' 
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" 
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      {userProfile.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-medium",
                      userProfile.plan === 'pro' 
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" 
                        : userProfile.plan === 'enterprise'
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      {userProfile.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">
                    {userProfile.stripe_product_id || 'None'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <form action={async () => {
                        'use server';
                        await promoteUser(userProfile.id, userProfile.role === 'admin' ? 'user' : 'admin');
                      }}>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all" title="Toggle Admin">
                          <Shield className="h-4 w-4" />
                        </button>
                      </form>
                      <form action={async () => {
                        'use server';
                        const isPro = userProfile.plan === 'pro';
                        await assignPlan(
                          userProfile.id, 
                          isPro ? 'free' : 'pro', 
                          isPro ? undefined : 'prod_TkaB1ApHkafWT1'
                        );
                      }}>
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all" title="Toggle Pro (Dev Package)">
                          <Package className={cn("h-4 w-4", userProfile.plan === 'pro' && "text-emerald-500")} />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No users found in the database. Users are added when they first log in.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
