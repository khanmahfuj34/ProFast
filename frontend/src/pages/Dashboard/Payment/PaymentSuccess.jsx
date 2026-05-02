import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id') || '';
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const [paymentData, setPaymentData] = useState(null);
    const [loading, setLoading] = useState(true);

    console.log('Payment success page loaded with session ID:', sessionId);

    useEffect(() => {
        if (sessionId) {
            // Verify the session ID with the backend and get payment details
            axiosSecure.patch(`/payment-success?session_id=${sessionId}`)
                .then(response => {
                    console.log('Payment success confirmed by backend:', response.data);
                    setPaymentData(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error confirming payment:', error);
                    setLoading(false);
                });
        }
    }, [sessionId, axiosSecure]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-xl p-10 max-w-2xl w-full">
                {/* Animated checkmark */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Successful!</h1>
                    <p className="text-slate-600">
                        Your parcel payment was completed successfully. You can track your parcel from the dashboard.
                    </p>
                </div>

                {/* Payment Details */}
                {loading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-600"></div>
                    </div>
                ) : paymentData ? (
                    <div className="space-y-4 mb-8">
                        {/* Tracking ID */}
                        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-200">
                            <p className="text-xs font-semibold text-emerald-700 mb-2">📦 Tracking ID</p>
                            <p className="text-lg font-mono font-bold text-emerald-900 break-all">{paymentData.trackingId || 'N/A'}</p>
                            <p className="text-xs text-emerald-600 mt-2">Use this ID to track your parcel</p>
                        </div>

                        {/* Transaction ID */}
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                            <p className="text-xs font-semibold text-blue-700 mb-2">💳 Transaction ID</p>
                            <p className="text-sm font-mono text-blue-900 break-all">{paymentData.transactionId || 'N/A'}</p>
                            <p className="text-xs text-blue-600 mt-2">Receipt reference number</p>
                        </div>

                        {/* Payment Status */}
                        <div className="bg-gradient-to-r from-lime-50 to-green-50 rounded-lg p-4 border border-lime-200">
                            <p className="text-xs font-semibold text-lime-700 mb-2">✓ Payment Status</p>
                            <p className="text-lg font-bold text-lime-900">PAID</p>
                            <p className="text-xs text-lime-600 mt-2">Amount: ৳{paymentData.modifyParcel?.totalPrice || 'N/A'}</p>
                        </div>
                    </div>
                ) : null}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/dashboard/my-parcels')}
                        className="btn bg-lime-600 hover:bg-lime-700 border-0 text-white w-full font-semibold"
                    >
                        📦 View My Parcels
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn btn-outline border-slate-300 text-slate-700 hover:border-slate-400 w-full font-semibold"
                    >
                        📊 Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
