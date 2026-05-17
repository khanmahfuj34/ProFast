import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import RiderDrawer from '../../../components/RiderDrawer';


const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'cancelled', label: 'Cancelled' },
];

const statusBadgeClasses = {
    'Delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Pickup Ready': 'bg-blue-50 text-blue-700 border-blue-200',
    'On The Way': 'bg-amber-50 text-amber-700 border-amber-200',
    'Assigned': 'bg-slate-100 text-slate-700 border-slate-200',
    'Cancelled': 'bg-red-50 text-red-700 border-red-200',
};

const StatCard = ({ icon, label, value, subtext, accent }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shrink-0 ${accent}`}>
            {icon}
        </div>
        <div>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-emerald-600 font-medium">{subtext}</p>
        </div>
    </div>
);

const DeliveryHistory = () => {
    const axiosSecure = useAxiosSecure();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const limit = 10;
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);

    const queryKey = ['rider-delivery-history', page, search, status, fromDate, toDate];

    const { data, isLoading } = useQuery({
        queryKey,
        queryFn: async () => {
            const params = new URLSearchParams({
                page: String(page),
                limit: String(limit),
                search,
                status,
            });
            if (fromDate) params.append('fromDate', fromDate);
            if (toDate) params.append('toDate', toDate);

            const res = await axiosSecure.get(`/rider/delivery-history?${params.toString()}`);
            return res.data;
        },
        keepPreviousData: true,
    });

    const stats = data?.stats || {};
    const pagination = data?.pagination || {};
    const deliveries = data?.deliveries || [];

    const handleExport = () => {
        Swal.fire({
            title: 'Export Data',
            text: 'Export functionality will be implemented with CSV/Excel generation.',
            icon: 'info',
            timer: 2000,
            showConfirmButton: false,
        });
    };

    const handleClearFilters = () => {
        setSearch('');
        setStatus('all');
        setFromDate('');
        setToDate('');
        setPage(1);
    };

    const pageNumbers = useMemo(() => {
        const pages = [];
        const total = pagination.totalPages || 1;
        const current = pagination.page || 1;
        for (let i = 1; i <= total; i++) {
            if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
                pages.push(i);
            } else if (pages[pages.length - 1] !== '...') {
                pages.push('...');
            }
        }
        return pages;
    }, [pagination]);

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Delivery History</h1>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <StatCard
                        icon="📦"
                        label="Total Deliveries"
                        value={stats.totalDeliveries ?? 0}
                        subtext="All Time"
                        accent="bg-emerald-50"
                    />
                    <StatCard
                        icon="✅"
                        label="Completed"
                        value={stats.completed ?? 0}
                        subtext={`${stats.successRate ?? 0}% Success`}
                        accent="bg-blue-50"
                    />
                    <StatCard
                        icon="🕐"
                        label="In Transit"
                        value={stats.inTransit ?? 0}
                        subtext="On The Way"
                        accent="bg-amber-50"
                    />
                    <StatCard
                        icon="❌"
                        label="Cancelled"
                        value={stats.cancelled ?? 0}
                        subtext={`${stats.cancelledRate ?? 0}% Cancelled`}
                        accent="bg-red-50"
                    />
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-end">
                        {/* Search */}
                        <div className="flex-1 min-w-0">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Search</label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search by tracking ID, receiver..."
                                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="w-full lg:w-44">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                            <select
                                value={status}
                                onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                            >
                                {statusOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="w-full lg:w-44">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Date Range</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div className="w-full lg:w-44">
                            <label className="block text-xs font-medium text-slate-500 mb-1">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={(e) => { setToDate(e.target.value); setPage(1); }}
                                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>

                        {/* Clear & Export */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleClearFilters}
                                className="px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                            >
                                Clear Filters
                            </button>
                            <button
                                onClick={handleExport}
                                className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tracking ID</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Parcel Details</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pickup → Delivery</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Delivered On</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Earning</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center">
                                            <span className="loading loading-spinner loading-lg text-emerald-600"></span>
                                        </td>
                                    </tr>
                                ) : deliveries.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                                            <div className="text-4xl mb-3">📭</div>
                                            <p className="font-semibold text-slate-500">No deliveries found</p>
                                            <p className="text-sm mt-1">Try adjusting your filters or search.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    deliveries.map((d) => (
                                        <tr key={d.id} className="hover:bg-slate-50 transition">
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-sm">
                                                        📦
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-mono text-slate-500">{d.trackingId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm font-semibold text-slate-800">{d.parcelName}</p>
                                                <p className="text-xs text-slate-500">{d.category} • {d.weight}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="inline-flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                        {d.pickup}
                                                    </span>
                                                    <span className="text-slate-400">→</span>
                                                    <span className="inline-flex items-center gap-1">
                                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                        {d.delivery}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadgeClasses[d.status] || statusBadgeClasses['Assigned']}`}>
                                                    {d.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                {d.deliveredDate ? (
                                                    <div>
                                                        <p className="text-sm text-slate-700">{d.deliveredDateFormatted}</p>
                                                        <p className="text-xs text-slate-400">{d.deliveredTimeFormatted}</p>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`text-sm font-semibold ${d.earning > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                    {d.earningFormatted}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <button
                                                    onClick={() => {
                                                        setSelectedParcel(d);
                                                        setDrawerOpen(true);
                                                    }}
                                                    className="px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-5 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <p className="text-xs text-slate-500">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalRecords)} of {pagination.totalRecords} entries
                            </p>
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={!pagination.hasPrevPage}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                {pageNumbers.map((p, idx) => (
                                    p === '...' ? (
                                        <span key={`dots-${idx}`} className="px-2 text-xs text-slate-400">...</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition ${
                                                p === pagination.page
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    )
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={!pagination.hasNextPage}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <RiderDrawer
                isOpen={drawerOpen}
                onClose={() => {
                    setDrawerOpen(false);
                    setTimeout(() => setSelectedParcel(null), 300);
                }}
                parcel={selectedParcel}
            />
        </div>
    );
};


export default DeliveryHistory;
