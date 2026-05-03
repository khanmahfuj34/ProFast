import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';

const PaymentHistory = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [searchTerm, setSearchTerm] = useState('');

    const { data: payments = [], isLoading, isError } = useQuery({
        queryKey: ['payment-history', user?.email],
        queryFn: async () => {
            if (!user?.email) return [];
            const res = await axiosSecure.get('/payments');
            // Already sorted by latest first from backend
            return res.data;
        },
        enabled: !!user?.email
    });

    // Calculate filtered payments directly (derived state)
    const filteredPayments = searchTerm.trim() === '' 
        ? payments 
        : payments.filter(payment => {
            const searchLower = searchTerm.toLowerCase();
            return (
                String(payment.trackingId || '').toLowerCase().includes(searchLower) ||
                String(payment.parcelName || '').toLowerCase().includes(searchLower) ||
                String(payment.receiverName || '').toLowerCase().includes(searchLower)
            );
        });

    const handleViewDetails = (payment) => {
        Swal.fire({
            title: '📦 Payment Details',
            html: `
                <div style="text-align:left;line-height:1.8;background:#f9fafb;padding:20px;border-radius:8px;">
                    <div style="margin-bottom:15px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">
                        <p><strong style="color:#065f46;">Parcel Name:</strong> ${payment.parcelName || 'N/A'}</p>
                        <p><strong style="color:#065f46;">Parcel Type:</strong> ${payment.parcelType === 'document' ? 'Document' : 'Non-Document'}</p>
                    </div>
                    <div style="margin-bottom:15px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">
                        <p><strong style="color:#0369a1;">Receiver Name:</strong> ${payment.receiverName || 'N/A'}</p>
                        <p><strong style="color:#0369a1;">Receiver Phone:</strong> ${payment.receiverPhone || 'N/A'}</p>
                        <p><strong style="color:#0369a1;">Receiver Address:</strong> ${payment.receiverAddress || 'N/A'}</p>
                    </div>
                    <div style="margin-bottom:15px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">
                        <p><strong style="color:#7c2d12;">Tracking ID:</strong> <span style="font-family:monospace;background:#fff3e0;padding:4px 8px;border-radius:4px;">${payment.trackingId || 'N/A'}</span></p>
                    </div>
                    <div style="margin-bottom:15px;border-bottom:1px solid #e5e7eb;padding-bottom:15px;">
                        <p><strong style="color:#7c3a0f;">Total Amount:</strong> <span style="font-size:18px;color:#15803d;font-weight:bold;">৳${payment.totalPrice || 0}</span></p>
                        <p><strong style="color:#7c3a0f;">Payment Status:</strong> <span style="background:#d1fae5;color:#065f46;padding:4px 8px;border-radius:4px;font-weight:bold;">PAID</span></p>
                    </div>
                    <div>
                        <p><strong style="color:#6b7280;">Paid Date:</strong> ${payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</p>
                    </div>
                </div>
            `,
            confirmButtonColor: '#65a30d',
            confirmButtonText: 'Close'
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="loading loading-spinner loading-lg text-lime-600"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="alert alert-error max-w-4xl mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m0 0l2 2m-2-2l-2 2"></path>
                </svg>
                <span>Failed to load payment history. Please try again.</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">💳 Payment History</h1>
                    <p className="text-slate-600">View all your successfully paid parcels and their details</p>
                </div>

                {/* Search Box */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                    <div className="flex items-center gap-3">
                        <FaMagnifyingGlass className="text-slate-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Search by tracking ID, parcel name, or receiver name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 border text-base-100 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500 focus:border-lime-500 transition"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-200">
                        <p className="text-emerald-600 font-semibold mb-2">Total Paid Parcels</p>
                        <p className="text-4xl font-bold text-emerald-900">{payments.length}</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                        <p className="text-blue-600 font-semibold mb-2">Total Spent</p>
                        <p className="text-3xl font-bold text-blue-900">৳{payments.reduce((sum, p) => sum + (p.totalPrice || 0), 0)}</p>
                    </div>
                    <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-xl p-6 border border-lime-200">
                        <p className="text-lime-600 font-semibold mb-2">Showing Results</p>
                        <p className="text-3xl font-bold text-lime-900">{filteredPayments.length}</p>
                    </div>
                </div>

                {/* Table */}
                {filteredPayments.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-slate-500 text-lg">No payment history found</p>
                        <p className="text-slate-400 mt-2">Start sending parcels and complete payments to see your history</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-slate-200">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Parcel Info</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Recipient Info</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Tracking ID</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-white">Paid Amount</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-white">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.map((payment, index) => (
                                        <tr key={payment._id || index} className="border-b border-slate-200 hover:bg-slate-50 transition">
                                            {/* Parcel Info */}
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900">{payment.parcelName || 'N/A'}</p>
                                                <p className="text-sm text-slate-500">{payment.parcelType === 'document' ? 'Document' : 'Non-Document'}</p>
                                            </td>

                                            {/* Recipient Info */}
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-slate-900">{payment.receiverName || 'N/A'}</p>
                                                <p className="text-sm text-slate-600">{payment.receiverAddress || 'N/A'}</p>
                                                <p className="text-sm text-slate-500">{payment.receiverPhone || 'N/A'}</p>
                                            </td>

                                            {/* Tracking ID */}
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-sm bg-emerald-100 text-emerald-900 px-3 py-2 rounded-lg">
                                                    {payment.trackingId || 'N/A'}
                                                </span>
                                            </td>

                                            {/* Paid Amount */}
                                            <td className="px-6 py-4">
                                                <p className="text-lg font-bold text-lime-700">৳{payment.totalPrice || 0}</p>
                                                <p className="text-xs text-slate-500">Paid on {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString('en-BD') : 'N/A'}</p>
                                            </td>

                                            {/* Action */}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleViewDetails(payment)}
                                                    className="px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-lg transition transform hover:scale-105"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
