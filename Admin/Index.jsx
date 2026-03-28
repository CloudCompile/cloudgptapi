import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function AdminIndex() {
    return (
        <AppLayout>
            <Head title="Admin Panel" />
            <div className="container my-5">
                <div className="row">
                    <div className="col-lg-8 mx-auto">
                        <h1 className="mb-3">Admin Panel</h1>
                        <p className="text-muted mb-4">Manage your application and users</p>

                        <div className="row g-4">
                            <div className="col-md-6">
                                <Link href="/admin/users" className="card text-decoration-none h-100 text-dark">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <i className="bi bi-people"></i> Users
                                        </h5>
                                        <p className="card-text text-muted">Manage user accounts, permissions, and roles</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="col-md-6">
                                <Link href="/admin/stats" className="card text-decoration-none h-100 text-dark">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <i className="bi bi-bar-chart"></i> Statistics
                                        </h5>
                                        <p className="card-text text-muted">View system statistics and usage data</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="col-md-6">
                                <Link href="/admin/plans" className="card text-decoration-none h-100 text-dark">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            Plans
                                        </h5>
                                        <p className="card-text text-muted">Manage subscription plans and pricing</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="col-md-6">
                                <Link href="/admin/promo-codes" className="card text-decoration-none h-100 text-dark">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <i className="bi bi-ticket-perforated"></i> Promo Codes
                                        </h5>
                                        <p className="card-text text-muted">Manage promotional codes and discounts</p>
                                    </div>
                                </Link>
                            </div>

                            <div className="col-md-6">
                                <Link href="/admin/error-logs" className="card text-decoration-none h-100 text-dark">
                                    <div className="card-body">
                                        <h5 className="card-title">
                                            <i className="bi bi-exclamation-triangle"></i> Error Logs
                                        </h5>
                                        <p className="card-text text-muted">View and manage application error logs</p>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .card {
                    border: 1px solid #dee2e6;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                .card:hover {
                    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
                    transform: translateY(-2px);
                    border-color: #0d6efd;
                }
            `}</style>
        </AppLayout>
    );
}
