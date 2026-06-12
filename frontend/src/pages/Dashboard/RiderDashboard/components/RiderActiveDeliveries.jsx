import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCheckCircle, MdAccessTime, MdCancel } from 'react-icons/md';

const RiderActiveDeliveries = ({ deliveries = [], isLoading }) => {
  const navigate = useNavigate();

  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-800 dark:text-green-400';
      case 'on_the_way':
        return 'bg-blue-100 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 text-blue-800 dark:text-blue-400';
      case 'picked_up':
        return 'bg-purple-100 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30 text-purple-800 dark:text-purple-400';
      case 'driver_accepted':
      case 'accepted':
        return 'bg-amber-100 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-800 dark:text-amber-400';
      case 'driver_assigned':
      case 'assigned':
        return 'bg-yellow-100 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900/30 text-yellow-805 dark:text-yellow-405';
      default:
        return 'bg-gray-100 dark:bg-slate-700/60 text-gray-800 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <MdCheckCircle className="text-green-600 dark:text-green-400 text-lg" />;
      case 'on_the_way':
        return <MdAccessTime className="text-blue-600 dark:text-blue-400 text-lg" />;
      case 'picked_up':
        return <MdAccessTime className="text-purple-600 dark:text-purple-400 text-lg" />;
      case 'driver_accepted':
      case 'accepted':
      case 'driver_assigned':
      case 'assigned':
        return <MdAccessTime className="text-amber-500 dark:text-amber-400 text-lg" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-[#0b1120] rounded-xl border border-gray-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/60 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Active Deliveries</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{deliveries.length} assignments</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/assigned-deliveries')}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors cursor-pointer"
        >
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <span className="loading loading-spinner loading-lg text-blue-500"></span>
        </div>
      ) : deliveries.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-gray-600 dark:text-slate-400 font-medium">No Active Deliveries</p>
          <p className="text-gray-500 dark:text-slate-500 text-sm mt-1">Check back soon for new assignments.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {deliveries.slice(0, 5).map((delivery) => (
            <div
              key={delivery.id}
              className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition duration-200 cursor-pointer"
              onClick={() => navigate(`/dashboard/delivery/${delivery.id}`)}
            >
              {/* Top Row: Tracking, Parcel Info, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-xl flex-shrink-0 mt-0.5">
                    📦
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 dark:text-slate-100 text-sm tracking-wide">
                        {delivery.trackingId}
                      </h3>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full border ${getStatusStyle(delivery.statusRaw)}`}>
                        {delivery.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mt-0.5">
                      {delivery.name} • {delivery.category} • {delivery.weight}
                    </p>
                  </div>
                </div>

                {/* Price and Payment Status */}
                <div className="flex items-center gap-3 sm:text-right sm:flex-col sm:gap-1">
                  <span className="text-base font-black text-emerald-600 dark:text-emerald-500">
                    ৳{delivery.totalPrice}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${delivery.paymentStatus === 'paid'
                      ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                      : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-700 dark:text-amber-400'
                    }`}>
                    {delivery.paymentStatus === 'paid' ? 'PREPAID' : 'COD'}
                  </span>
                </div>
              </div>

              {/* Middle Section: Route & Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Pickup / Sender Info */}
                <div className="bg-gray-50/50 dark:bg-[#111827]/40 rounded-xl p-3 border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="text-[9px] font-bold text-amber-600 dark:text-amber-500 tracking-wider uppercase mb-1">
                      ● Pickup (Sender)
                    </div>
                    <p className="font-bold text-gray-800 dark:text-slate-200">
                      {delivery.senderName}
                    </p>
                    <p className="text-gray-500 dark:text-slate-400 font-mono mt-0.5">
                      {delivery.senderPhone}
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-slate-300 mt-2 leading-relaxed">
                    <span className="font-bold text-gray-700 dark:text-slate-200">{delivery.pickup}</span>
                    {delivery.pickupAddress ? `, ${delivery.pickupAddress}` : ''}
                  </p>
                </div>

                {/* Delivery / Receiver Info */}
                <div className="bg-gray-50/50 dark:bg-[#111827]/40 rounded-xl p-3 border border-gray-100 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-500 tracking-wider uppercase mb-1">
                      ● Delivery (Receiver)
                    </div>
                    <p className="font-bold text-gray-800 dark:text-slate-200">
                      {delivery.receiverName}
                    </p>
                    <p className="text-gray-500 dark:text-slate-400 font-mono mt-0.5">
                      {delivery.receiverPhone}
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-slate-300 mt-2 leading-relaxed">
                    <span className="font-bold text-gray-700 dark:text-slate-200">{delivery.delivery}</span>
                    {delivery.deliveryAddress ? `, ${delivery.deliveryAddress}` : ''}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderActiveDeliveries;
