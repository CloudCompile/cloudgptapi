import { AlertCircle, Trash2, Search, Filter, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminErrorLogsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = typeof searchParams.search === 'string' ? searchParams.search.toLowerCase() : '';
  const levelParam = typeof searchParams.level === 'string' ? searchParams.level : '';
  
  // Try to fetch from a hypothetical `error_logs` table. If it doesn't exist yet, we catch the error and show an empty state.
  const fetchLogs = async () => {
    try {
      let req = supabaseAdmin.from('error_logs').select('*', { count: 'exact' });
      
      if (levelParam) {
        req = req.eq('level', levelParam);
      }
      if (query) {
        req = req.or(`message.ilike.%${query}%,path.ilike.%${query}%`);
      }
      
      const { data, count, error } = await req.order('created_at', { ascending: false }).limit(50);
      
      if (error) throw error;
      return { logs: data || [], count: count || 0, dbReady: true };
    } catch (e) {
      console.warn('Error fetching logs. The error_logs table might not exist yet.', e);
      return { logs: [], count: 0, dbReady: false };
    }
  };

  const { logs, count, dbReady } = await fetchLogs();

  const getLevelStyles = (level: string) => {
    switch(level.toLowerCase()) {
      case 'error': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50';
      case 'warning': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50';
      case 'info': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700/50';
    }
  };

  const getLevelIcon = (level: string) => {
    switch(level.toLowerCase()) {
      case 'error': return <ShieldAlert className="h-4 w-4 mr-1 md:mr-2" />;
      case 'warning': return <AlertCircle className="h-4 w-4 mr-1 md:mr-2" />;
      case 'info': return <Info className="h-4 w-4 mr-1 md:mr-2" />;
      default: return <CheckCircle className="h-4 w-4 mr-1 md:mr-2" />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Error Logs</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            View, filter, and manage application errors.
          </p>
        </div>
        <div className="flex gap-2">
          {dbReady && count > 0 && (
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-red-600">
              <Trash2 className="h-4 w-4" /> Clear Old Logs (30d)
            </button>
          )}
        </div>
      </div>

      {!dbReady && (
        <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 flex items-start gap-4">
          <Info className="h-6 w-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg mb-1">Setup Needed</h3>
            <p className="text-sm">The <code>error_logs</code> table in Supabase might not exist yet. To enable full integration, please create this table containing columns for <code>level</code>, <code>message</code>, <code>path</code>, <code>user_id</code> (optional), and <code>created_at</code>.</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/30">
          <form method="GET" action="/admin/error-logs" className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                name="search"
                defaultValue={query}
                placeholder="Search error messages or file paths..." 
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex items-center w-full sm:w-auto gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select 
                name="level" 
                defaultValue={levelParam}
                className="w-full sm:w-auto px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="">All Levels</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
              <button type="submit" className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                Filter
              </button>
              {(query || levelParam) && (
                <Link href="/admin/error-logs" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white px-2">Clear</Link>
              )}
            </div>
          </form>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 dark:bg-slate-800/80 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold w-56">Timestamp</th>
                <th className="px-6 py-4 font-semibold w-32">Level</th>
                <th className="px-6 py-4 font-semibold">Message & Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4 text-xs font-mono text-slate-600 dark:text-slate-400 align-top pt-5">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 align-top">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                      getLevelStyles(log.level)
                    )}>
                      {getLevelIcon(log.level)}
                      {log.level.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium">{log.message}</p>
                      {log.path && (
                        <p className="text-xs font-mono bg-slate-100 dark:bg-slate-800/50 text-slate-500 p-2 rounded-md border border-slate-200 dark:border-slate-800 inline-block w-fit max-w-full break-all">
                          {log.path}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <CheckCircle className="h-6 w-6 text-emerald-500" />
                      </div>
                      <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">System healthy</p>
                      <p className="text-sm">No error logs found matching your criteria.</p>
                    </div>
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
