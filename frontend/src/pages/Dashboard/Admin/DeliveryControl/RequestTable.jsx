import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdRemoveRedEye, MdAccessTime, MdPerson } from 'react-icons/md';

const RequestTable = ({ requests, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-4 flex justify-center py-20">
        <span className="loading loading-spinner text-emerald-500 loading-lg"></span>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="text-blue-400 font-medium">Pending Acceptance</span>;
      case 'driver_accepted': return <span className="text-emerald-400 font-medium">Accepted</span>;
      case 'picked-up': return <span className="text-purple-400 font-medium">Picked Up</span>;
      case 'on_the_way': return <span className="text-amber-400 font-medium">On The Way</span>;
      case 'delivered': return <span className="text-green-400 font-medium">Delivered</span>;
      case 'cancelled': return <span className="text-red-400 font-medium">Cancelled</span>;
      default: return <span className="text-slate-400 font-medium">{status}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return (
      <div>
        <div>{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <div className="text-xs text-slate-500">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto min-h-[400px]">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-[#0F172A]/50">
            <th className="p-4">Parcel / Receiver</th>
            <th className="p-4">Sender</th>
            <th className="p-4">Status</th>
            <th className="p-4">Rider</th>
            <th className="p-4">Assigned At</th>
            <th className="p-4">Est. Delivery</th>
            <th className="p-4">Payment</th>
            <th className="p-4 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {requests.length === 0 ? (
              <motion.tr
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <td colSpan="8" className="p-8 text-center text-slate-500">
                  No requests found matching your filters.
                </td>
              </motion.tr>
            ) : (
              requests.map((req, index) => (
                <motion.tr
                  key={req.trackingId || req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors group"
                >
                  <td className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center flex-shrink-0">
                        📦
                      </div>
                      <div>
                        <div className="font-medium text-slate-200 text-sm">{req.trackingId}</div>
                        <div className="text-slate-400 text-xs mt-0.5">{req.receiverName || req.parcelType}</div>
                        <div className="text-slate-500 text-xs">{req.parcelWeight} kg</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-200">{req.senderName}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{req.senderPhone}</div>
                    <div className="text-xs text-slate-500">{req.senderDistrict}</div>
                  </td>
                  <td className="p-4 text-sm">
                    {getStatusBadge(req.status)}
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-1 text-xs text-red-400 mt-1">
                        <MdAccessTime /> Waiting for rider
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    {req.assignedRider ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                          <MdPerson className="text-slate-400" />
                        </div>
                        <div>
                          <div className="text-sm text-slate-200">{req.assignedRiderName || 'Rider'}</div>
                          <div className="text-xs text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                            Online
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-sm">— Not assigned</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    {formatDate(req.assignedAt || req.createdAt)}
                  </td>
                  <td className="p-4 text-sm text-slate-300">
                    {formatDate(req.requestedDeliveryDate)}
                  </td>
                  <td className="p-4">
                    <div className={req.paymentStatus === 'Paid' ? 'text-emerald-400' : 'text-amber-400'}>
                      <div className="text-sm font-medium">{req.paymentStatus || 'Unpaid'}</div>
                      <div className="text-xs">৳{req.totalPrice}</div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors">
                      <MdRemoveRedEye className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
};

export default RequestTable;
