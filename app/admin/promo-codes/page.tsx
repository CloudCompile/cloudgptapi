import { Tag, Plus, Trash2, Info, CheckCircle, Percent, DollarSign, Clock } from 'lucide-react';
import { supabaseAdmin } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

export default async function AdminPromoCodesPage() {
  
  const fetchPromoCodes = async () => {
    try {
      const { data, count, error } = await supabaseAdmin
        .from('promo_codes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { promoCodes: data || [], count: count || 0, dbReady: true };
    } catch (e) {
      console.warn('Error fetching promo codes. The promo_codes table might not exist yet.', e);
      return { promoCodes: [], count: 0, dbReady: false };
    }
  };

  const { promoCodes, dbReady } = await fetchPromoCodes();

  async function deletePromoCode(formData: FormData) {
    'use server';
    const id = formData.get('id') as string;
    if (!id) return;
    
    try {
      await supabaseAdmin.from('promo_codes').delete().eq('id', id);
    } catch (e) {
      console.error('Error deleting promo code', e);
    }
    revalidatePath('/admin/promo-codes');
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage promotional codes, discounts, and campaigns.
          </p>
        </div>
        <div>
          {dbReady && (
            <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
              <Plus className="h-4 w-4" /> Create Promo Code
            </button>
          )}
        </div>
      </div>

      {!dbReady && (
        <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300 flex items-start gap-4">
          <Info className="h-6 w-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-lg mb-1">Setup Needed</h3>
            <p className="text-sm">The <code>promo_codes</code> table in Supabase might not exist in your database schema yet. To use this feature natively, create a table with <code>code</code>, <code>discount_amount</code>, <code>discount_type</code> (percent/fixed), <code>usage_limit</code>, and <code>expires_at</code> columns.</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
            <Tag className="h-5 w-5" />
          </div>
          <h2 className="font-bold text-lg">Active Campaigns & Codes</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/80 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Code Name</th>
                <th className="px-6 py-4 font-semibold">Value</th>
                <th className="px-6 py-4 font-semibold">Usage</th>
                <th className="px-6 py-4 font-semibold">Expires</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {promoCodes.map((promo: any) => (
                <tr key={promo.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold font-mono tracking-widest text-primary text-sm bg-primary/10 px-2 py-1 rounded inline-block w-fit">
                        {promo.code}
                      </span>
                      {promo.description && <span className="text-xs text-slate-500 mt-1">{promo.description}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {promo.discount_type === 'percent' ? <Percent className="h-3.5 w-3.5" /> : <DollarSign className="h-3.5 w-3.5" />}
                      {promo.discount_amount}
                      {promo.discount_type === 'percent' ? '%' : ' OFF'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{promo.times_used || 0} used</span>
                      {promo.usage_limit && <span className="text-xs text-slate-500">Limit: {promo.usage_limit}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {promo.expires_at ? (
                      <span className={cn("text-sm flex items-center", new Date(promo.expires_at) < new Date() ? "text-red-500 font-bold" : "text-slate-600 dark:text-slate-400")}>
                        <Clock className="w-4 h-4 mr-1.5 opacity-70" />
                        {new Date(promo.expires_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-500">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <form action={deletePromoCode}>
                        <input type="hidden" name="id" value={promo.id} />
                        <button type="submit" className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
              
              {promoCodes.length === 0 && dbReady && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <Tag className="h-6 w-6 text-orange-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-900 dark:text-white mb-1">No promo codes</p>
                      <p className="text-sm">Create a new promo code to offer discounts to your users.</p>
                    </div>
                  </td>
                </tr>
              )}
              
              {promoCodes.length === 0 && !dbReady && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-800/20">
                    Database tables not configured, waiting for schema creation.
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
