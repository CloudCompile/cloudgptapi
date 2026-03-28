import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, router, Link } from '@inertiajs/react';

export default function AdminPlans() {
  const { plans, errors } = usePage().props;
  const [form, setForm] = useState({
    name: '',
    slug: '',
    amount: 0,
    currency: 'usd',
    interval: 'month',
    description: '',
    daily_token_limit: 1000,
    is_active: true,
  });

  const submit = (e) => {
    e.preventDefault();
    router.post('/admin/plans', form);
  };

  const updatePlan = (plan) => {
    router.put(`/admin/plans/${plan.id}`, plan);
  };

  const deletePlan = (id) => {
    if (!confirm('Delete this plan?')) return;
    router.delete(`/admin/plans/${id}`);
  };

  return (
    <AppLayout>
      <Head title="Admin - Plans" />
      <div className="container my-5">
        <div className="mb-3">
          <Link href="/admin" className="btn btn-secondary btn-sm">← Back to Admin</Link>
        </div>

        <h1 className="mb-3">Plans</h1>
        <p className="text-muted">Manage subscription plans (Stripe price IDs required)</p>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Price</th>
                        <th>Daily Tokens</th>
                        <th>Interval</th>
                        <th>Active</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {plans.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <input className="form-control form-control-sm" defaultValue={p.name} onBlur={(e)=>updatePlan({...p, name:e.target.value})} />
                          </td>
                          <td>
                            <input className="form-control form-control-sm" defaultValue={p.slug} onBlur={(e)=>updatePlan({...p, slug:e.target.value})} />
                          </td>
                          <td>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text">$</span>
                              <input type="number" className="form-control" defaultValue={(p.amount/100).toFixed(2)} onBlur={(e)=>updatePlan({...p, amount: Math.round(parseFloat(e.target.value||'0')*100)})} />
                              <span className="input-group-text">{p.currency.toUpperCase()}</span>
                            </div>
                          </td>
                          <td>
                            <input type="number" className="form-control form-control-sm" defaultValue={p.daily_token_limit} onBlur={(e)=>updatePlan({...p, daily_token_limit: parseInt(e.target.value||'0')})} />
                          </td>
                          <td>
                            <select className="form-select form-select-sm" defaultValue={p.interval} onChange={(e)=>updatePlan({...p, interval:e.target.value})}>
                              <option value="month">monthly</option>
                              <option value="year">yearly</option>
                            </select>
                          </td>
                          <td>
                            <div className="form-check form-switch">
                              <input className="form-check-input" type="checkbox" defaultChecked={p.is_active} onChange={(e)=>updatePlan({...p, is_active:e.target.checked})} />
                            </div>
                          </td>
                          <td className="text-end">
                            <button className="btn btn-outline-danger btn-sm" onClick={()=>deletePlan(p.id)}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Add Plan</h5>
                {errors && Object.keys(errors).length > 0 && (
                  <div className="alert alert-danger mb-3">
                    {Object.values(errors)[0]}
                  </div>
                )}
                <form onSubmit={submit} id="planForm">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Slug</label>
                    <input className="form-control" value={form.slug} onChange={(e)=>setForm({...form,slug:e.target.value})} required />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label">Amount ($)</label>
                      <input type="number" step="0.01" className="form-control" value={form.amount/100} onChange={(e)=>setForm({...form,amount: Math.round(parseFloat(e.target.value||'0')*100)})} required />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Interval</label>
                      <select className="form-select" value={form.interval} onChange={(e)=>setForm({...form,interval:e.target.value})}>
                        <option value="month">monthly</option>
                        <option value="year">yearly</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Daily Token Limit</label>
                    <input type="number" className="form-control" value={form.daily_token_limit} onChange={(e)=>setForm({...form,daily_token_limit: parseInt(e.target.value||'0')})} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows="3" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />
                  </div>
                  <div className="form-check form-switch mb-3">
                    <input className="form-check-input" type="checkbox" id="activeCheck" checked={form.is_active} onChange={(e)=>setForm({...form,is_active:e.target.checked})} />
                    <label className="form-check-label" htmlFor="activeCheck">Active</label>
                  </div>
                </form>
                <button className="btn btn-primary btn-sm w-100" type="submit" form="planForm">Create Plan</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
