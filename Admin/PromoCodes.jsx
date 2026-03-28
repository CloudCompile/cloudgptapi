import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, router, Link } from '@inertiajs/react';

export default function AdminPromoCodes() {
  const { promoCodes, errors } = usePage().props;
  const [form, setForm] = useState({
    code: '',
    description: '',
    discount_percent: '',
    discount_amount_cents: '',
    max_uses: '',
    duration_in_months: 12,
    expires_at: '',
    is_active: true,
  });

  const [editingId, setEditingId] = useState(null);

  const submit = (e) => {
    e.preventDefault();
    if (editingId) {
      router.put(`/admin/promo-codes/${editingId}`, form);
    } else {
      router.post('/admin/promo-codes', form);
    }
    resetForm();
  };

  const editPromoCode = (promoCode) => {
    setEditingId(promoCode.id);
    setForm({
      code: promoCode.code,
      description: promoCode.description || '',
      discount_percent: promoCode.discount_percent || '',
      discount_amount_cents: promoCode.discount_amount_cents || '',
      max_uses: promoCode.max_uses || '',
      duration_in_months: promoCode.duration_in_months || 12,
      expires_at: promoCode.expires_at ? promoCode.expires_at.split('T')[0] : '',
      is_active: promoCode.is_active,
    });
  };

  const deletePromoCode = (id) => {
    if (!confirm('Delete this promo code?')) return;
    router.delete(`/admin/promo-codes/${id}`);
  };

  const resetForm = () => {
    setForm({
      code: '',
      description: '',
      discount_percent: '',
      discount_amount_cents: '',
      max_uses: '',
      duration_in_months: 12,
      expires_at: '',
      is_active: true,
    });
    setEditingId(null);
  };

  return (
    <AppLayout>
      <Head title="Admin - Promo Codes" />
      <div className="container my-5">
        <div className="mb-3">
          <Link href="/admin" className="btn btn-secondary btn-sm">← Back to Admin</Link>
        </div>

        <h1 className="mb-3">Promo Codes</h1>
        <p className="text-muted">Manage promotional codes for discounts</p>

        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card">
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Uses</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {promoCodes.map((promo) => (
                        <tr key={promo.id}>
                          <td>
                            <code className="text-success fw-bold">{promo.code}</code>
                          </td>
                          <td>
                            <small className="text-muted">
                              {promo.discount_percent ? `${promo.discount_percent}%` : `$${(promo.discount_amount_cents / 100).toFixed(2)}`}
                            </small>
                          </td>
                          <td>
                            <small>
                              {promo.used_count}{promo.max_uses ? `/${promo.max_uses}` : ''}
                            </small>
                          </td>
                          <td>
                            {promo.is_active ? (
                              <span className="badge bg-success">Active</span>
                            ) : (
                              <span className="badge bg-secondary">Inactive</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => editPromoCode(promo)}
                            >
                              Edit
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deletePromoCode(promo.id)}
                            >
                              Delete
                            </button>
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
              <div className="card-header">
                <h5 className="mb-0">
                  {editingId ? 'Edit Promo Code' : 'Create Promo Code'}
                </h5>
              </div>
              <div className="card-body">
                {Object.keys(errors).length > 0 && (
                  <div className="alert alert-danger mb-3">
                    {Object.values(errors)[0]}
                  </div>
                )}

                <form onSubmit={submit}>
                  <div className="mb-3">
                    <label className="form-label">Code *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value })}
                      placeholder="e.g., SUMMER20"
                    />
                    <small className="text-muted d-block mt-1">
                      Will be synced to Stripe automatically
                    </small>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      placeholder="e.g., Summer sale discount"
                    />
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <div className="mb-3">
                        <label className="form-label">Discount %</label>
                        <input
                          type="number"
                          className="form-control"
                          value={form.discount_percent}
                          onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
                          min="0"
                          max="100"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <label className="form-label">Discount Amount ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={form.discount_amount_cents ? (form.discount_amount_cents / 100).toFixed(2) : ''}
                          onChange={(e) => setForm({ ...form, discount_amount_cents: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : '' })}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-6">
                      <div className="mb-3">
                        <label className="form-label">Max Uses</label>
                        <input
                          type="number"
                          className="form-control"
                          value={form.max_uses}
                          onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                          min="1"
                          placeholder="Unlimited"
                        />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="mb-3">
                        <label className="form-label">Duration (Months) *</label>
                        <select
                          className="form-select"
                          value={form.duration_in_months}
                          onChange={(e) => setForm({ ...form, duration_in_months: parseInt(e.target.value) })}
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                            <option key={month} value={month}>
                              {month} month{month > 1 ? 's' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label">Expires At</label>
                        <input
                          type="date"
                          className="form-control"
                          value={form.expires_at}
                          onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isActive"
                        checked={form.is_active}
                        onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="isActive">
                        Active
                      </label>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="submit" className="btn btn-primary">
                      {editingId ? 'Update Promo Code' : 'Create Promo Code'}
                    </button>
                    {editingId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={resetForm}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
