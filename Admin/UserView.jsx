import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, router, Link } from '@inertiajs/react';

export default function AdminUserView() {
    const { user } = usePage().props;
    const [deleting, setDeleting] = useState(false);
    const [toggling, setToggling] = useState(false);
    const [banning, setBanning] = useState(false);
    const [showBanModal, setShowBanModal] = useState(false);
    const [banReason, setBanReason] = useState(user.ban_reason || '');
    const [banDuration, setBanDuration] = useState('permanent');

    const toggleAdmin = () => {
        if (toggling) return;
        
        setToggling(true);
        router.post(`/admin/users/${user.id}/toggle-admin`, {}, {
            preserveScroll: true,
            onFinish: () => setToggling(false),
        });
    };

    const handleBanClick = () => {
        if (user.banned_at) {
            // If already banned, unban directly
            toggleBan();
        } else {
            // If not banned, show modal to get reason
            setShowBanModal(true);
        }
    };

    const toggleBan = (reason = '', duration = 'permanent') => {
        if (banning) return;
        
        setBanning(true);
        router.post(`/admin/users/${user.id}/toggle-ban`, { 
            ban_reason: reason,
            ban_duration: duration 
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setShowBanModal(false);
                setBanReason('');
                setBanDuration('permanent');
            },
            onFinish: () => setBanning(false),
        });
    };

    const submitBan = (e) => {
        e.preventDefault();
        toggleBan(banReason, banDuration);
    };

    const deleteUser = () => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        
        setDeleting(true);
        router.delete(`/admin/users/${user.id}`, {
            onSuccess: () => {
                router.visit('/admin/users');
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <AppLayout>
            <Head title={`Admin - ${user.name}`} />
            <div className="container my-5">
                <div className="row">
                    <div className="col-12">
                        <div className="mb-3">
                            <Link href="/admin/users" className="btn btn-secondary btn-sm">
                                ← Back to Users
                            </Link>
                        </div>
                        
                        <h1 className="mb-4">User Details</h1>

                        <div className="row">
                            <div className="col-md-8">
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <h5 className="mb-0">Profile Information</h5>
                                    </div>
                                    <div className="card-body">
                                        <dl className="row mb-0">
                                            <dt className="col-sm-3">Name</dt>
                                            <dd className="col-sm-9">{user.name}</dd>

                                            <dt className="col-sm-3">Email</dt>
                                            <dd className="col-sm-9">{user.email}</dd>

                                            <dt className="col-sm-3">Internal ID (IID)</dt>
                                            <dd className="col-sm-9"><code>{user.iid}</code></dd>

                                            <dt className="col-sm-3">Admin Status</dt>
                                            <dd className="col-sm-9">
                                                <span className={`badge ${user.is_admin ? 'bg-success' : 'bg-secondary'}`}>
                                                    {user.is_admin ? 'Administrator' : 'Regular User'}
                                                </span>
                                            </dd>

                                            <dt className="col-sm-3">Ban Status</dt>
                                            <dd className="col-sm-9">
                                                <span className={`badge ${user.banned_at ? 'bg-danger' : 'bg-success'}`}>
                                                    {user.banned_at ? 'Banned' : 'Active'}
                                                </span>
                                                {user.banned_at && (
                                                    <>
                                                        <small className="text-muted ms-2">
                                                            Since {new Date(user.banned_at).toLocaleDateString()}
                                                        </small>
                                                        {user.ban_expires_at && (
                                                            <div className="mt-1">
                                                                <small className="text-muted">
                                                                    Expires: {new Date(user.ban_expires_at).toLocaleDateString()}
                                                                </small>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </dd>

                                            <dt className="col-sm-3">Two-Factor Auth</dt>
                                            <dd className="col-sm-9">
                                                <span className={`badge ${user.two_factor_confirmed_at ? 'bg-success' : 'bg-secondary'}`}>
                                                    {user.two_factor_confirmed_at ? 'Enabled' : 'Disabled'}
                                                </span>
                                                {user.two_factor_confirmed_at && (
                                                    <small className="text-muted ms-2">
                                                        Since {new Date(user.two_factor_confirmed_at).toLocaleDateString()}
                                                    </small>
                                                )}
                                            </dd>

                                            <dt className="col-sm-3">Joined</dt>
                                            <dd className="col-sm-9">
                                                {user.created_at 
                                                    ? new Date(user.created_at).toLocaleString()
                                                    : 'N/A'}
                                            </dd>

                                            <dt className="col-sm-3">Last Updated</dt>
                                            <dd className="col-sm-9 mb-0">
                                                {user.updated_at 
                                                    ? new Date(user.updated_at).toLocaleString()
                                                    : 'N/A'}
                                            </dd>
                                        </dl>
                                    </div>
                                </div>

                                <div className="card mb-4">
                                    <div className="card-header">
                                        <h5 className="mb-0">API Keys</h5>
                                    </div>
                                    <div className="card-body">
                                        {user.api_keys_count > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-sm mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Name</th>
                                                            <th>Created</th>
                                                            <th>Last Used</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {user.api_keys.map((key) => (
                                                            <tr key={key.id}>
                                                                <td>{key.name || 'Unnamed'}</td>
                                                                <td className="small">
                                                                    {key.created_at 
                                                                        ? new Date(key.created_at).toLocaleDateString()
                                                                        : 'N/A'}
                                                                </td>
                                                                <td className="small">
                                                                    {key.last_used_at 
                                                                        ? new Date(key.last_used_at).toLocaleDateString()
                                                                        : 'Never'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-muted mb-0">No API keys</p>
                                        )}
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="mb-0">Token Usage Statistics</h5>
                                    </div>
                                    <div className="card-body">
                                        <p className="mb-2">
                                            <strong>Total Entries:</strong> {user.token_usage_count}
                                        </p>
                                        {user.token_usage && user.token_usage.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-sm mb-0">
                                                    <thead>
                                                        <tr>
                                                            <th>Model</th>
                                                            <th>Tokens</th>
                                                            <th>Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {user.token_usage.slice(0, 10).map((usage) => (
                                                            <tr key={usage.id}>
                                                                <td className="small">{usage.model || 'N/A'}</td>
                                                                <td>{usage.tokens_used ? usage.tokens_used.toLocaleString() : '0'}</td>
                                                                <td className="small">
                                                                    {usage.created_at 
                                                                        ? new Date(usage.created_at).toLocaleDateString()
                                                                        : 'N/A'}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                                {user.token_usage_count > 10 && (
                                                    <p className="text-muted small mt-2 mb-0">
                                                        Showing 10 of {user.token_usage_count} entries
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <p className="text-muted mb-0">No token usage recorded</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="card border-warning mb-3">
                                    <div className="card-header bg-warning text-dark">
                                        <h5 className="mb-0">Actions</h5>
                                    </div>
                                    <div className="card-body">
                                        <button
                                            className={`btn ${user.is_admin ? 'btn-outline-warning' : 'btn-outline-success'} w-100 mb-3`}
                                            onClick={toggleAdmin}
                                            disabled={toggling}
                                        >
                                            {toggling ? 'Processing...' : user.is_admin ? 'Remove Admin Access' : 'Grant Admin Access'}
                                        </button>

                                        <button
                                            className={`btn ${user.banned_at ? 'btn-outline-success' : 'btn-outline-danger'} w-100 mb-3`}
                                            onClick={handleBanClick}
                                            disabled={banning}
                                        >
                                            {banning ? 'Processing...' : user.banned_at ? 'Unban User' : 'Ban User'}
                                        </button>

                                        <button
                                            className="btn btn-outline-danger w-100"
                                            onClick={deleteUser}
                                            disabled={deleting}
                                        >
                                            {deleting ? 'Deleting...' : 'Delete User'}
                                        </button>

                                        <div className="alert alert-warning mt-3 mb-0">
                                            <small>
                                                <strong>Warning:</strong> Deleting this user will permanently remove all their data, API keys, and usage history.
                                            </small>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="mb-0">Quick Stats</h5>
                                    </div>
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>API Keys:</span>
                                            <strong>{user.api_keys_count}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span>Token Usage:</span>
                                            <strong>{user.token_usage_count}</strong>
                                        </div>
                                        <div className="d-flex justify-content-between mb-0">
                                            <span>Account Age:</span>
                                            <strong>
                                                {user.created_at 
                                                    ? Math.floor((Date.now() - new Date(user.created_at)) / (1000 * 60 * 60 * 24))
                                                    : 0} days
                                            </strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ban Modal */}
            {showBanModal && (
                <div 
                    className="modal d-block" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setShowBanModal(false)}
                >
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">Ban User</h5>
                                <button 
                                    type="button" 
                                    className="btn-close btn-close-white"
                                    onClick={() => setShowBanModal(false)}
                                />
                            </div>
                            <form onSubmit={submitBan}>
                                <div className="modal-body">
                                    <p>You are about to ban <strong>{user.name}</strong></p>
                                    
                                    <div className="mb-3">
                                        <label className="form-label">Ban Duration</label>
                                        <select
                                            className="form-select"
                                            value={banDuration}
                                            onChange={(e) => setBanDuration(e.target.value)}
                                        >
                                            <option value="permanent">Permanent</option>
                                            <option value="7">7 Days</option>
                                            <option value="30">30 Days</option>
                                            <option value="90">90 Days</option>
                                        </select>
                                        <small className="text-muted">
                                            The user will be able to access the account after the duration expires.
                                        </small>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Ban Reason (Optional)</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={banReason}
                                            onChange={(e) => setBanReason(e.target.value)}
                                            placeholder="Enter the reason for banning this user..."
                                        />
                                        <small className="text-muted">
                                            This will be shown to the user when they try to access the site.
                                        </small>
                                    </div>

                                    <div className="alert alert-warning">
                                        <small>
                                            The user will not be able to log in or use the API after being banned.
                                        </small>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => setShowBanModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-danger"
                                        disabled={banning}
                                    >
                                        {banning ? 'Banning...' : 'Ban User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
