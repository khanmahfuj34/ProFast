import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import {
    FiSearch, FiFilter, FiChevronLeft, FiChevronRight,
    FiEye, FiMapPin, FiDollarSign, FiDownload, FiXCircle,
    FiPackage, FiRefreshCw, FiAlertCircle, FiInbox
} from 'react-icons/fi';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';
import ParcelDetailsModal from './ParcelDetailsModal';

const PAGE_SIZE = 8;

/* ─── Helpers ──────────────────────────────────────────────────── */
const fmt = (v) => v ? v.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'N/A';

const fmtDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const STATUS_COLORS = {
    'awaiting-payment': 'bg-slate-100 text-slate-600',
    'pending-pickup':   'bg-amber-100 text-amber-700',
    'picked-up':        'bg-blue-100 text-blue-700',
    'on-the-way':       'bg-indigo-100 text-indigo-700',
    'delivered':        'bg-lime-100 text-lime-700',
    'cancelled':        'bg-red-100 text-red-600',
};
const STATUS_DOTS = {
    'awaiting-payment': 'bg-slate-400',
    'pending-pickup':   'bg-amber-400',
    'picked-up':        'bg-blue-500',
    'on-the-way':       'bg-indigo-500',
    'delivered':        'bg-lime-500',
    'cancelled':        'bg-red-500',
};

/* ─── Sub-components ────────────────────────────────────────────── */
const StatCard = ({ icon, label, value, sub, accent }) => (
    <div className={`bg-white rounded-2xl border ${accent} p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${accent.replace('border-', 'bg-').replace('-200', '-100')}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-sm font-semibold text-slate-600">{label}</p>
            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
    </div>
);

const SkeletonRow = () => (
    <tr className="border-b border-slate-100 animate-pulse">
        {[...Array(9)].map((_, i) => (
            <td key={i} className="px-4 py-4">
                <div className="h-4 bg-slate-200 rounded w-3/4" />
            </td>
        ))}
    </tr>
);

const StatusBadge = ({ status }) => {
    const colorClass = STATUS_COLORS[status] || 'bg-slate-100 text-slate-600';
    const dotClass = STATUS_DOTS[status] || 'bg-slate-400';
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            {fmt(status)}
        </span>
    );
};

/* ─── Main Component ────────────────────────────────────────────── */
const MyParcels = () => {
    const { user, isAdmin } = useAuth();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();

    const [search, setSearch]           = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sort, setSort]               = useState('latest');
    const [page, setPage]               = useState(1);
    const [selectedParcel, setSelectedParcel] = useState(null);

    /* ── Data fetch ── */
    const { data: parcels = [], isLoading, isError, isFetching, refetch } = useQuery({
        queryKey: isAdmin ? ['admin-all-parcels'] : ['parcels', user?.email],
        queryFn: async () => {
            if (isAdmin) {
                const res = await axiosSecure.get('/admin/parcels');
                return res.data?.parcels || [];
            }
            const res = await axiosSecure.get(`/parcels?email=${user.email}`);
            return res.data;
        },
        enabled: isAdmin ? true : !!user?.email,
    });

    /* ── Stats ── */
    const stats = useMemo(() => ({
        total:     parcels.length,
        pending:   parcels.filter(p => ['awaiting-payment', 'pending-pickup', 'picked-up', 'on-the-way'].includes(p.deliveryStatus)).length,
        delivered: parcels.filter(p => p.deliveryStatus === 'delivered').length,
        cancelled: parcels.filter(p => p.deliveryStatus === 'cancelled').length,
    }), [parcels]);

    /* ── Filter + sort ── */
    const filtered = useMemo(() => {
        let list = [...parcels];
        if (statusFilter !== 'all') list = list.filter(p => p.deliveryStatus === statusFilter);
        if (search.trim()) {
            const s = search.toLowerCase();
            list = list.filter(p =>
                (p.trackingId || '').toLowerCase().includes(s) ||
                (p.parcelName || '').toLowerCase().includes(s) ||
                (p.receiverName || '').toLowerCase().includes(s)
            );
        }
        list.sort((a, b) => {
            const ta = new Date(a.createdAt || 0).getTime();
            const tb = new Date(b.createdAt || 0).getTime();
            return sort === 'latest' ? tb - ta : ta - tb;
        });
        return list;
    }, [parcels, search, statusFilter, sort]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const clearFilters = () => { setSearch(''); setStatusFilter('all'); setSort('latest'); setPage(1); };

    /* ── Actions ── */
    const handlePayment = (parcel) => navigate('/dashboard/payment', { state: { parcel } });

    const handleCancel = async (parcel) => {
        if (!parcel?._id) return;
        if (parcel.deliveryStatus === 'delivered' || parcel.deliveryStatus === 'cancelled') {
            return Swal.fire('Cannot Cancel', 'This parcel cannot be cancelled at this stage.', 'info');
        }
        const { isConfirmed } = await Swal.fire({
            title: 'Cancel this parcel?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, cancel it',
            cancelButtonText: 'Go back',
            confirmButtonColor: '#dc2626',
        });
        if (!isConfirmed) return;
        try {
            await axiosSecure.patch(`/parcels/${parcel._id}`, { deliveryStatus: 'cancelled' });
            await Swal.fire('Cancelled!', 'Parcel has been cancelled.', 'success');
            refetch();
        } catch {
            Swal.fire('Error', 'Failed to cancel parcel.', 'error');
        }
    };

    const handleDownloadInvoice = (parcel) => {
        Swal.fire({
            title: 'Invoice',
            html: `
              <div style="text-align:left;font-family:monospace;line-height:2;background:#f9fafb;padding:16px;border-radius:8px">
                <p><b>Parcel:</b> ${parcel.parcelName || 'N/A'}</p>
                <p><b>Tracking ID:</b> ${parcel.trackingId || 'N/A'}</p>
                <p><b>Receiver:</b> ${parcel.receiverName || 'N/A'}</p>
                <p><b>Paid:</b> ৳${parcel.totalPrice ?? 0}</p>
                <p><b>Status:</b> ${fmt(parcel.paymentStatus)}</p>
              </div>`,
            confirmButtonText: 'Close',
            confirmButtonColor: '#65a30d',
        });
    };

    /* ── Loading skeleton ── */
    if (isLoading) return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />
                ))}
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <table className="w-full"><tbody>
                    {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
                </tbody></table>
            </div>
        </div>
    );

    /* ── Error ── */
    if (isError) return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mb-4">
                <FiAlertCircle className="text-red-500 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-slate-800">Failed to load parcels</h3>
            <p className="text-slate-500 mt-2 mb-6">Something went wrong. Please try again.</p>
            <button onClick={() => refetch()}
                className="flex items-center gap-2 px-5 py-2.5 bg-lime-500 hover:bg-lime-600 text-white rounded-xl font-semibold transition">
                <FiRefreshCw /> Try Again
            </button>
        </div>
    );

    return (
        <div className="space-y-6 pb-10">
            {/* ── Page Header ── */}
            <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-3xl font-black text-slate-900">My Parcels</h1>
                    <p className="text-slate-500 mt-1 text-sm">Track your submitted deliveries and pricing details.</p>
                    <p className="text-xs text-slate-400 mt-0.5">Dashboard &rsaquo; <span className="text-lime-600 font-semibold">My Parcels</span></p>
                </div>
                <button
                    onClick={() => refetch()}
                    disabled={isFetching}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold text-sm hover:bg-lime-50 hover:border-lime-300 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <FiRefreshCw className={`text-lime-600 ${isFetching ? 'animate-spin' : ''}`} />
                    {isFetching ? 'Refreshing…' : 'Refresh'}
                </button>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<FiPackage className="text-blue-500 text-xl" />}
                    label="Total Parcels" value={stats.total}
                    sub="All time parcels" accent="border-blue-200" />
                <StatCard
                    icon={<FiFilter className="text-amber-500 text-xl" />}
                    label="Pending Parcels" value={stats.pending}
                    sub="Waiting for delivery" accent="border-amber-200" />
                <StatCard
                    icon={<FiDownload className="text-lime-500 text-xl" />}
                    label="Delivered Parcels" value={stats.delivered}
                    sub="Successfully delivered" accent="border-lime-200" />
                <StatCard
                    icon={<FiXCircle className="text-red-400 text-xl" />}
                    label="Cancelled Parcels" value={stats.cancelled}
                    sub="Cancelled parcels" accent="border-red-200" />
            </div>

            {/* ── Filters ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5">
                        <FiSearch className="text-slate-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search by Tracking ID, name…"
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="bg-transparent w-full text-sm text-slate-700 focus:outline-none placeholder-slate-400"
                        />
                    </div>
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 min-w-[160px]"
                    >
                        <option value="all">All Status</option>
                        <option value="awaiting-payment">Awaiting Payment</option>
                        <option value="pending-pickup">Pending Pickup</option>
                        <option value="picked-up">Picked Up</option>
                        <option value="on-the-way">On The Way</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                    {/* Sort */}
                    <select
                        value={sort}
                        onChange={e => { setSort(e.target.value); setPage(1); }}
                        className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-lime-400 min-w-[140px]"
                    >
                        <option value="latest">Sort: Latest</option>
                        <option value="oldest">Sort: Oldest</option>
                    </select>
                    {/* Clear */}
                    {(search || statusFilter !== 'all' || sort !== 'latest') && (
                        <button onClick={clearFilters}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition">
                            <FiRefreshCw className="text-xs" /> Clear Filters
                        </button>
                    )}
                </div>
            </div>

            {/* ── Empty State ── */}
            {filtered.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-20 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                        <FiInbox className="text-slate-400 text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700">No parcels found</h3>
                    <p className="text-slate-400 mt-2 text-sm max-w-xs">
                        {search || statusFilter !== 'all'
                            ? 'Try adjusting your filters or search term.'
                            : 'Create your first parcel to see it listed here.'}
                    </p>
                    {(search || statusFilter !== 'all') && (
                        <button onClick={clearFilters}
                            className="mt-5 px-5 py-2.5 bg-lime-500 hover:bg-lime-600 text-white rounded-xl font-semibold text-sm transition">
                            Clear Filters
                        </button>
                    )}
                </div>
            )}

            {/* ── Table ── */}
            {filtered.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                                    <th className="px-4 py-4 text-left font-semibold text-slate-300 w-10">#</th>
                                    <th className="px-4 py-4 text-left font-semibold">Parcel Name</th>
                                    <th className="px-4 py-4 text-left font-semibold">Tracking ID</th>
                                    <th className="px-4 py-4 text-left font-semibold">Receiver Info</th>
                                    <th className="px-4 py-4 text-left font-semibold">Delivery Status</th>
                                    <th className="px-4 py-4 text-left font-semibold">Payment</th>
                                    <th className="px-4 py-4 text-right font-semibold">Cost</th>
                                    <th className="px-4 py-4 text-left font-semibold">Date</th>
                                    <th className="px-4 py-4 text-center font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((parcel, i) => {
                                    const payStatus = parcel.paymentStatus || 'unpaid';
                                    const isPaid = payStatus === 'paid';
                                    const delivStatus = parcel.deliveryStatus || 'awaiting-payment';
                                    const isCancellable = !['delivered', 'cancelled', 'on-the-way'].includes(delivStatus);
                                    const serial = (currentPage - 1) * PAGE_SIZE + i + 1;

                                    return (
                                        <tr key={parcel._id || i}
                                            className="border-b border-slate-100 hover:bg-lime-50/40 transition-colors group">
                                            {/* Serial */}
                                            <td className="px-4 py-4 text-slate-400 font-mono text-xs">{serial}</td>

                                            {/* Parcel Name */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center flex-shrink-0">
                                                        <FiPackage className="text-lime-600 text-sm" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-800 leading-tight">{parcel.parcelName || 'N/A'}</p>
                                                        <p className="text-xs text-slate-400">{fmt(parcel.parcelType)}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Tracking ID */}
                                            <td className="px-4 py-4">
                                                <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-lg">
                                                    {parcel.trackingId || '—'}
                                                </span>
                                            </td>

                                            {/* Receiver Info */}
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-slate-800 text-xs">{parcel.receiverName || '—'}</p>
                                                <p className="text-xs text-slate-400">{parcel.receiverPhone || '—'}</p>
                                            </td>

                                            {/* Delivery Status */}
                                            <td className="px-4 py-4">
                                                <StatusBadge status={delivStatus} />
                                            </td>

                                            {/* Payment */}
                                            <td className="px-4 py-4">
                                                {isPaid ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-lime-100 text-lime-700 rounded-full text-xs font-semibold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-lime-500" /> Paid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-600 rounded-full text-xs font-semibold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Unpaid
                                                    </span>
                                                )}
                                            </td>

                                            {/* Cost */}
                                            <td className="px-4 py-4 text-right">
                                                <span className="font-bold text-slate-800">৳{parcel.totalPrice ?? 0}</span>
                                            </td>

                                            {/* Date */}
                                            <td className="px-4 py-4 text-xs text-slate-500 whitespace-nowrap">
                                                {fmtDate(parcel.createdAt)}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    {/* View Details */}
                                                    <button
                                                        onClick={() => setSelectedParcel(parcel)}
                                                        title="View Details"
                                                        className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition">
                                                        <FiEye className="text-sm" />
                                                    </button>

                                                    {/* Track Parcel */}
                                                    <button
                                                        onClick={() => {
                                                            if (parcel.trackingId) {
                                                                navigate(`/dashboard/track-parcel?id=${parcel.trackingId}`);
                                                            } else {
                                                                Swal.fire('No Tracking ID', 'This parcel does not have a tracking ID yet. Please complete payment first.', 'info');
                                                            }
                                                        }}
                                                        title="Track Parcel"
                                                        className="w-8 h-8 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition">
                                                        <FiMapPin className="text-sm" />
                                                    </button>

                                                    {/* Pay Now / Download Invoice */}
                                                    {!isPaid ? (
                                                        <button
                                                            onClick={() => handlePayment(parcel)}
                                                            title="Pay Now"
                                                            className="w-8 h-8 rounded-lg bg-lime-50 hover:bg-lime-100 text-lime-700 flex items-center justify-center transition">
                                                            <FiDollarSign className="text-sm" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleDownloadInvoice(parcel)}
                                                            title="Download Invoice"
                                                            className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center transition">
                                                            <FiDownload className="text-sm" />
                                                        </button>
                                                    )}

                                                    {/* Cancel */}
                                                    {!isAdmin && isCancellable && (
                                                        <button
                                                            onClick={() => handleCancel(parcel)}
                                                            title="Cancel Parcel"
                                                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition">
                                                            <FiXCircle className="text-sm" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Pagination ── */}
                    <div className="px-6 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-slate-500">
                            Showing <span className="font-semibold text-slate-700">
                                {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)}
                            </span> of <span className="font-semibold text-slate-700">{filtered.length}</span> results
                        </p>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                                <FiChevronLeft className="text-sm" />
                            </button>
                            {[...Array(totalPages)].map((_, i) => {
                                const pg = i + 1;
                                const show = pg === 1 || pg === totalPages || Math.abs(pg - currentPage) <= 1;
                                const ellipsis = (pg === 2 && currentPage > 3) || (pg === totalPages - 1 && currentPage < totalPages - 2);
                                if (ellipsis) return <span key={pg} className="text-slate-400 px-1">…</span>;
                                if (!show) return null;
                                return (
                                    <button key={pg} onClick={() => setPage(pg)}
                                        className={`w-8 h-8 rounded-lg text-sm font-semibold border transition ${
                                            currentPage === pg
                                                ? 'bg-lime-500 border-lime-500 text-white shadow-sm'
                                                : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                                        }`}>
                                        {pg}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition">
                                <FiChevronRight className="text-sm" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Details Modal ── */}
            {selectedParcel && (
                <ParcelDetailsModal
                    parcel={selectedParcel}
                    onClose={() => setSelectedParcel(null)}
                />
            )}
        </div>
    );
};

export default MyParcels;