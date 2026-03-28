import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';

export default function Maintenance({ isDownForMaintenance }) {
    const { flash } = usePage().props;
    const [isToggling, setIsToggling] = useState(false);

    const handleToggle = async () => {
        setIsToggling(true);
        router.post('/admin/maintenance/toggle', {}, {
            onFinish: () => setIsToggling(false),
        });
    };

    return (
        <AppLayout>
            <Head title="Admin - Maintenance" />
            <div className="container my-5">
                <div className="mb-3">
                    <Link href="/admin" className="btn btn-secondary btn-sm">
                        ← Back to Admin
                    </Link>
                </div>

                <div className="d-flex align-items-center justify-content-between mb-3">
                    <div>
                        <h1 className="mb-1">Maintenance Mode</h1>
                        <p className="text-muted">Control application maintenance status</p>
                    </div>
                    <span className={`badge ${isDownForMaintenance ? 'text-bg-danger' : 'text-bg-success'}`}>
                        {isDownForMaintenance ? 'DOWN' : 'ONLINE'}
                    </span>
                </div>

                {flash?.success && (
                    <div className="alert alert-success" role="alert">
                        {flash.success}
                    </div>
                )}

                <div className="card">
                    <div className="card-body">
                        <div className="row g-4 align-items-center">
                            <div className="col-lg-8">
                                <h5 className="card-title mb-2">Current Status</h5>
                                <p className="text-muted mb-2">
                                    Status: <strong>{isDownForMaintenance ? 'Maintenance Mode Active' : 'All Systems Operational'}</strong>
                                </p>
                                {isDownForMaintenance && (
                                    <p className="text-muted mb-0">
                                        Users will see the maintenance page. Admins can still access the application.
                                    </p>
                                )}
                            </div>
                            <div className="col-lg-4 text-lg-end">
                                <button
                                    onClick={handleToggle}
                                    disabled={isToggling}
                                    className={`btn ${isDownForMaintenance ? 'btn-success' : 'btn-danger'} w-100 w-lg-auto`}
                                >
                                    {isToggling
                                        ? 'Processing...'
                                        : isDownForMaintenance
                                            ? 'Bring Application Online'
                                            : 'Enable Maintenance Mode'}
                                </button>
                            </div>
                        </div>

                        <hr className="my-4" />

                        <h6 className="mb-2">What happens</h6>
                        {isDownForMaintenance ? (
                            <ul className="text-muted mb-0">
                                <li>Users see the maintenance page</li>
                                <li>Admins can still access the application</li>
                                <li>API requests return 503 Service Unavailable</li>
                            </ul>
                        ) : (
                            <ul className="text-muted mb-0">
                                <li>Application returns to normal operation</li>
                                <li>All users can access the site</li>
                                <li>API endpoints are fully available</li>
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
