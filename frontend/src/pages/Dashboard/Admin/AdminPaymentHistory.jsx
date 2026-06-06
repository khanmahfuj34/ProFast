import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const AdminPaymentHistory = () => {
    const { isAdmin } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState('');

    // ✅ React Query — auto-refetch every 15 seconds
    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: ['admin-payments'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin/payments');
            return res.data;
        },
        refetchInterval: 15000,
        enabled: !!isAdmin,
    });

    const payments = data?.payments || [];

    // Filtered payments
    const filteredPayments = searchTerm.trim() === ''
        ? payments
        : payments.filter(payment => {
            const s = searchTerm.toLowerCase();
            return (
                (payment.customerEmail || '').toLowerCase().includes(s) ||
                (payment.parcelName || '').toLowerCase().includes(s) ||
                (payment.receiverName || '').toLowerCase().includes(s) ||
                (payment.trackingId || '').toLowerCase().includes(s) ||
                (payment.transactionId || '').toLowerCase().includes(s)
            );
        });

    // Stats
    const totalPayments = payments.length;
    const totalRevenue = payments.reduce((sum, p) => sum + (p.totalPrice || p.amount || 0), 0);
    const uniqueCustomers = new Set(payments.map(p => p.customerEmail)).size;
    const todayCount = payments.filter(p => {
        if (!p.paidAt) return false;
        const today = new Date();
        const paid = new Date(p.paidAt);
        return paid.toDateString() === today.toDateString();
    }).length;

    const handleViewDetails = (payment) => {
        Swal.fire({
            title: '💳 Payment Details',
            html: `
                <div style="text-align:left;line-height:2;background:#f9fafb;padding:20px;border-radius:10px;">
                    <div style="border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:12px;">
                        <p><strong style="color:#065f46;">Parcel Name:</strong> ${payment.parcelName || 'N/A'}</p>
                        <p><strong style="color:#065f46;">Parcel Type:</strong> ${payment.parcelType === 'document' ? 'Document' : 'Non-Document'}</p>
                    </div>
                    <div style="border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:12px;">
                        <p><strong style="color:#0369a1;">Customer Email:</strong> ${payment.customerEmail || 'N/A'}</p>
                        <p><strong style="color:#0369a1;">Receiver Name:</strong> ${payment.receiverName || 'N/A'}</p>
                        <p><strong style="color:#0369a1;">Receiver Phone:</strong> ${payment.receiverPhone || 'N/A'}</p>
                        <p><strong style="color:#0369a1;">Receiver Address:</strong> ${payment.receiverAddress || 'N/A'}</p>
                    </div>
                    <div style="border-bottom:1px solid #e5e7eb;padding-bottom:12px;margin-bottom:12px;">
                        <p><strong style="color:#7c2d12;">Tracking ID:</strong> <span style="font-family:monospace;background:#fff3e0;padding:4px 10px;border-radius:6px;">${payment.trackingId || 'N/A'}</span></p>
                        <p><strong style="color:#7c2d12;">Transaction ID:</strong> <span style="font-family:monospace;font-size:11px;">${payment.transactionId || 'N/A'}</span></p>
                    </div>
                    <div>
                        <p><strong>Amount Paid:</strong> <span style="font-size:20px;color:#15803d;font-weight:bold;">৳${payment.totalPrice || payment.amount || 0}</span></p>
                        <p><strong>Status:</strong> <span style="background:#d1fae5;color:#065f46;padding:4px 10px;border-radius:6px;font-weight:bold;">PAID</span></p>
                        <p><strong>Paid On:</strong> ${payment.paidAt ? new Date(payment.paidAt).toLocaleString('en-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                    </div>
                </div>
            `,
            confirmButtonColor: '#059669',
            confirmButtonText: 'Close',
            width: '550px',
        });
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 dark:bg-[#060a14] dark:from-[#060a14] dark:to-[#060a14] p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                            💳 Payment History
                        </h1>
                        <p className="text-gray-500 dark:text-slate-400 mt-1">All payments across all users — updates every 15s</p>
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={isFetching}
                        className="btn btn-sm bg-teal-600 hover:bg-teal-700 text-white border-none gap-2"
                    >
                        {isFetching ? <span className="loading loading-spinner loading-xs"></span> : '🔄'}
                        {isFetching ? 'Refreshing...' : 'Refresh Now'}
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-[#0b1120] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/60 p-5 border-l-4 border-l-emerald-500">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Payments</p>
                        <p className="text-3xl font-black text-emerald-600 mt-1">{totalPayments}</p>
                    </div>
                    <div className="bg-white dark:bg-[#0b1120] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/60 p-5 border-l-4 border-l-lime-500">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Revenue</p>
                        <p className="text-2xl font-black text-lime-700 dark:text-lime-400 mt-1">৳{totalRevenue.toLocaleString()}</p>
                    </div>
                    <div className="bg-white dark:bg-[#0b1120] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/60 p-5 border-l-4 border-l-blue-500">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Unique Customers</p>
                        <p className="text-3xl font-black text-blue-600 mt-1">{uniqueCustomers}</p>
                    </div>
                    <div className="bg-white dark:bg-[#0b1120] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/60 p-5 border-l-4 border-l-purple-500">
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Paid Today</p>
                        <p className="text-3xl font-black text-purple-600 mt-1">{todayCount}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white dark:bg-[#0b1120] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/60 p-5 mb-6">
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Search Payments</label>
                    <input
                        type="text"
                        placeholder="Search by email, parcel name, receiver, tracking ID or transaction ID..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-3 text-sm border-2 border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-teal-500 transition text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-800/60 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <span className="loading loading-spinner loading-lg text-teal-600"></span>
                            <p className="text-slate-500 dark:text-slate-400 mt-3">Loading all payments...</p>
                        </div>
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/60 rounded-xl p-6 text-center">
                        <p className="text-red-700 dark:text-red-400 font-semibold">
                            ⚠️ Failed to load payments.{' '}
                            <button onClick={() => refetch()} className="underline">Try again</button>
                        </p>
                    </div>
                )}

                {/* Table */}
                {!isLoading && !isError && (
                    <>
                        <div className="mb-4 flex items-center gap-2">
                            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Showing <strong className="text-slate-800 dark:text-slate-200">{filteredPayments.length}</strong> of <strong className="text-slate-800 dark:text-slate-200">{totalPayments}</strong> payments
                            </span>
                            {isFetching && <span className="text-xs text-teal-600 font-semibold animate-pulse">● Updating...</span>}
                        </div>

                        {filteredPayments.length === 0 ? (
                            <div className="bg-white dark:bg-[#0b1120] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/60 p-12 text-center">
                                <p className="text-4xl mb-3">💸</p>
                                <p className="text-slate-500 dark:text-slate-400 text-lg">No payments found</p>
                                <p className="text-slate-400 dark:text-slate-500 mt-1 text-sm">Payments will appear here as users complete checkout</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Desktop Table View */}
                                <div className="hidden lg:block bg-white dark:bg-[#0b1120] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700/60 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-800 dark:to-slate-900 text-white">
                                                    <th className="px-5 py-4 text-left font-semibold">#</th>
                                                    <th className="px-5 py-4 text-left font-semibold">Parcel Info</th>
                                                    <th className="px-5 py-4 text-left font-semibold">Customer</th>
                                                    <th className="px-5 py-4 text-left font-semibold">Receiver</th>
                                                    <th className="px-5 py-4 text-left font-semibold">Tracking ID</th>
                                                    <th className="px-5 py-4 text-right font-semibold">Amount</th>
                                                    <th className="px-5 py-4 text-center font-semibold">Status</th>
                                                    <th className="px-5 py-4 text-center font-semibold">Paid On</th>
                                                    <th className="px-5 py-4 text-center font-semibold">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                                                {filteredPayments.map((payment, index) => (
                                                    <tr key={payment._id || index} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors bg-white dark:bg-[#0b1120]">
                                                        <td className="px-5 py-4 text-slate-400 dark:text-slate-500 font-mono text-xs">{index + 1}</td>
                                                        <td className="px-5 py-4">
                                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{payment.parcelName || 'N/A'}</p>
                                                            <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">{payment.parcelType || 'N/A'}</p>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium">{payment.customerEmail || 'N/A'}</p>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <p className="font-semibold text-slate-800 dark:text-slate-200">{payment.receiverName || 'N/A'}</p>
                                                            <p className="text-xs text-slate-500 dark:text-slate-500">{payment.receiverPhone || ''}</p>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="font-mono text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-300 px-2 py-1 rounded">
                                                                {payment.trackingId || 'N/A'}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 text-right">
                                                            <span className="text-lg font-black text-lime-700 dark:text-lime-400">৳{payment.totalPrice || payment.amount || 0}</span>
                                                        </td>
                                                        <td className="px-5 py-4 text-center">
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                                                                ✅ Paid
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
                                                            {payment.paidAt
                                                                ? new Date(payment.paidAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })
                                                                : 'N/A'}
                                                        </td>
                                                        <td className="px-5 py-4 text-center">
                                                            <button
                                                                onClick={() => handleViewDetails(payment)}
                                                                className="btn btn-xs bg-teal-600 hover:bg-teal-700 text-white border-none"
                                                            >
                                                                View
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Table Footer */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700/60 px-5 py-3 flex justify-between items-center">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">{filteredPayments.length} payments shown</span>
                                        <span className="text-sm font-bold text-lime-700 dark:text-lime-400">
                                            Total: ৳{filteredPayments.reduce((s, p) => s + (p.totalPrice || p.amount || 0), 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Mobile/Tablet Stacked Cards View */}
                                <div className="block lg:hidden space-y-4">
                                    {filteredPayments.map((payment, index) => (
                                        <div key={payment._id || index} className="bg-white dark:bg-[#0b1120] rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm p-5 space-y-4">
                                            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700/60">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <span className="font-mono text-xs bg-slate-100 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                                                        {payment.trackingId || 'N/A'}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                                    {payment.paidAt
                                                        ? new Date(payment.paidAt).toLocaleDateString('en-BD', { day: 'numeric', month: 'short', year: 'numeric' })
                                                        : 'N/A'}
                                                </span>
                                            </div>

                                            <div className="space-y-1">
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{payment.parcelName || 'N/A'}</h4>
                                                <p className="text-xs text-slate-400 dark:text-slate-500 capitalize">Type: {payment.parcelType || 'N/A'}</p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl text-xs space-y-2 sm:space-y-0">
                                                <div>
                                                    <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px]">Customer</p>
                                                    <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate">{payment.customerEmail || 'N/A'}</p>
                                                </div>
                                                <div className="sm:border-l sm:border-slate-200 dark:sm:border-slate-700/60 sm:pl-3">
                                                    <p className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[9px]">Receiver</p>
                                                    <p className="font-semibold text-slate-700 dark:text-slate-300 mt-0.5 truncate">{payment.receiverName || 'N/A'}</p>
                                                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">{payment.receiverPhone || ''}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Amount Paid</p>
                                                    <p className="text-lg font-black text-lime-700 dark:text-lime-400 mt-0.5">৳{payment.totalPrice || payment.amount || 0}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300">
                                                        ✅ Paid
                                                    </span>
                                                    <button
                                                        onClick={() => handleViewDetails(payment)}
                                                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer border-none"
                                                    >
                                                        View Details
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Mobile/Tablet Total Card */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 p-4 flex justify-between items-center text-sm font-semibold">
                                        <span className="text-slate-500 dark:text-slate-400">{filteredPayments.length} payments shown</span>
                                        <span className="text-lime-700 dark:text-lime-400 font-bold">
                                            Total: ৳{filteredPayments.reduce((s, p) => s + (p.totalPrice || p.amount || 0), 0).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminPaymentHistory;
