import React from 'react';
import { motion } from 'framer-motion';
import { MdRemoveRedEye, MdAccessTime, MdPerson } from 'react-icons/md';

const RequestTable = ({ requests, isLoading, onViewDetails }) => {
  if (isLoading) {
    return (
      <div className="p-4 flex justify-center py-20">
        <span className="loading loading-spinner text-emerald-500 loading-lg"></span>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const baseClass = "px-2.5 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-sm whitespace-nowrap inline-flex items-center justify-center gap-1.5 w-max";
    switch (status) {
      case 'pending': case 'pending_rider': case 'pending_rider_response':
        return <span className={`text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border-blue-200/50 dark:border-blue-800/50 ${baseClass}`}><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Pending Pickup</span>;
      case 'driver_accepted': case 'accepted': 
        return <span className={`text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/50 dark:border-emerald-800/50 ${baseClass}`}>Accepted</span>;
      case 'picked-up': case 'picked_up': 
        return <span className={`text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 border-purple-200/50 dark:border-purple-800/50 ${baseClass}`}>Picked Up</span>;
      case 'on_the_way': 
        return <span className={`text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200/50 dark:border-amber-800/50 ${baseClass}`}>On The Way</span>;
      case 'delivered': 
        return <span className={`text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200/50 dark:border-green-800/50 ${baseClass}`}>Delivered</span>;
      case 'cancelled': 
        return <span className={`text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200/50 dark:border-red-800/50 ${baseClass}`}>Cancelled</span>;
      default: 
        return <span className={`text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${baseClass}`}>{status}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return <span className="text-slate-400 dark:text-slate-500 font-medium">—</span>;
    const d = new Date(dateStr);
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap">{d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    );
  };

  return (
    <div className="overflow-hidden flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left border-collapse flex-shrink-0">
        <thead className="bg-slate-50/80 dark:bg-slate-800/80">
          <tr className="border-b border-slate-200 dark:border-slate-800/80 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
            <th className="py-4 px-5 text-left whitespace-nowrap w-24">Parcel ID</th>
            <th className="py-4 px-15 text-middle whitespace-nowrap w-40">Sender</th>
            <th className="py-4 px-5 text-wrap whitespace-nowrap w-40">Receiver</th>
            <th className="py-4 px-5 text-left whitespace-nowrap w-40">Assigned</th>
            <th className="py-4 px-5 text-center whitespace-nowrap w-32">Status</th>
            <th className="py-4 px-5 text-center whitespace-nowrap w-32">Delivery Date</th>
            <th className="py-4 px-5 text-center whitespace-nowrap w-24">Payment</th>
            <th className="py-4 px-5 text-center whitespace-nowrap w-20">Action</th>
          </tr>
        </thead>
      </table>
      <div className="overflow-x-auto overflow-y-auto max-h-[65vh] min-h-96 flex-1 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
        <table className="w-full text-left border-collapse min-w-full">
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-slate-500 dark:text-slate-400">
                  No requests found matching your filters.
                </td>
              </tr>
            ) : (
              requests.map((req, index) => (
              <motion.tr
                key={req.trackingId || req._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-default"
              >
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-900 dark:text-white text-sm whitespace-nowrap">{req.trackingId}</div>
                    <div className="text-slate-600 dark:text-slate-400 text-xs font-medium mt-1 truncate max-w-[150px]">{req.parcelName || 'Unnamed Parcel'}</div>
                    <div className="text-slate-400 dark:text-slate-500 text-[11px] font-medium mt-0.5 whitespace-nowrap">{req.parcelWeight} kg {req.deliveryFee ? `· ৳${req.deliveryFee}` : ''}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{req.senderName}</div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap">{req.senderPhone}</div>
                    <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 whitespace-nowrap truncate max-w-[150px]">{req.senderDistrict}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{req.receiverName}</div>
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 whitespace-nowrap">{req.receiverPhone}</div>
                    <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 whitespace-nowrap truncate max-w-[150px]">{req.receiverDistrict}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    {req.riderEmail || req.assignedRider ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                          {req.assignedRiderPhoto ? (
                             <img src={req.assignedRiderPhoto} alt="Rider" className="w-full h-full object-cover rounded-full" />
                          ) : (
                             <MdPerson className="text-slate-400 dark:text-slate-500 w-4 h-4" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">{req.riderName || req.assignedRiderName || 'Rider'}</span>
                          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 whitespace-nowrap truncate max-w-[150px]">{req.riderPhone || req.assignedRiderPhone || req.riderEmail}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center text-slate-400 dark:text-slate-500 text-[10px] tracking-widest uppercase font-bold whitespace-nowrap px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700/60">— Not assigned</span>
                    )}
                  </td>
                  <td className="py-4 px-5 align-middle text-center">
                    <div className="flex flex-col items-center justify-center">
                       {getStatusBadge(req?.deliveryStatus || req?.status)}
                       {(req?.deliveryStatus || req?.status) === 'pending' && (
                         <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold tracking-wider text-red-500 dark:text-red-450 mt-1.5 whitespace-nowrap">
                           <MdAccessTime className="w-3 h-3" /> Waiting...
                         </div>
                       )}
                    </div>
                  </td>
                  <td className="py-4 px-5 align-middle text-center">
                    {((req?.deliveryStatus || req?.status) === 'delivered' && req.deliveredAt) ? (
                      formatDate(req.deliveredAt)
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-medium">—</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-center align-middle">
                    {(req.paymentStatus || '').toLowerCase() === 'paid' ? (
                      <span className="inline-flex px-2.5 py-1 font-bold text-[10px] uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/50 dark:border-emerald-500/20 rounded-md shadow-sm">Paid</span>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 font-bold text-[10px] uppercase tracking-widest text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20 rounded-md shadow-sm">Unpaid</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-center align-middle">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => onViewDetails && onViewDetails(req)}
                        className="p-2 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 text-slate-400 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-200 shadow-sm"
                        title="View full details"
                      >
                        <MdRemoveRedEye className="w-[18px] h-[18px]" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestTable;
