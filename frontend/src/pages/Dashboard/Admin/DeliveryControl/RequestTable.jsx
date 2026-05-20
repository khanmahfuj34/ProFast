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
        return <span className={`text-blue-600 bg-blue-50 border-blue-200/50 ${baseClass}`}><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Pending Pickup</span>;
      case 'driver_accepted': case 'accepted': 
        return <span className={`text-emerald-600 bg-emerald-50 border-emerald-200/50 ${baseClass}`}>Accepted</span>;
      case 'picked-up': case 'picked_up': 
        return <span className={`text-purple-600 bg-purple-50 border-purple-200/50 ${baseClass}`}>Picked Up</span>;
      case 'on_the_way': 
        return <span className={`text-amber-600 bg-amber-50 border-amber-200/50 ${baseClass}`}>On The Way</span>;
      case 'delivered': 
        return <span className={`text-green-600 bg-green-50 border-green-200/50 ${baseClass}`}>Delivered</span>;
      case 'cancelled': 
        return <span className={`text-red-600 bg-red-50 border-red-200/50 ${baseClass}`}>Cancelled</span>;
      default: 
        return <span className={`text-slate-600 bg-slate-100 border-slate-200 ${baseClass}`}>{status}</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return <span className="text-slate-400 font-medium">—</span>;
    const d = new Date(dateStr);
    return (
      <div className="flex flex-col items-center justify-center">
        <div className="text-sm font-medium text-slate-700 whitespace-nowrap">{d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</div>
        <div className="text-[11px] font-medium text-slate-500 mt-0.5 whitespace-nowrap">{d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    );
  };
  return (
    <div className="w-full overflow-hidden bg-white rounded-xl border border-slate-200">
      <div className="overflow-x-auto overflow-y-auto max-h-[65vh] min-h-96 scrollbar-thin scrollbar-thumb-slate-300">
        <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
          <thead className="bg-slate-50/80 sticky top-0 z-10 backdrop-blur-sm">
            <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
              <th className="py-4 px-5 text-left whitespace-nowrap w-[12%]">Parcel ID</th>
              <th className="py-4 px-5 text-left whitespace-nowrap w-[16%]">Sender</th>
              <th className="py-4 px-5 text-left whitespace-nowrap w-[16%]">Receiver</th>
              <th className="py-4 px-5 text-left whitespace-nowrap w-[16%]">Assigned</th>
              <th className="py-4 px-5 text-center whitespace-nowrap w-[14%]">Status</th>
              <th className="py-4 px-5 text-center whitespace-nowrap w-[12%]">Delivery Date</th>
              <th className="py-4 px-5 text-center whitespace-nowrap w-[8%]">Payment</th>
              <th className="py-4 px-5 text-center whitespace-nowrap w-[6%]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="8" className="p-8 text-center text-slate-500">
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
                  className="hover:bg-slate-50/80 transition-colors group cursor-default"
                >
                  <td className="py-4 px-5 align-middle">
                    <div className="font-bold text-slate-900 text-sm whitespace-nowrap">{req.trackingId}</div>
                    <div className="text-slate-600 text-xs font-medium mt-1 truncate">{req.parcelName || 'Unnamed Parcel'}</div>
                    <div className="text-slate-400 text-[11px] font-medium mt-0.5 whitespace-nowrap">{req.parcelWeight} kg {req.deliveryFee ? `· ৳${req.deliveryFee}` : ''}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-bold text-slate-800 whitespace-nowrap">{req.senderName}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1 whitespace-nowrap">{req.senderPhone}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5 whitespace-nowrap truncate">{req.senderDistrict}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    <div className="text-sm font-bold text-slate-800 whitespace-nowrap">{req.receiverName}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1 whitespace-nowrap">{req.receiverPhone}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5 whitespace-nowrap truncate">{req.receiverDistrict}</div>
                  </td>
                  <td className="py-4 px-5 align-middle">
                    {req.riderEmail || req.assignedRider ? (
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                          {req.assignedRiderPhoto ? (
                            <img src={req.assignedRiderPhoto} alt="Rider" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <MdPerson className="text-slate-400 w-4 h-4" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-800 whitespace-nowrap">{req.riderName || req.assignedRiderName || 'Rider'}</span>
                          <span className="text-[11px] font-medium text-slate-500 mt-0.5 whitespace-nowrap truncate">{req.riderPhone || req.assignedRiderPhone || req.riderEmail}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="inline-flex items-center text-slate-400 text-[10px] tracking-widest uppercase font-bold whitespace-nowrap px-2.5 py-1.5 bg-slate-50 rounded-md border border-slate-200">— Not assigned</span>
                    )}
                  </td>
                  <td className="py-4 px-5 align-middle text-center">
                    <div className="flex flex-col items-center justify-center">
                      {getStatusBadge(req?.deliveryStatus || req?.status)}
                      {(req?.deliveryStatus || req?.status) === 'pending' && (
                        <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold tracking-wider text-red-500 mt-1.5 whitespace-nowrap">
                          <MdAccessTime className="w-3 h-3" /> Waiting...
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-5 align-middle text-center">
                    {((req?.deliveryStatus || req?.status) === 'delivered' && req.deliveredAt) ? (
                      formatDate(req.deliveredAt)
                    ) : (
                      <span className="text-slate-400 font-medium">—</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-center align-middle">
                    {(req.paymentStatus || '').toLowerCase() === 'paid' ? (
                      <span className="inline-flex px-2.5 py-1 font-bold text-[10px] uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200/50 rounded-md shadow-sm">Paid</span>
                    ) : (
                      <span className="inline-flex px-2.5 py-1 font-bold text-[10px] uppercase tracking-widest text-red-700 bg-red-50 border border-red-200/50 rounded-md shadow-sm">Unpaid</span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-center align-middle">
                    <div className="flex justify-center">
                      <button 
                        onClick={() => onViewDetails && onViewDetails(req)}
                        className="p-2 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 transition-all duration-200 shadow-sm"
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
