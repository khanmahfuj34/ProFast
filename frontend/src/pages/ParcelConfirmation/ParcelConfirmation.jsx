import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParcel } from '../../hooks/useParcel';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';
import ProFastLogo from '../Home/shared/ProFastLogo/ProFastLogo';

const ParcelConfirmation = () => {
  const navigate = useNavigate();
  const { parcelData } = useParcel();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [isProcessing, setIsProcessing] = useState(false);

  // Block navigation
  useEffect(() => {
    // Prevent back button
    const handleBackButton = () => {
      if (!isProcessing) {
        window.history.pushState(null, null, window.location.href);
      }
    };
    
    window.history.pushState(null, null, window.location.href);
    window.addEventListener('popstate', handleBackButton);

    // Prevent page refresh
    const handleBeforeUnload = (e) => {
      if (isProcessing) return;
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isProcessing]);

  if (!parcelData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Parcel Data Found</h1>
          <p className="text-gray-600 mb-6">Please complete the parcel form first.</p>
          <button
            onClick={() => navigate('/send-parcel')}
            className="px-6 py-3 bg-lime-500 text-white font-semibold rounded-lg hover:bg-lime-600 transition"
          >
            Back to Form
          </button>
        </div>
      </div>
    );
  }

  const {
    parcelType,
    parcelName,
    weight,
    senderName,
    senderAddress,
    senderPhone,
    senderDistrict,
    pickupInstruction,
    receiverName,
    receiverAddress,
    receiverPhone,
    receiverDistrict,
    deliveryInstruction,
    deliveryType,
    basePrice,
    extraCharges,
    totalPrice,
    _id
  } = parcelData;

  // Use actual database _id
  const orderId = _id || 'PF-' + Date.now();

  // Handle Payment with Stripe
  const handlePaymentWithStripe = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    try {
      const paymentDetails = {
        parcelId: orderId,
        cost: totalPrice,
        parcelName: parcelName,
        senderEmail: user?.email,
      };

      const res = await axiosSecure.post('/create-payment-intent', paymentDetails);
      
      if (res.data?.url) {
        // Store session ID before redirecting
        localStorage.setItem('stripeSessionId', res.data.sessionId);
        // Redirect to Stripe checkout
        window.location.href = res.data.url;
      } else {
        throw new Error('Could not get payment URL');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Swal.fire(
        'Payment Failed',
        error.response?.data?.error || 'Something went wrong. Please try again.',
        'error'
      );
      setIsProcessing(false);
    }
  };

  // Handle Cancel Payment
  const handleCancelPayment = () => {
    Swal.fire({
      title: 'Cancel Payment?',
      text: 'Are you sure you want to cancel this payment?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Continue'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mb-4">
            <ProFastLogo />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Parcel Confirmation</h1>
          <p className="text-gray-600 mt-2">Your order has been successfully created</p>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Order ID: <span className="font-semibold text-gray-900">{orderId}</span></p>
            <p className="text-sm text-gray-500">Date: {new Date().toLocaleDateString('en-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Parcel Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 Parcel Information</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700">Parcel Type</p>
                <p className="text-gray-900 font-semibold">{parcelType === 'document' ? 'Document' : 'Non-Document'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Parcel Name</p>
                <p className="text-gray-900 font-semibold">{parcelName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Weight</p>
                <p className="text-gray-900 font-semibold">{weight} KG</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Delivery Type</p>
                <p className="text-gray-900 font-semibold">{deliveryType === 'within-city' ? 'Within City' : 'Outside City/District'}</p>
              </div>
            </div>
          </div>

          {/* Sender Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">👤 Sender Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="text-gray-900 font-semibold">{senderName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-gray-900 font-semibold">{senderPhone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Address</p>
                <p className="text-gray-900 font-semibold">{senderAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">District</p>
                <p className="text-gray-900 font-semibold">{senderDistrict}</p>
              </div>
            </div>
            {pickupInstruction && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700">Pickup Instruction</p>
                <p className="text-gray-900 mt-2">{pickupInstruction}</p>
              </div>
            )}
          </div>

          {/* Receiver Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">📬 Receiver Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="text-gray-900 font-semibold">{receiverName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Phone</p>
                <p className="text-gray-900 font-semibold">{receiverPhone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Address</p>
                <p className="text-gray-900 font-semibold">{receiverAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">District</p>
                <p className="text-gray-900 font-semibold">{receiverDistrict}</p>
              </div>
            </div>
            {deliveryInstruction && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-700">Delivery Instruction</p>
                <p className="text-gray-900 mt-2">{deliveryInstruction}</p>
              </div>
            )}
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-lime-50 to-green-50 rounded-xl shadow-sm border border-lime-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">💰 Pricing Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Base Delivery Charge</span>
                <span className="text-gray-900 font-semibold">৳{basePrice}</span>
              </div>
              {extraCharges > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium">Extra Charges</span>
                  <span className="text-gray-900 font-semibold">৳{extraCharges}</span>
                </div>
              )}
              <div className="border-t-2 border-lime-300 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Price</span>
                  <span className="text-3xl font-bold text-lime-600">৳{totalPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div>
                <p className="font-semibold text-gray-900">Pickup Scheduled</p>
                <p className="text-sm text-gray-600 mt-1">Your parcel will be picked up between <strong>4 PM – 7 PM (approx)</strong></p>
              </div>
            </div>
          </div>

          {/* Payment Warning Box */}
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-gray-900">Payment Required</p>
                <p className="text-sm text-gray-600 mt-1">Please complete the payment to confirm your parcel delivery. You must stay on this page or your payment will be cancelled.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons - Stripe Payment */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handlePaymentWithStripe}
              disabled={isProcessing}
              className={`px-8 py-4 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  Processing...
                </>
              ) : (
                '💳 Pay with Stripe'
              )}
            </button>
            <button
              onClick={handleCancelPayment}
              disabled={isProcessing}
              className={`px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              ✕ Cancel Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParcelConfirmation;
