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
    switch (status) {
      case 'pending': return <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider uppercase bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md text-[10px] border border-blue-200/50 dark:border-blue-800/50 shadow-sm flex inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Pending</span>;
      case 'driver_accepted': return <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-md text-[10px] border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm">Accepted</span>;
      case 'picked-up': return <span className="text-purple-600 dark:text-purple-400 font-bold tracking-wider uppercase bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1 rounded-md text-[10px] border border-purple-200/50 dark:border-purple-800/50 shadow-sm">Picked Up</span>;
      case 'on_the_way': return <span className="text-amber-600 dark:text-amber-400 font-bold tracking-wider uppercase bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-md text-[10px] border border-amber-200/50 dark:border-amber-800/50 shadow-sm">On The Way</span>;
      case 'delivered': return <span className="text-green-600 dark:text-green-400 font-bold tracking-wider uppercase bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-md text-[10px] border border-green-200/50 dark:border-green-800/50 shadow-sm">Delivered</span>;
      case 'cancelled': return <span className="text-red-600 dark:text-red-400 font-bold tracking-wider uppercase bg-red-50 dark:bg-red-900/20 px-2.5 py-1 rounded-md text-[10px] border border-red-200/50 dark:border-red-800/50 shadow-sm">Cancelled</span>;
      default: return <span className="text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px]">{status}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return (
      <div>
        <div className="font-medium text-slate-800 dark:text-slate-200">{d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    );
  };

  return (
    <div className="overflow-hidden flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left border-collapse flex-shrink-0">
        <thead className="bg-slate-50/95 dark:bg-slate-900/95">
          <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            <th className="p-3 sm:p-4 min-w-max text-[11px] sm:text-xs">Parcel ID</th>
            <th className="p-3 sm:p-4 min-w-max text-[11px] sm:text-xs hidden sm:table-cell">Sender</th>
            <th className="p-3 sm:p-4 min-w-max text-[11px] sm:text-xs">Status</th>
            <th className="p-3 sm:p-4 min-w-max text-[11px] sm:text-xs hidden lg:table-cell">Rider</th>
            <th className="p-3 sm:p-4 min-w-max text-[11px] sm:text-xs hidden xl:table-cell">Assigned</th>
            <th className="p-3 sm:p-4 min-w-max text-[11px] sm:text-xs hidden 2xl:table-cell">Est. Del.</th>
            <th className="p-3 sm:p-4 min-w-max text-[11px] sm:text-xs hidden sm:table-cell">Payment</th>
            <th className="p-3 sm:p-4 text-center min-w-max text-[11px] sm:text-xs">Action</th>
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
                  <td className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
                        📦
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm tracking-wide">{req.trackingId}</div>
                        <div className="text-slate-700 dark:text-slate-300 text-xs mt-0.5 tracking-wide uppercase font-medium">{req.receiverName || req.parcelType}</div>
                        <div className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{req.parcelWeight} kg · Fee: ৳{req.deliveryFee || 0}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{req.senderName}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-1">{req.senderPhone}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{req.senderDistrict}</div>
                  </td>
                  <td className="p-4 align-top">
                    {getStatusBadge(req.status)}
                    {req.status === 'pending' && (
                      <div className="flex items-center gap-1 text-xs text-red-500 dark:text-red-450 font-medium mt-1">
                        <MdAccessTime /> Waiting for rider
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-top">
                    {req.assignedRider ? (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-150 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
                          {req.assignedRiderPhoto ? (
                             <img src={req.assignedRiderPhoto} alt="Rider" className="w-full h-full object-cover" />
                          ) : (
                             <MdPerson className="text-slate-500 dark:text-slate-400 w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-wide">{req.assignedRiderName || 'Rider'}</div>
                          <div className="text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-550 dark:bg-emerald-400 animate-pulse"></span>
                            Online
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 text-xs tracking-wider uppercase font-semibold">— Not assigned</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-350 align-top">
                    {formatDate(req.assignedAt || req.createdAt)}
                  </td>
                  <td className="p-4 text-sm text-slate-700 dark:text-slate-350 align-top">
                    {formatDate(req.requestedDeliveryDate)}
                  </td>
                  <td className="p-4 align-top">
                    <div className={req.paymentStatus === 'Paid' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-500'}>
                      <div className="text-sm font-bold tracking-wide uppercase">{req.paymentStatus || 'Unpaid'}</div>
                      <div className="text-xs font-semibold mt-1 text-slate-500 dark:text-slate-400">Total: <span className="font-bold text-slate-800 dark:text-slate-200">৳{req.totalPrice}</span></div>
                    </div>
                  </td>
                  <td className="p-4 text-center align-top">
                    <button 
                      onClick={() => onViewDetails && onViewDetails(req)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 border border-slate-200 dark:border-slate-700 transition-all duration-200 shadow-sm hover:shadow"
                      title="View full details"
                    >
                      <MdRemoveRedEye className="w-4 h-4" />
                    </button>
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
