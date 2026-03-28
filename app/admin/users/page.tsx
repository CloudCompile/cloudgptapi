import { Shield, Search, Package, Crown, ChevronLeft, ChevronRight, UserCircle } from 'lucide-react';
import { getAllUsers, promoteUser, assignPlan } from '@/lib/admin-actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = typeof searchParams.search === 'string' ? searchParams.search.toLowerCase() : '';
  const sort = typeof searchParams.sort === 'string' ? searchParams.sort : 'created_at';
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const perPage = 20;

  let users = await getAllUsers();

  // Search
  if (query) {
    users = users.filter((user) => 
      (user.name?.toLowerCase().includes(query)) ||
      (user.email?.toLowerCase().includes(query)) ||
      (user.id?.toLowerCase().includes(query))
    );
  }

  // Sort
  users.sort((a, b) => {
    if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sort === 'email') return (a.email || '').localeCompare(b.email || '');
    if (sort === 'role') return (a.role || '').localeCompare(b.role || '');
    // default created_at desc (already sorted by getAllUsers from DB)
    return 0;
  });

  // Pagination
  const totalUsers = users.length;
  const totalPages = Math.ceil(totalUsers / perPage);
  const paginatedUsers = users.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage user accounts, permissions, and roles ({totalUsers} total)
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <form method="GET" action="/admin/users" className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              name="search"
              defaultValue={query}
              placeholder="Search by name, email, or ID..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
            {query && (
              <Link href="/admin/users" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600">
                Clear
              </Link>
            )}
          </form>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span>Sort by:</span>
            <Link href={`/admin/users?search=${query}&sort=created_at`} className={cn("px-2 py-1 rounded", sort === 'created_at' && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white")}>Date</Link>
            <Link href={`/admin/users?search=${query}&sort=name`} className={cn("px-2 py-1 rounded", sort === 'name' && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white")}>Name</Link>
            <Link href={`/admin/users?search=${query}&sort=email`} className={cn("px-2 py-1 rounded", sort === 'email' && "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white")}>Email</Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Plan</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {paginatedUsers.map((userProfile) => (
                <tr key={userProfile.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-700 flex flex-shrink-0 items-center justify-center text-sm font-bold overflow-hidden">
                        {userProfile.avatar ? (
                          <img src={userProfile.avatar} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <UserCircle className="h-6 w-6 text-slate-400" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <Link href={`/admin/users/${userProfile.id}`} className="text-sm font-medium hover:text-primary transition-colors">
                          {userProfile.name || userProfile.username || 'Unnamed User'}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-500">{userProfile.email}</span>
                          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{userProfile.id.substring(0, 8)}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border",
                      userProfile.role === 'admin' 
                        ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/50" 
                        : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50"
                    )}>
                      {userProfile.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border",
                      userProfile.plan === 'pro' 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50" 
                        : userProfile.plan === 'developer' || userProfile.plan === 'enterprise'
                        ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50"
                        : "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50"
                    )}>
                      {userProfile.plan || 'free'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <form action={async () => {
                        'use server';
                        await promoteUser(userProfile.id, userProfile.role === 'admin' ? 'user' : 'admin');
                      }}>
                        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700" title="Toggle Admin">
                          <Shield className="h-4 w-4" />
                        </button>
                      </form>
                      <form action={async () => {
                        'use server';
                        const isPro = userProfile.plan === 'pro';
                        await assignPlan(
                          userProfile.id, 
                          isPro ? 'free' : 'pro', 
                          isPro ? undefined : 'prod_pro_dummy'
                        );
                      }}>
                        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700" title="Toggle Pro Status">
                          <Package className={cn("h-4 w-4", userProfile.plan === 'pro' && "text-emerald-500")} />
                        </button>
                      </form>
                      <Link 
                        href={`/admin/users/${userProfile.id}`}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No users found matching your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Details */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing {(page - 1) * perPage + 1} to {Math.min(page * perPage, totalUsers)} of {totalUsers} users
            </span>
            <div className="flex items-center gap-2">
              <Link 
                href={`/admin/users?page=${Math.max(page - 1, 1)}${query ? `&search=${query}` : ''}${sort ? `&sort=${sort}` : ''}`}
                className={cn("p-2 rounded-lg border border-slate-200 dark:border-slate-800", page <= 1 ? "opacity-50 pointer-events-none" : "hover:bg-slate-50 dark:hover:bg-slate-800")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <Link 
                href={`/admin/users?page=${Math.min(page + 1, totalPages)}${query ? `&search=${query}` : ''}${sort ? `&sort=${sort}` : ''}`}
                className={cn("p-2 rounded-lg border border-slate-200 dark:border-slate-800", page >= totalPages ? "opacity-50 pointer-events-none" : "hover:bg-slate-50 dark:hover:bg-slate-800")}
              >
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
