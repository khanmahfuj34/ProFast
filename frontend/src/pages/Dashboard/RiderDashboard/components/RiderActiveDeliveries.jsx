import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MdCheckCircle, MdAccessTime, MdCancel } from 'react-icons/md';

const RiderActiveDeliveries = ({ deliveries = [], isLoading }) => {
  const navigate = useNavigate();

  const getStatusStyle = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
      case 'on_the_way':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'picked_up':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'assigned':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      default:
        return 'bg-gray-100 dark:bg-slate-700/60 text-gray-800 dark:text-slate-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <MdCheckCircle className="text-green-600 dark:text-green-400" />;
      case 'on_the_way':
        return <MdAccessTime className="text-blue-600 dark:text-blue-400" />;
      case 'picked_up':
        return <MdAccessTime className="text-purple-600 dark:text-purple-400" />;
      case 'assigned':
        return <MdAccessTime className="text-yellow-600 dark:text-yellow-400" />;
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
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold transition-colors"
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
        <div className="divide-y divide-gray-200 dark:divide-slate-700/60">
          {deliveries.slice(0, 5).map((delivery) => (
            <div
              key={delivery.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition cursor-pointer"
              onClick={() => navigate(`/dashboard/delivery/${delivery.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 dark:text-slate-200">{delivery.trackingId}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusStyle(delivery.status)}`}>
                      {delivery.status?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{delivery.receiverName}</p>
                </div>
                {getStatusIcon(delivery.status)}
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-slate-500">Pickup:</p>
                  <p className="text-gray-900 dark:text-slate-200 font-medium">{delivery.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-slate-500">Delivery:</p>
                  <p className="text-gray-900 dark:text-slate-200 font-medium">{delivery.deliveryLocation}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-slate-500">Amount:</p>
                  <p className="text-gray-900 dark:text-slate-200 font-medium">৳{delivery.amount}</p>
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
