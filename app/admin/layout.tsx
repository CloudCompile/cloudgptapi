import { getCurrentUserId, getCurrentUser } from '@/lib/kinde-auth';
import { supabaseAdmin } from '@/lib/supabase';
import { AlertCircle, Shield, Users, Tag, Crown } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

// Force dynamic rendering to prevent prerendering errors with authentication
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getCurrentUserId();
  const user = await getCurrentUser();

  const renderAccessDenied = (email?: string) => (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30 mb-6 border border-red-200 dark:border-red-800/50">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>
      <h1 className="text-3xl font-bold mb-4 tracking-tight">Access Denied</h1>
      <p className="text-slate-600 dark:text-slate-400 text-center max-w-md">
        This area is restricted to administrators only. Your account ({email || 'Not signed in'}) does not have permission to view this page.
      </p>
      <Link 
        href="/"
        className="mt-8 px-6 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold rounded-xl hover:opacity-90 transition-all shadow-sm"
      >
        Return Home
      </Link>
    </div>
  );

  if (!userId) {
    // Redirect to login if not authenticated
    redirect('/api/auth/login?redirect=/admin');
  }

  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();

  const isAdmin = !error && profile?.role === 'admin';

  if (!isAdmin) {
    const userEmail = user?.email || 'Unknown user';
    return renderAccessDenied(userEmail);
  }

  const navItems = [
    { name: 'Overview', href: '/admin', icon: Shield },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Error Logs', href: '/admin/error-logs', icon: AlertCircle },
    { name: 'Promo Codes', href: '/admin/promo-codes', icon: Tag },
    { name: 'Plans', href: '/admin/plans', icon: Crown },
  ];

  return (
    <div className="w-full">
      {/* Admin Top Navigation Tabs */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-white/10 dark:border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto no-scrollbar items-center gap-1 sm:gap-2 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex flex-shrink-0 items-center px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
              >
                <item.icon className="h-4 w-4 mr-2 text-slate-400 group-hover:text-primary transition-colors" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
