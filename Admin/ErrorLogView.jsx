import React from 'react';
import { Link, Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function ErrorLogView({ error }) {
    const formatRelativeDate = (date) => {
        const now = new Date();
        const errorDate = new Date(date);
        const seconds = Math.floor((now - errorDate) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return errorDate.toLocaleString();
    };
    const getLevelBadgeClass = (level) => {
        const classes = {
            error: 'bg-danger',
            warning: 'bg-warning',
            info: 'bg-info',
        };
        return classes[level] || 'bg-secondary';
    };

    const formatJson = (data) => {
        if (!data) return 'N/A';
        // If it's already an object, stringify it
        if (typeof data === 'object') {
            return JSON.stringify(data, null, 2);
        }
        // If it's a string, try to parse it first
        if (typeof data === 'string') {
            try {
                const parsed = JSON.parse(data);
                return JSON.stringify(parsed, null, 2);
            } catch {
                return data;
            }
        }
        return String(data);
    };

    const hasContent = (data) => {
        if (!data) return false;
        if (typeof data === 'object') {
            return Object.keys(data).length > 0;
        }
        if (typeof data === 'string') {
            try {
                return Object.keys(JSON.parse(data)).length > 0;
            } catch {
                return data.trim().length > 0;
            }
        }
        return false;
    };

    return (
        <AppLayout>
            <Head title="Error Details - Admin" />

            <div className="container my-5">
                <div className="row">
                    <div className="col-12">
                {/* Header */}
                <div className="mb-3">
                    <Link href="/admin/error-logs" className="btn btn-secondary btn-sm">
                        ← Back to Error Logs
                    </Link>
                </div>

                <h1 className="mb-3">Error Details</h1>
                <p className="text-muted mb-4">View complete error information and stack trace</p>

                {/* Main Content */}
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body p-4">
                        {/* Level and Timestamp */}
                        <div className="row mb-4 align-items-center">
                            <div className="col-auto">
                                <span className={`badge ${getLevelBadgeClass(error.level)} fs-6 px-3 py-2`}>
                                    {error.level.toUpperCase()}
                                </span>
                            </div>
                            <div className="col">
                                <p className="text-muted mb-0">
                                    {formatRelativeDate(error.created_at)}
                                </p>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-2">Message</h5>
                            <div className="p-3 bg-light rounded border-start border-3 border-danger">
                                <code className="d-block text-break">{error.message}</code>
                            </div>
                        </div>

                        {/* User Information */}
                        {error.user && (
                            <div className="mb-4">
                                <h5 className="fw-bold mb-2">User</h5>
                                <div className="d-flex align-items-center">
                                    <div className="flex-shrink-0">
                                        <div className="w-40 h-40 rounded-circle bg-secondary-subtle d-flex align-items-center justify-content-center">
                                            <span className="fw-bold text-secondary">
                                                {error.user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 ms-3">
                                        <p className="mb-1">
                                            <strong>{error.user.name}</strong>
                                        </p>
                                        <p className="text-muted mb-0">{error.user.email}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Request Information */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-2">Request Information</h5>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <p className="text-muted small mb-1">Method</p>
                                    <code className="d-block">{error.method}</code>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <p className="text-muted small mb-1">Path</p>
                                    <code className="d-block text-break">{error.path}</code>
                                </div>
                            </div>
                        </div>

                        {/* File Information */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-2">File Location</h5>
                            <div className="row">
                                <div className="col-md-8 mb-3">
                                    <p className="text-muted small mb-1">File</p>
                                    <code className="d-block text-break fs-sm">{error.file}</code>
                                </div>
                                <div className="col-md-4 mb-3">
                                    <p className="text-muted small mb-1">Line</p>
                                    <code className="d-block">{error.line}</code>
                                </div>
                            </div>
                        </div>

                        {/* Stack Trace */}
                        <div className="mb-4">
                            <h5 className="fw-bold mb-2">Stack Trace</h5>
                            <div className="bg-dark text-light p-3 rounded font-monospace overflow-auto" style={{ maxHeight: '400px', fontSize: '0.875rem' }}>
                                <pre className="mb-0 text-light" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                    {error.trace || 'No stack trace available'}
                                </pre>
                            </div>
                        </div>

                        {/* Context */}
                        {hasContent(error.context) && (
                            <div className="mb-4">
                                <h5 className="fw-bold mb-2">Context</h5>
                                <div className="bg-light p-3 rounded border">
                                    <pre className="mb-0 fs-sm text-break">
                                        {formatJson(error.context)}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {/* Request Data */}
                        {hasContent(error.request_data) && (
                            <div className="mb-4">
                                <h5 className="fw-bold mb-2">Request Data</h5>
                                <div className="bg-light p-3 rounded border">
                                    <pre className="mb-0 fs-sm text-break">
                                        {formatJson(error.request_data)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                </div>
                    </div>
                </div>
        </AppLayout>
    );
}
