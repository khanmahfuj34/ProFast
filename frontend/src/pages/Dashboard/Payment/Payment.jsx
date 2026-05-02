import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const [isProcessing, setIsProcessing] = useState(false);

    const parcel = location.state?.parcel;

    // Fetch latest parcel data from DB (to check payment status)
    const { data: paymentData, isLoading, isError } = useQuery({
        queryKey: ['paymentStatus', parcel?._id],
        queryFn: async () => {
            if (!parcel?._id) return null;
            const res = await axiosSecure.get(`/parcels/${parcel._id}`);
            return res.data;
        },
        enabled: !!parcel?._id,
    });

    // Mutation: call backend → get Stripe checkout URL → redirect
    const paymentMutation = useMutation({
        mutationFn: async (paymentDetails) => {
            const res = await axiosSecure.post('/create-payment-intent', paymentDetails);
            return res.data; // { url: 'https://checkout.stripe.com/...' }
        },
        onSuccess: (data) => {
            if (data?.url && data?.sessionId) {
                // Store session ID before redirecting
                localStorage.setItem('stripeSessionId', data.sessionId);
                // Redirect to Stripe hosted checkout page
                window.location.href = data.url;
            } else {
                Swal.fire('Error', 'Could not get payment URL from server.', 'error');
            }
        },
        onError: (error) => {
            console.error('Payment error:', error);
            Swal.fire(
                'Payment Failed',
                error.response?.data?.error || 'Something went wrong. Please try again.',
                'error'
            );
        },
    });

    const handlePaymentSubmit = async () => {
        if (!parcel?._id) {
            Swal.fire('Error', 'Parcel information not found.', 'error');
            return;
        }

        setIsProcessing(true);
        try {
            const paymentDetails = {
                parcelId: parcel._id,
                cost: parcel.totalPrice,        // backend reads paymentInfo.cost
                parcelName: parcel.parcelName,
                senderEmail: user?.email,       // backend reads paymentInfo.senderEmail
            };

            paymentMutation.mutate(paymentDetails);
        } catch (error) {
            console.error('Error processing payment:', error);
            Swal.fire('Error', 'Failed to process payment. Please try again.', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!parcel) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-xl text-slate-600 mb-4">No parcel selected for payment.</p>
                    <button
                        onClick={() => navigate('/dashboard/my-parcels')}
                        className="btn btn-primary bg-lime-600 hover:bg-lime-700 border-0"
                    >
                        Back to My Parcels
                    </button>
                </div>
            </div>
        );
    }

    const currentParcel = paymentData || parcel;
    const paymentStatus = currentParcel.paymentStatus || currentParcel.payment_status || 'unpaid';
    const isPaid = paymentStatus.toLowerCase() === 'paid';

    const formatLabel = (value) =>
        value ? value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'N/A';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-slate-800">Payment</h1>
                    <p className="text-sm text-slate-500 mt-1">Complete your parcel payment via Stripe</p>
                </div>

                {isLoading && (
                    <div className="flex justify-center items-center min-h-96">
                        <div className="loading loading-spinner loading-lg text-lime-600"></div>
                    </div>
                )}

                {isError && (
                    <div className="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m0 0l2 2m-2-2l-2 2"></path>
                        </svg>
                        <span>Failed to load payment information. Please try again.</span>
                    </div>
                )}

                {!isLoading && !isError && (
                    <div className="space-y-6">
                        {/* Parcel Information Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-lime-50 to-emerald-50 px-6 py-4 border-b border-slate-200">
                                <h2 className="text-xl font-bold text-slate-800">Parcel Information</h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-sm font-semibold text-slate-600">Parcel Name</label>
                                        <p className="text-base font-medium text-slate-800 mt-1">{currentParcel.parcelName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-600">Parcel Type</label>
                                        <p className="text-base font-medium text-slate-800 mt-1">{formatLabel(currentParcel.parcelType)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-600">Delivery Type</label>
                                        <p className="text-base font-medium text-slate-800 mt-1">{formatLabel(currentParcel.deliveryType)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-slate-600">Description</label>
                                        <p className="text-base font-medium text-slate-800 mt-1">{currentParcel.parcelDescription || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sender & Receiver Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-800">Sender Information</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Name</label>
                                        <p className="text-sm font-medium text-slate-800">{currentParcel.senderName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Phone</label>
                                        <p className="text-sm font-medium text-slate-800">{currentParcel.senderPhone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
                                    <h3 className="font-bold text-slate-800">Receiver Information</h3>
                                </div>
                                <div className="p-6 space-y-3">
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Name</label>
                                        <p className="text-sm font-medium text-slate-800">{currentParcel.receiverName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Phone</label>
                                        <p className="text-sm font-medium text-slate-800">{currentParcel.receiverPhone || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Email</label>
                                        <p className="text-sm font-medium text-slate-800">{currentParcel.receiverEmail || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-600">Address</label>
                                        <p className="text-sm font-medium text-slate-800">{currentParcel.receiverAddress || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-lime-50 to-green-50 px-6 py-4 border-b border-slate-200">
                                <h3 className="font-bold text-slate-800">Payment Summary</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700 font-medium">Total Amount</span>
                                    <span className="text-2xl font-bold text-lime-700">৳{currentParcel.totalPrice ?? 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-700 font-medium">Payment Status</span>
                                    <span
                                        className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                            isPaid
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-amber-100 text-amber-700'
                                        }`}
                                    >
                                        {formatLabel(paymentStatus)}
                                    </span>
                                </div>

                                {/* Stripe info note */}
                                {!isPaid && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-2 mt-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z" />
                                        </svg>
                                        <p className="text-sm text-blue-700">
                                            You will be redirected to <strong>Stripe's secure checkout</strong> to complete the payment.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-end">
                            <button
                                onClick={() => navigate('/dashboard/my-parcels')}
                                className="btn btn-outline border-slate-300 text-slate-700 hover:border-slate-400"
                            >
                                Cancel
                            </button>

                            {!isPaid && (
                                <button
                                    onClick={handlePaymentSubmit}
                                    disabled={isProcessing || paymentMutation.isPending}
                                    className="btn bg-lime-600 hover:bg-lime-700 border-0 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isProcessing || paymentMutation.isPending ? (
                                        <>
                                            <span className="loading loading-spinner loading-sm"></span>
                                            Redirecting to Stripe...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                            Pay with Stripe
                                        </>
                                    )}
                                </button>
                            )}

                            {isPaid && (
                                <div className="alert alert-success">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                    <span>This parcel has already been paid.</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Payment;