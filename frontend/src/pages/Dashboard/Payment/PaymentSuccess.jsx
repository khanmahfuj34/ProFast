import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
    const navigate = useNavigate();

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
                <p className="text-slate-500 mb-8">
                    Your parcel payment was completed successfully. You can track your parcel from the dashboard.
                </p>

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
