import { Shield, Ban, Trash2, Key, Activity, Clock, UserCircle, ChevronLeft } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { promoteUser, assignPlan } from '@/lib/admin-actions';
import { clerkClient } from '@clerk/nextjs/server';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminUserViewPage({
  params,
}: {
  params: { id: string };
}) {
  const userId = params.id;

  // Fetch Profile
  const { data: user, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !user) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">User not found</h1>
        <Link href="/admin/users" className="text-primary hover:underline">
          Return to Users List
        </Link>
      </div>
    );
  }

  // Fetch API Keys
  const { data: apiKeys } = await supabaseAdmin
    .from('api_keys')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  // Fetch API Requests
  const { data: usageLogs } = await supabaseAdmin
    .from('usage_logs')
    .select('id, model, tokens_used, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);

  const { count: totalUsage } = await supabaseAdmin
    .from('usage_logs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  // Sync Clerk Data for robust Ban / 2FA status handling
  let clerkUser;
  try {
    const client = await clerkClient();
    clerkUser = await client.users.getUser(userId);
  } catch (e) {
    console.error('Clerk user not found, might be deleted', e);
  }

  const isBanned = clerkUser?.banned || false;
  const twoFactorEnabled = clerkUser?.twoFactorEnabled || false;

  async function toggleBan() {
    'use server';
    if (!clerkUser) return;
    if (isBanned) {
      const client = await clerkClient();
      await client.users.unbanUser(userId);
    } else {
      const client = await clerkClient();
      await client.users.banUser(userId);
    }
    revalidatePath(`/admin/users/${userId}`);
  }

  async function deleteUserAction() {
    'use server';
    try {
      const client = await clerkClient();
      await client.users.deleteUser(userId);
      await supabaseAdmin.from('profiles').delete().eq('id', userId);
    } catch (e) {
      console.error('Failed to delete user:', e);
    }
    redirect('/admin/users');
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/admin/users" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Users
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-slate-100 dark:border-slate-800 shadow-sm">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <UserCircle className="h-10 w-10 text-slate-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {user.name || user.username || 'Unnamed User'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-mono mt-1 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {isBanned && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800">
              <Ban className="h-3.5 w-3.5 mr-1.5" /> Banned
            </span>
          )}
          <span className={cn(
            "inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border",
            user.role === 'admin' 
              ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800" 
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700"
          )}>
            <Shield className="h-3.5 w-3.5 mr-1.5" /> {user.role === 'admin' ? 'Administrator' : 'Standard User'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Profile info, Actions) */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold">Profile Details</h2>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Internal ID</span>
                <p className="font-mono text-sm mt-1 bg-slate-50 dark:bg-slate-800 p-2 rounded-lg break-all border border-slate-100 dark:border-slate-800">{user.id}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Joined</span>
                  <p className="text-sm font-medium mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">Subscription</span>
                  <p className="text-sm font-medium mt-1 capitalize">{user.plan || 'Free'}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 uppercase font-bold tracking-wider">2FA Status</span>
                  <p className={cn("text-sm font-medium mt-1", twoFactorEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-600 dark:text-slate-400")}>
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Zone */}
          <div className="bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-200 dark:border-orange-900/50 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-orange-200 dark:border-orange-900/50">
              <h2 className="font-bold text-orange-900 dark:text-orange-400 flex items-center">
                <Shield className="h-4 w-4 mr-2" /> Danger Zone Actions
              </h2>
            </div>
            <div className="p-5 space-y-3">
              <form action={async () => {
                'use server';
                await promoteUser(userId, user.role === 'admin' ? 'user' : 'admin');
              }}>
                <button className={cn("w-full py-2 px-4 rounded-lg text-sm font-bold border transition-colors", 
                  user.role === 'admin' 
                    ? "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/40 dark:text-orange-400 dark:border-orange-800/80 dark:hover:bg-orange-900/60"
                    : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/40 dark:text-purple-400 dark:border-purple-800/80 dark:hover:bg-purple-900/60"
                )}>
                  {user.role === 'admin' ? 'Revoke Admin Access' : 'Grant Admin Access'}
                </button>
              </form>

              <form action={toggleBan}>
                <button className={cn("w-full py-2 px-4 rounded-lg text-sm font-bold border transition-colors",
                  isBanned
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/40 dark:text-emerald-400 dark:border-emerald-800/80 dark:hover:bg-emerald-900/60"
                    : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/40 dark:text-red-400 dark:border-red-800/80 dark:hover:bg-red-900/60"
                )}>
                  {isBanned ? 'Unban User' : 'Ban User Account'}
                </button>
              </form>

              <form action={deleteUserAction}>
                <button className="w-full flex items-center justify-center py-2 px-4 rounded-lg text-sm font-bold bg-white text-red-600 border border-red-200 hover:bg-red-50 dark:bg-black dark:text-red-500 dark:border-red-900/50 dark:hover:bg-red-950/50 transition-colors">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Account Permanently
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column (API Keys, Usage) */}
        <div className="lg:col-span-2 space-y-8">
          {/* API Keys Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold flex items-center">
                <Key className="h-4 w-4 mr-2 text-primary" /> API Keys ({apiKeys?.length || 0})
              </h2>
            </div>
            <div className="overflow-x-auto">
              {apiKeys && apiKeys.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 font-semibold">Name</th>
                      <th className="px-5 py-3 font-semibold">Key Prefix</th>
                      <th className="px-5 py-3 font-semibold">Created</th>
                      <th className="px-5 py-3 font-semibold">Last Used</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-5 py-3 font-medium text-sm">{key.name || 'Unnamed Key'}</td>
                        <td className="px-5 py-3 font-mono text-xs text-slate-500">{key.key.substring(0, 8)}...</td>
                        <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">{new Date(key.created_at).toLocaleDateString()}</td>
                        <td className="px-5 py-3 text-sm text-slate-600 dark:text-slate-400">
                          {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  This user has not generated any API keys.
                </div>
              )}
            </div>
          </div>

          {/* API Requests Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="font-bold flex items-center">
                <Activity className="h-4 w-4 mr-2 text-emerald-500" /> Recent API Requests 
              </h2>
              <span className="text-sm text-slate-500 font-medium">Total Calls: {totalUsage || 0}</span>
            </div>
            <div className="overflow-x-auto">
              {usageLogs && usageLogs.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
                      <th className="px-5 py-3 font-semibold">Model</th>
                      <th className="px-5 py-3 font-semibold">Requests (RPD)</th>
                      <th className="px-5 py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {usageLogs.map((usage) => (
                      <tr key={usage.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-5 py-3 text-sm font-medium">{usage.model || 'Unknown Model'}</td>
                        <td className="px-5 py-3 text-sm font-mono text-emerald-600 dark:text-emerald-400">
                          {usage.tokens_used?.toLocaleString() || '0'}
                        </td>
                        <td className="px-5 py-3 text-sm flex items-center text-slate-600 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 mr-1.5 opacity-50" />
                          {new Date(usage.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No api usage recorded yet.
                </div>
              )}
            </div>
            {totalUsage && totalUsage > 10 && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 text-center border-t border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-500">Showing latest 10 of {totalUsage} entries</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
