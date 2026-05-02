import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-rose-100 flex items-center justify-center px-4">
            <div className="bg-white rounded-3xl shadow-xl p-10 max-w-2xl w-full">
                {/* Error icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">Payment Cancelled</h1>
                    <p className="text-slate-600">
                        Your payment was not completed. You can try again or go back to your parcels.
                    </p>
                </div>

                {/* Error Info */}
                <div className="bg-red-50 rounded-lg p-6 mb-8 border border-red-200">
                    <p className="text-sm text-red-800">
                        <strong>⚠️ What happened?</strong> You cancelled the payment or it was declined. Please try again or contact support if you need help.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="btn bg-lime-600 hover:bg-lime-700 border-0 text-white w-full font-semibold"
                    >
                        🔄 Try Again
                    </button>
                    <button
                        onClick={() => navigate('/dashboard/my-parcels')}
                        className="btn btn-outline border-slate-300 text-slate-700 hover:border-slate-400 w-full font-semibold"
                    >
                        📦 Back to My Parcels
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="btn btn-ghost w-full font-semibold"
                    >
                        🏠 Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailed;
