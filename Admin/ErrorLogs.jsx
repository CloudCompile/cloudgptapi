import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, router, Link } from '@inertiajs/react';

export default function ErrorLogs() {
    const { errors, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [level, setLevel] = useState(filters?.level || '');

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/admin/error-logs', {
            search: search || undefined,
            level: level || undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearSearch = () => {
        setSearch('');
        setLevel('');
        router.get('/admin/error-logs', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const deleteError = (id) => {
        if (confirm('Are you sure you want to delete this error log?')) {
            router.delete(`/admin/error-logs/${id}`, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const clearOldLogs = (days = 7) => {
        if (confirm(`Delete error logs older than ${days} days?`)) {
            router.post('/admin/error-logs/clear', { days }, {
                preserveState: true,
                preserveScroll: true,
            });
        }
    };

    const getLevelBadgeColor = (level) => {
        switch (level) {
            case 'error':
                return 'bg-danger';
            case 'warning':
                return 'bg-warning';
            case 'info':
                return 'bg-info';
            default:
                return 'bg-secondary';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    return (
        <AppLayout>
            <Head title="Error Logs - Admin" />

            <div className="container my-5">
                <div className="row">
                    <div className="col-12">
                        <div className="mb-3">
                            <Link href="/admin" className="btn btn-secondary btn-sm">
                                ← Back to Admin
                            </Link>
                        </div>

                        <h1 className="mb-3">Error Logs</h1>
                        <p className="text-muted mb-4">View and manage application error logs</p>

                        <div className="card mb-4">
                            <div className="card-body">
                                <form onSubmit={handleSearch}>
                                    <div className="row g-3">
                                        <div className="col-md-3">
                                            <label className="form-label small">Level</label>
                                            <select
                                                className="form-select"
                                                value={level}
                                                onChange={(e) => setLevel(e.target.value)}
                                            >
                                                <option value="">All Levels</option>
                                                <option value="error">Error</option>
                                                <option value="warning">Warning</option>
                                                <option value="info">Info</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small">Search</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Search message, path, file..."
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label small">&nbsp;</label>
                                            <div className="d-flex gap-2">
                                                <button type="submit" className="btn btn-primary flex-grow-1">
                                                    Search
                                                </button>
                                                {(search || level) && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary"
                                                        onClick={clearSearch}
                                                    >
                                                        Clear
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {(search || level) && (
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                <span className="text-primary">{errors.total} result{errors.total !== 1 ? 's' : ''}</span>
                                            </small>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        <div className="card mb-4">
                            <div className="card-body">
                                <div className="btn-group mb-3" role="group">
                                    <button
                                        className="btn btn-sm btn-outline-warning"
                                        onClick={() => clearOldLogs(7)}
                                    >
                                        Clear 7+ days old
                                    </button>
                                    <button
                                        className="btn btn-sm btn-outline-warning"
                                        onClick={() => clearOldLogs(30)}
                                    >
                                        Clear 30+ days old
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Time</th>
                                                <th>Level</th>
                                                <th>User</th>
                                                <th>Message</th>
                                                <th>File</th>
                                                <th>Path</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {errors.data && errors.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan="7" className="text-center text-muted py-4">
                                                        No error logs found
                                                        {(search || level) && (
                                                            <>
                                                                {' for current filters - '}
                                                                <button
                                                                    className="btn btn-sm btn-link"
                                                                    onClick={clearSearch}
                                                                >
                                                                    Clear search
                                                                </button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ) : (
                                                errors.data?.map((error) => (
                                                    <tr key={error.id}>
                                                        <td className="small">{formatDate(error.created_at)}</td>
                                                        <td>
                                                            <span className={`badge ${getLevelBadgeColor(error.level)}`}>
                                                                {error.level.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {error.user ? (
                                                                <span>{error.user.name}</span>
                                                            ) : (
                                                                <span className="text-muted">System</span>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <code className="small text-truncate" style={{ maxWidth: '200px', display: 'inline-block' }}>
                                                                {error.message}
                                                            </code>
                                                        </td>
                                                        <td className="small text-muted text-truncate" style={{ maxWidth: '150px' }}>
                                                            {error.file?.split('\\').pop()}
                                                        </td>
                                                        <td className="small text-muted text-truncate" style={{ maxWidth: '150px' }}>
                                                            {error.path}
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <Link
                                                                    href={`/admin/error-logs/${error.id}`}
                                                                    className="btn btn-sm btn-outline-primary"
                                                                >
                                                                    View
                                                                </Link>
                                                                <button
                                                                    onClick={() => deleteError(error.id)}
                                                                    className="btn btn-sm btn-outline-danger"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {errors.links && (
                                    <nav className="mt-3">
                                        <ul className="pagination justify-content-center">
                                            {errors.links.map((link, index) => (
                                                <li
                                                    key={index}
                                                    className={`page-item ${link.active ? 'active' : ''} ${!link.url ? 'disabled' : ''}`}
                                                >
                                                    {link.url ? (
                                                        <button
                                                            className="page-link"
                                                            onClick={() => router.visit(link.url)}
                                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                                        />
                                                    ) : (
                                                        <span className="page-link" dangerouslySetInnerHTML={{ __html: link.label }} />
                                                    )}
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
