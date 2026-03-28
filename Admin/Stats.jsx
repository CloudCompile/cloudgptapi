import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, usePage, Link } from '@inertiajs/react';

export default function AdminStats() {
    const { stats } = usePage().props;

    return (
        <AppLayout>
            <Head title="Admin - Statistics" />
            <div className="container my-5">
                <div className="row">
                    <div className="col-lg-10 mx-auto">
                        <div className="mb-3">
                            <Link href="/admin" className="btn btn-secondary btn-sm">
                                ← Back to Admin
                            </Link>
                        </div>
                        
                        <h1 className="mb-3">Statistics</h1>
                        <p className="text-muted mb-4">System and usage statistics</p>

                        <div className="row g-4">
                            <div className="col-md-3">
                                <div className="card">
                                    <div className="card-body">
                                        <h6 className="card-title text-muted">Total Users</h6>
                                        <h2>{stats.total_users}</h2>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-3">
                                <div className="card">
                                    <div className="card-body">
                                        <h6 className="card-title text-muted">Admins</h6>
                                        <h2>{stats.total_admins}</h2>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-3">
                                <div className="card">
                                    <div className="card-body">
                                        <h6 className="card-title text-muted">2FA Enabled</h6>
                                        <h2>{stats.two_factor_enabled}</h2>
                                    </div>
                                </div>
                            </div>

                            <div className="col-md-3">
                                <div className="card">
                                    <div className="card-body">
                                        <h6 className="card-title text-muted">Total API Keys</h6>
                                        <h2>{stats.total_api_keys}</h2>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
