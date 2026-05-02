import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id') || '';
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();

    console.log('Payment success page loaded with session ID:', sessionId);

    useEffect(() => {
        if (sessionId) {
            // Verify the session ID with the backend
            axiosSecure.patch(`/payment-success?session_id=${sessionId}`)
                .then(response => {
                    console.log('Payment success confirmed by backend:', response.data);
                })
                .catch(error => {
                    console.error('Error confirming payment:', error);
                });
        }
    }, [sessionId, axiosSecure]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center">
                {/* Animated checkmark */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Successful!</h1>
                <p className="text-slate-500 mb-4">
                    Your parcel payment was completed successfully. You can track your parcel from the dashboard.
                </p>

                {sessionId && (
                    <div className="bg-slate-50 rounded-lg p-4 mb-6">
                        <p className="text-xs text-slate-600 mb-1">Session ID:</p>
                        <p className="text-sm font-mono text-slate-800 break-all">{sessionId}</p>
                    </div>
                )}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate('/dashboard/my-parcels')}
                        className="btn bg-lime-600 hover:bg-lime-700 border-0 text-white w-full"
                    >
                        View My Parcels
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="btn btn-outline border-slate-300 text-slate-700 w-full"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
