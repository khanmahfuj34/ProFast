import React, { useState, useEffect } from 'react';
import { RiMapPinLine, RiBox3Line, RiMoneyDollarCircleLine, RiTimeLine } from 'react-icons/ri';

const DeliveryRequestModal = ({ request, onAccept, onReject }) => {
    const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to accept

    useEffect(() => {
        if (timeLeft <= 0) {
            onReject();
            return;
        }
        const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft, onReject]);

    if (!request) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-lime-100">
                {/* Header with Timer Bar */}
                <div className="bg-lime-600 px-6 py-4 relative">
                    <div className="flex justify-between items-center text-white">
                        <h3 className="text-xl font-bold">New Delivery Request!</h3>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-mono">
                            {timeLeft}s
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 h-1 bg-lime-400 transition-all duration-1000 ease-linear" 
                         style={{ width: `${(timeLeft / 30) * 100}%` }}></div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between text-sm text-gray-500 font-medium">
                        <span>#{request.trackingId}</span>
                        <span className="flex items-center gap-1">
                            <RiTimeLine /> Just now
                        </span>
                    </div>

                    {/* Locations */}
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                                <div className="w-3 h-3 rounded-full bg-lime-500"></div>
                                <div className="w-0.5 h-10 bg-gray-200"></div>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Pickup</p>
                                <p className="text-gray-800 font-semibold">{request.pickupAddress}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-3 h-3 rounded-full border-2 border-orange-500 bg-white"></div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">Drop-off</p>
                                <p className="text-gray-800 font-semibold">{request.receiverDistrict}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                <RiBox3Line size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Parcel Name</p>
                                <p className="text-sm font-bold text-gray-800">{request.senderName}'s Parcel</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg text-green-600">
                                <RiMoneyDollarCircleLine size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Your Earning</p>
                                <p className="text-sm font-bold text-gray-800">৳{request.totalPrice}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 flex gap-3">
                    <button 
                        onClick={onReject}
                        className="flex-1 py-3 px-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        Reject
                    </button>
                    <button 
                        onClick={() => onAccept(request.parcelId)}
                        className="flex-2 py-3 px-8 bg-lime-600 text-white font-bold rounded-xl hover:bg-lime-700 transition-all shadow-md shadow-lime-200 active:scale-95"
                    >
                        Accept Request
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeliveryRequestModal;
