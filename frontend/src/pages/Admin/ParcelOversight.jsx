import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const ParcelOversight = () => {
    const { isAdmin } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [filterPayment, setFilterPayment] = useState('all');
    const [filterDelivery, setFilterDelivery] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // ✅ React Query — auto-refetch every 15 seconds for live updates
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['admin-parcels'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin/parcels');
            return res.data;
        },
        refetchInterval: 15000, // auto-refresh every 15s
        enabled: !!isAdmin,
    });

    const parcels = data?.parcels || [];

    const formatLabel = (value) =>
        value ? value.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'N/A';

    const filteredParcels = parcels.filter(parcel => {
        const paymentMatch = filterPayment === 'all' || (parcel.paymentStatus || 'unpaid').toLowerCase() === filterPayment;
        const deliveryMatch = filterDelivery === 'all' || (parcel.deliveryStatus || '').toLowerCase() === filterDelivery;
        const searchLower = searchTerm.toLowerCase();
        const textMatch = !searchTerm ||
            (parcel.senderEmail || '').toLowerCase().includes(searchLower) ||
            (parcel.senderName || '').toLowerCase().includes(searchLower) ||
            (parcel.receiverName || '').toLowerCase().includes(searchLower) ||
            (parcel.receiverEmail || '').toLowerCase().includes(searchLower) ||
            (parcel.trackingId || '').toLowerCase().includes(searchLower) ||
            (parcel.parcelName || '').toLowerCase().includes(searchLower);
        return paymentMatch && deliveryMatch && textMatch;
    });

    // Stats
    const totalParcels = parcels.length;
    const paidParcels = parcels.filter(p => p.paymentStatus === 'paid').length;
    const unpaidParcels = totalParcels - paidParcels;
    const totalRevenue = parcels.reduce((sum, p) => sum + (p.totalPrice || 0), 0);

    const paymentBadge = (status) => {
        if (status === 'paid') return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">✅ Paid</span>;
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">⏳ Unpaid</span>;
    };

    const deliveryBadge = (status) => {
        const map = {
            'awaiting-payment': 'bg-gray-100 text-gray-700',
            'pending-pickup': 'bg-yellow-100 text-yellow-800',
            'in-transit': 'bg-blue-100 text-blue-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
        };
        const cls = map[status] || 'bg-gray-100 text-gray-700';
        return <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${cls}`}>{formatLabel(status)}</span>;
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                            📦 All Parcels
                        </h1>
                        <p className="text-gray-500 mt-1">Live view of every parcel request — updates every 15s</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none gap-2"
                    >
                        {isFetching ? <span className="loading loading-spinner loading-xs"></span> : '🔄'}
                        {isFetching ? 'Refreshing...' : 'Refresh Now'}
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-l-4 border-l-blue-500">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Parcels</p>
                        <p className="text-3xl font-black text-blue-600 mt-1">{totalParcels}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-l-4 border-l-emerald-500">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Paid</p>
                        <p className="text-3xl font-black text-emerald-600 mt-1">{paidParcels}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-l-4 border-l-amber-500">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Unpaid</p>
                        <p className="text-3xl font-black text-amber-600 mt-1">{unpaidParcels}</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 border-l-4 border-l-lime-500">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total Revenue</p>
                        <p className="text-2xl font-black text-lime-700 mt-1">৳{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Search</label>
                            <input
                                type="text"
                                placeholder="Name, email, tracking ID, parcel name..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 transition text-slate-800"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Payment Status</label>
                            <select
                                value={filterPayment}
                                onChange={e => setFilterPayment(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 transition text-slate-800"
                            >
                                <option value="all">All</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">Delivery Status</label>
                            <select
                                value={filterDelivery}
                                onChange={e => setFilterDelivery(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border-2 border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 transition text-slate-800"
                            >
                                <option value="all">All</option>
                                <option value="awaiting-payment">Awaiting Payment</option>
                                <option value="pending-pickup">Pending Pickup</option>
                                <option value="in-transit">In Transit</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <span className="loading loading-spinner loading-lg text-emerald-600"></span>
                            <p className="text-slate-500 mt-3">Loading all parcels...</p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                        <p className="text-red-700 font-semibold">⚠️ Failed to load parcels. <button onClick={() => refetch()} className="underline">Try again</button></p>
                    </div>
                )}

                {/* Table */}
                {!isLoading && !isError && (
                    <>
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-sm text-slate-500 font-medium">
                                Showing <strong className="text-slate-800">{filteredParcels.length}</strong> of <strong className="text-slate-800">{totalParcels}</strong> parcels
                            </span>
                            {isFetching && <span className="text-xs text-emerald-600 font-semibold animate-pulse">● Updating...</span>}
                        </div>

                        {filteredParcels.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                                <p className="text-4xl mb-3">📭</p>
                                <p className="text-slate-500 text-lg">No parcels match your filters</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                                                <th className="px-5 py-4 text-left font-semibold">#</th>
                                                <th className="px-5 py-4 text-left font-semibold">Parcel</th>
                                                <th className="px-5 py-4 text-left font-semibold">Sender</th>
                                                <th className="px-5 py-4 text-left font-semibold">Receiver</th>
                                                <th className="px-5 py-4 text-left font-semibold">Tracking ID</th>
                                                <th className="px-5 py-4 text-right font-semibold">Cost</th>
                                                <th className="px-5 py-4 text-center font-semibold">Payment</th>
                                                <th className="px-5 py-4 text-center font-semibold">Delivery</th>
                                                <th className="px-5 py-4 text-center font-semibold">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredParcels.map((parcel, index) => (
                                                <tr key={parcel._id} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-5 py-4 text-slate-400 font-mono text-xs">{index + 1}</td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-slate-800">{parcel.parcelName || 'N/A'}</p>
                                                        <p className="text-xs text-slate-400">{formatLabel(parcel.parcelType)}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-slate-800">{parcel.senderName || 'N/A'}</p>
                                                        <p className="text-xs text-slate-500">{parcel.senderEmail || 'N/A'}</p>
                                                        <p className="text-xs text-slate-400">{parcel.senderPhone || ''}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-slate-800">{parcel.receiverName || 'N/A'}</p>
                                                        <p className="text-xs text-slate-500">{parcel.receiverEmail || 'N/A'}</p>
                                                        <p className="text-xs text-slate-400">{parcel.receiverPhone || ''}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                                                            {parcel.trackingId || 'Not assigned'}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-right font-bold text-lime-700">
                                                        ৳{parcel.totalPrice ?? 0}
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        {paymentBadge(parcel.paymentStatus || 'unpaid')}
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        {deliveryBadge(parcel.deliveryStatus || 'awaiting-payment')}
                                                    </td>
                                                    <td className="px-5 py-4 text-center text-xs text-slate-500">
                                                        {parcel.createdAt ? new Date(parcel.createdAt).toLocaleDateString('en-BD') : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ParcelOversight;
