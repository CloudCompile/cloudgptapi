import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, router, Link } from '@inertiajs/react';

export default function AdminUsers() {
    const { users, filters } = usePage().props;
    const [search, setSearch] = useState(filters?.search || '');
    const [searchMode, setSearchMode] = useState(filters?.search_mode || 'name');
    const [sortBy, setSortBy] = useState(filters?.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters?.sort_dir || 'desc');

    useEffect(() => {
        setSearch(filters?.search || '');
        setSearchMode(filters?.search_mode || 'name');
        setSortBy(filters?.sort_by || 'created_at');
        setSortDir(filters?.sort_dir || 'desc');
    }, [filters]);

    const handleSearch = (e) => {
        e.preventDefault();
        performSearch();
    };

    const performSearch = () => {
        router.get('/admin/users', {
            search: search || undefined,
            search_mode: searchMode,
            sort_by: sortBy,
            sort_dir: sortDir,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearSearch = () => {
        setSearch('');
        router.get('/admin/users', {
            search_mode: searchMode,
            sort_by: sortBy,
            sort_dir: sortDir,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSort = (column) => {
        const newSortDir = sortBy === column && sortDir === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortDir(newSortDir);
        router.get('/admin/users', {
            search: search || undefined,
            search_mode: searchMode,
            sort_by: column,
            sort_dir: newSortDir,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const SortIcon = ({ column }) => {
        if (sortBy !== column) return <span className="text-muted ms-1">⇅</span>;
        return sortDir === 'asc' ? <span className="ms-1">↑</span> : <span className="ms-1">↓</span>;
    };

    return (
        <AppLayout>
            <Head title="Admin - Users" />
            <div className="container my-5">
                <div className="row">
                    <div className="col-12">
                        <div className="mb-3">
                            <Link href="/admin" className="btn btn-secondary btn-sm">
                                ← Back to Admin
                            </Link>
                        </div>
                        
                        <h1 className="mb-3">Users Management</h1>
                        <p className="text-muted mb-4">Manage user accounts and permissions</p>

                        <div className="card mb-4">
                            <div className="card-body">
                                <form onSubmit={handleSearch}>
                                    <div className="row g-3">
                                        <div className="col-md-3">
                                            <label className="form-label small">Search Mode</label>
                                            <select
                                                className="form-select"
                                                value={searchMode}
                                                onChange={(e) => setSearchMode(e.target.value)}
                                            >
                                                <option value="name">Name</option>
                                                <option value="email">Email</option>
                                                <option value="iid">IID</option>
                                                <option value="id">User ID</option>
                                                <option value="admin">Admin Status</option>
                                                <option value="2fa">2FA Status</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small">Search Query</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder={
                                                    searchMode === 'admin' || searchMode === '2fa'
                                                        ? 'yes/no or true/false'
                                                        : `Search by ${searchMode}...`
                                                }
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <label className="form-label small">&nbsp;</label>
                                            <div className="d-flex gap-2">
                                                <button type="submit" className="btn btn-primary flex-grow-1">
                                                    Search
                                                </button>
                                                {search && (
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
                                    {search && (
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                Searching for <strong>{search}</strong> in <strong>{searchMode}</strong>
                                                {' - '}
                                                <span className="text-primary">{users.total} result{users.total !== 1 ? 's' : ''}</span>
                                            </small>
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-body">
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>
                                                    <button
                                                        className="btn btn-link p-0 text-decoration-none text-dark"
                                                        onClick={() => handleSort('name')}
                                                    >
                                                        Name<SortIcon column="name" />
                                                    </button>
                                                </th>
                                                <th>
                                                    <button
                                                        className="btn btn-link p-0 text-decoration-none text-dark"
                                                        onClick={() => handleSort('email')}
                                                    >
                                                        Email<SortIcon column="email" />
                                                    </button>
                                                </th>
                                                <th>
                                                    <button
                                                        className="btn btn-link p-0 text-decoration-none text-dark"
                                                        onClick={() => handleSort('iid')}
                                                    >
                                                        IID<SortIcon column="iid" />
                                                    </button>
                                                </th>
                                                <th>
                                                    <button
                                                        className="btn btn-link p-0 text-decoration-none text-dark"
                                                        onClick={() => handleSort('is_admin')}
                                                    >
                                                        Admin<SortIcon column="is_admin" />
                                                    </button>
                                                </th>
                                                <th>2FA</th>
                                                <th>API Keys</th>
                                                <th>Token Usage</th>
                                                <th>
                                                    <button
                                                        className="btn btn-link p-0 text-decoration-none text-dark"
                                                        onClick={() => handleSort('created_at')}
                                                    >
                                                        Joined<SortIcon column="created_at" />
                                                    </button>
                                                </th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.data.length === 0 ? (
                                                <tr>
                                                    <td colSpan="9" className="text-center text-muted py-4">
                                                        No users found
                                                        {search && (
                                                            <>
                                                                {' for '}
                                                                <strong>{search}</strong>
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
                                                users.data.map((user) => (
                                                <tr key={user.id}>
                                                    <td>{user.name}</td>
                                                    <td>{user.email}</td>
                                                    <td><code className="small">{user.iid}</code></td>
                                                    <td>
                                                        <span className={`badge ${user.is_admin ? 'bg-success' : 'bg-secondary'}`}>
                                                            {user.is_admin ? 'Yes' : 'No'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${user.two_factor_confirmed_at ? 'bg-success' : 'bg-secondary'}`}>
                                                            {user.two_factor_confirmed_at ? 'Enabled' : 'Disabled'}
                                                        </span>
                                                    </td>
                                                    <td>{user.api_keys_count}</td>
                                                    <td>{user.token_usage_count}</td>
                                                    <td className="small">{new Date(user.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <Link
                                                            href={`/admin/users/${user.id}`}
                                                            className="btn btn-sm btn-outline-primary"
                                                        >
                                                            View
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {users.links && (
                                    <nav className="mt-3">
                                        <ul className="pagination justify-content-center">
                                            {users.links.map((link, index) => (
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
