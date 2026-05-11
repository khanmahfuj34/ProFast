import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import {
    FiSearch, FiPackage, FiUser, FiPhone, FiMapPin,
    FiCheckCircle, FiClock, FiTruck, FiXCircle,
    FiAlertCircle, FiCalendar, FiArrowLeft,
    FiRefreshCw, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import { MdOutlineAssignmentInd, MdOutlineLocalShipping } from 'react-icons/md';

/* ─── Status timeline definition ──────────────────────────────── */
const TIMELINE = [
    { key: 'awaiting-payment', label: 'Order Placed',     icon: FiPackage,               desc: 'Parcel submitted, awaiting payment' },
    { key: 'pending-pickup',   label: 'Payment Confirmed', icon: FiCheckCircle,           desc: 'Payment received, rider being arranged' },
    { key: 'driver_assigned',  label: 'Rider Assigned',    icon: MdOutlineAssignmentInd,  desc: 'A rider has been assigned to your parcel' },
    { key: 'driver_accepted',  label: 'Pickup Pending',    icon: FiClock,                 desc: 'Rider accepted and heading to pickup' },
    { key: 'picked_up',        label: 'Picked Up',         icon: FiTruck,                 desc: 'Parcel collected from sender' },
    { key: 'on_the_way',       label: 'On The Way',        icon: MdOutlineLocalShipping,  desc: 'Parcel in transit to destination' },
    { key: 'delivered',        label: 'Delivered',         icon: FiCheckCircle,           desc: 'Parcel successfully delivered' },
];

const STATUS_ORDER = TIMELINE.map(s => s.key);

function getStepIndex(status) {
    if (!status) return 0;
    const idx = STATUS_ORDER.indexOf(status);
    return idx === -1 ? 0 : idx;
}

function fmt(v) {
    if (!v) return 'N/A';
    return v.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function fmtDate(d) {
    if (!d) return '—';
    return new Date(d).toLocaleString('en-US', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

/* ─── Info row ────────────────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value, mono }) => (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-50 last:border-0">
        <div className="w-7 h-7 rounded-lg bg-lime-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            {Icon && <Icon className="text-lime-600 text-xs" />}
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-sm font-semibold text-slate-800 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value || '—'}</p>
        </div>
    </div>
);

/* ─── Status badge ────────────────────────────────────────────── */
const STATUS_COLORS = {
    'awaiting-payment': 'bg-slate-100 text-slate-600',
    'pending-pickup':   'bg-amber-100 text-amber-700',
    'driver_assigned':  'bg-blue-100 text-blue-700',
    'driver_accepted':  'bg-indigo-100 text-indigo-700',
    'picked_up':        'bg-violet-100 text-violet-700',
    'on_the_way':       'bg-orange-100 text-orange-700',
    'delivered':        'bg-lime-100 text-lime-700',
    'cancelled':        'bg-red-100 text-red-600',
    'delivery_failed':  'bg-red-100 text-red-700',
};

/* ─── Skeleton ────────────────────────────────────────────────── */
const Skeleton = () => (
    <div className="animate-pulse space-y-6">
        <div className="h-32 bg-slate-200 rounded-2xl" />
        <div className="h-20 bg-slate-200 rounded-2xl" />
        <div className="grid grid-cols-2 gap-4">
            <div className="h-48 bg-slate-200 rounded-2xl" />
            <div className="h-48 bg-slate-200 rounded-2xl" />
        </div>
    </div>
);

/* ─── Main Component ──────────────────────────────────────────── */
const TrackParcel = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const initialId = searchParams.get('id') || '';
    const [inputId, setInputId] = useState(initialId);
    const [trackingId, setTrackingId] = useState(initialId);

    const { user } = useAuth();
    const [page, setPage] = useState(1);
    const PAGE_SIZE = 7;

    const axiosSecure = useAxiosSecure();

    // Fetch specific tracking id
    const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: ['track-parcel', trackingId],
        queryFn: async () => {
            const res = await axiosSecure.get(`/track/${trackingId}`);
            return res.data.parcel;
        },
        enabled: !!trackingId,
        retry: false,
    });

    // Fetch user's active parcels
    const { data: userParcels = [], isFetching: isFetchingParcels } = useQuery({
        queryKey: ['parcels', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/parcels?email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        const id = inputId.trim();
        if (!id) return;
        setTrackingId(id);
        setSearchParams({ id });
    };

    const parcel = data;
    const isCancelled = ['cancelled', 'delivery_failed'].includes(parcel?.deliveryStatus);
    const currentStep = parcel ? getStepIndex(parcel.deliveryStatus) : -1;

    // Pagination & Filtering for active parcels
    const activeParcels = userParcels.filter(p => !['delivered', 'cancelled', 'delivery_failed'].includes(p.deliveryStatus));
    const sortedParcels = activeParcels.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const paginatedParcels = sortedParcels.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    const totalPages = Math.ceil(sortedParcels.length / PAGE_SIZE);

    return (
        <div className="w-full">
            <div className="max-w-3xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-lime-500 shadow-lg shadow-lime-200 flex-shrink-0">
                            <FiPackage className="text-white text-2xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 pt-1">Track Your Parcel</h1>
                            <p className="text-slate-500 mt-1 text-xs sm:text-sm">Enter your tracking ID to get real-time delivery updates</p>
                        </div>
                    </div>
                    <div>
                        <button 
                            onClick={() => refetch()} 
                            disabled={isFetching || isLoading}
                            className="btn btn-sm bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-lime-500 hover:text-lime-600 transition-all rounded-xl shadow-sm h-10 px-3 sm:px-4"
                        >
                            <FiRefreshCw className={`text-sm ${isFetching || isLoading ? 'animate-spin text-lime-500' : ''}`} />
                            <span className="hidden sm:inline ml-2 font-semibold">Refresh</span>
                        </button>
                    </div>
                </div>

                {/* Search Box */}
                <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                    <div className="flex gap-3">
                        <div className="flex-1 flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-lime-400 focus-within:border-lime-400 transition">
                            <FiSearch className="text-slate-400 flex-shrink-0" />
                            <input
                                type="text"
                                value={inputId}
                                onChange={e => setInputId(e.target.value)}
                                placeholder="e.g. TRK-1715823928510"
                                className="bg-transparent w-full text-sm text-slate-800 focus:outline-none placeholder-slate-400 font-mono"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!inputId.trim() || isLoading}
                            className="px-6 py-3 bg-lime-500 hover:bg-lime-600 disabled:opacity-50 text-white font-semibold rounded-xl text-sm transition flex items-center gap-2"
                        >
                            {isLoading ? <span className="loading loading-spinner loading-xs" /> : <FiSearch />}
                            Track
                        </button>
                    </div>
                </form>

                {/* Loading */}
                {isLoading && <Skeleton />}

                {/* Error */}
                {isError && !isLoading && (
                    <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                            <FiAlertCircle className="text-red-500 text-2xl" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-800">Parcel Not Found</h3>
                        <p className="text-slate-500 mt-2 text-sm">
                            {error?.response?.data?.message || 'No parcel found with this tracking ID. Please check and try again.'}
                        </p>
                    </div>
                )}

                {/* Results */}
                {parcel && !isLoading && (
                    <>
                        {/* Parcel Summary Card */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-lime-100 flex items-center justify-center">
                                        <FiPackage className="text-lime-600 text-xl" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900">{parcel.parcelName || 'Parcel'}</h2>
                                        <p className="text-xs font-mono text-slate-400 mt-0.5">{parcel.trackingId}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${STATUS_COLORS[parcel.deliveryStatus] || 'bg-slate-100 text-slate-600'}`}>
                                        {fmt(parcel.deliveryStatus)}
                                    </span>
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${parcel.paymentStatus === 'paid' ? 'bg-lime-100 text-lime-700' : 'bg-red-100 text-red-600'}`}>
                                        {parcel.paymentStatus === 'paid' ? '✓ Paid' : '✗ Unpaid'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Type</p>
                                    <p className="text-sm font-semibold text-slate-700 mt-1">{fmt(parcel.parcelType)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Delivery</p>
                                    <p className="text-sm font-semibold text-slate-700 mt-1">{fmt(parcel.deliveryType)}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Cost</p>
                                    <p className="text-sm font-bold text-lime-700 mt-1">৳{parcel.totalPrice ?? 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Created</p>
                                    <p className="text-xs font-semibold text-slate-700 mt-1">{fmtDate(parcel.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Timeline */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-800 mb-5">Delivery Progress</h3>

                            {isCancelled ? (
                                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
                                    <FiXCircle className="text-red-500 text-xl flex-shrink-0" />
                                    <div>
                                        <p className="font-bold text-red-700">Delivery {fmt(parcel.deliveryStatus)}</p>
                                        <p className="text-sm text-red-600 mt-0.5">This parcel delivery was not completed.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative">
                                    {TIMELINE.map((step, i) => {
                                        const Icon = step.icon;
                                        const done = i < currentStep;
                                        const active = i === currentStep;
                                        const future = i > currentStep;
                                        return (
                                            <div key={step.key} className="flex items-start gap-4 pb-6 last:pb-0 relative">
                                                {/* Vertical line */}
                                                {i < TIMELINE.length - 1 && (
                                                    <div className={`absolute left-[17px] top-9 bottom-0 w-0.5 ${done ? 'bg-lime-400' : 'bg-slate-200'}`} />
                                                )}
                                                {/* Circle */}
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all z-10 ${
                                                    done   ? 'bg-lime-500 border-lime-500 text-white' :
                                                    active ? 'bg-white border-lime-500 text-lime-600 shadow-lg shadow-lime-100' :
                                                             'bg-white border-slate-200 text-slate-300'
                                                }`}>
                                                    {done ? <FiCheckCircle className="text-sm" /> : <Icon className="text-sm" />}
                                                </div>
                                                {/* Label */}
                                                <div className="flex-1 pt-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <p className={`text-sm font-bold ${future ? 'text-slate-400' : 'text-slate-800'}`}>{step.label}</p>
                                                        {active && (
                                                            <span className="px-2 py-0.5 bg-lime-100 text-lime-700 text-[10px] font-bold rounded-full uppercase tracking-wide animate-pulse">
                                                                Current
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs mt-0.5 ${future ? 'text-slate-300' : 'text-slate-500'}`}>{step.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Sender / Receiver */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">From (Sender)</h3>
                                <InfoRow icon={FiUser}   label="Name"    value={parcel.senderName} />
                                <InfoRow icon={FiMapPin} label="District" value={parcel.senderDistrict} />
                                <InfoRow icon={FiMapPin} label="Address" value={parcel.senderAddress} />
                            </div>
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 pb-2 border-b border-slate-100">To (Receiver)</h3>
                                <InfoRow icon={FiUser}   label="Name"    value={parcel.receiverName} />
                                <InfoRow icon={FiPhone}  label="Phone"   value={parcel.receiverPhone} />
                                <InfoRow icon={FiMapPin} label="Address" value={parcel.receiverAddress} />
                            </div>
                        </div>

                        {/* Rider Info (if assigned) */}
                        {parcel.riderName && (
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {parcel.riderName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Assigned Rider</p>
                                    <p className="font-bold text-slate-800 mt-0.5">{parcel.riderName}</p>
                                    {parcel.riderEmail && <p className="text-xs text-slate-500">{parcel.riderEmail}</p>}
                                </div>
                                <div className="ml-auto">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">On Duty</span>
                                </div>
                            </div>
                        )}

                        {/* Activity Log */}
                        {parcel.activityLog?.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                <h3 className="text-sm font-bold text-slate-800 mb-4">Activity Log</h3>
                                <div className="space-y-3">
                                    {[...parcel.activityLog].reverse().map((log, i) => (
                                        <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-50 last:border-0">
                                            <div className="w-2 h-2 rounded-full bg-lime-500 mt-2 flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between flex-wrap gap-1">
                                                    <p className="text-sm font-semibold text-slate-800">{fmt(log.status)}</p>
                                                    <p className="text-[10px] text-slate-400">{fmtDate(log.timestamp)}</p>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">Updated by: {log.updatedBy}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Dates */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                                <FiCalendar className="text-slate-400 mx-auto mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Order Date</p>
                                <p className="text-sm font-bold text-slate-700 mt-1">{fmtDate(parcel.createdAt)}</p>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
                                <FiClock className="text-slate-400 mx-auto mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Last Updated</p>
                                <p className="text-sm font-bold text-slate-700 mt-1">{fmtDate(parcel.updatedAt)}</p>
                            </div>
                        </div>

                        {/* Refresh hint */}
                        <p className="text-center text-xs text-slate-400">
                            Status updates automatically. <button onClick={() => refetch()} className="text-lime-600 font-semibold hover:underline">Refresh now</button>
                        </p>
                    </>
                )}

                {/* Back link */}
                <div className="text-center pb-6">
                    <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-600 transition">
                        <FiArrowLeft className="text-xs" /> Back to Dashboard
                    </Link>
                </div>

                {/* Active Parcels Section */}
                {user && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse shadow-[0_0_8px_rgba(132,204,22,0.8)]"></span>
                                Active Deliveries
                            </h3>
                            <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
                                {activeParcels.length} Active
                            </span>
                        </div>
                        
                        {sortedParcels.length === 0 ? (
                            <div className="p-8 text-center bg-white">
                                <p className="text-slate-500 text-sm">You have no active parcels currently in transit.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 bg-white">
                                {paginatedParcels.map(p => (
                                    <div key={p._id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex-1 min-w-0 pr-4">
                                            <p className="text-sm font-bold text-slate-800 truncate">{p.parcelName || 'Parcel'}</p>
                                            <p className="text-xs font-mono text-slate-500 mt-1 bg-slate-100 w-fit px-2 py-0.5 rounded-md">{p.trackingId || 'No Tracking ID'}</p>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm w-full sm:w-auto">
                                            <div className="hidden lg:block w-32">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Receiver</p>
                                                <p className="font-semibold text-slate-700 text-xs truncate">{p.receiverName}</p>
                                            </div>
                                            <div className="hidden md:block w-28">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Created</p>
                                                <p className="font-semibold text-slate-700 text-xs">{fmtDate(p.createdAt).split(',')[0]}</p>
                                            </div>
                                            <div className="flex-1 sm:flex-none sm:w-36">
                                                <span className={`px-2.5 py-1.5 rounded-full text-[10px] font-bold inline-block border ${
                                                    p.deliveryStatus === 'pending-pickup' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                    p.deliveryStatus === 'on_the_way' ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                    p.deliveryStatus === 'driver_accepted' || p.deliveryStatus === 'picked_up' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                    'bg-slate-50 text-slate-600 border-slate-200'
                                                }`}>
                                                    {fmt(p.deliveryStatus)}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setTrackingId(p.trackingId);
                                                    setInputId(p.trackingId);
                                                    setSearchParams({ id: p.trackingId });
                                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                                }}
                                                disabled={!p.trackingId || isFetching}
                                                className="btn btn-sm bg-lime-50 hover:bg-lime-500 text-lime-600 hover:text-white border-lime-200 px-5 rounded-xl disabled:opacity-50 transition-colors shadow-sm"
                                            >
                                                Track
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <span className="text-xs text-slate-500 font-medium">Page <span className="text-slate-800 font-bold">{page}</span> of {totalPages}</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 transition-all shadow-sm"
                                    >
                                        <FiChevronLeft className="text-sm" />
                                    </button>
                                    <button 
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 disabled:opacity-40 disabled:hover:bg-white disabled:hover:border-slate-200 transition-all shadow-sm"
                                    >
                                        <FiChevronRight className="text-sm" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackParcel;
