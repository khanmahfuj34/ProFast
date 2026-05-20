import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MdClose, MdMap, MdPerson, MdPhone, MdLocationOn, MdLocalShipping,
  MdCheckCircle, MdAccessTime, MdCancel, MdInventory,
  MdCalendarToday, MdCall
} from 'react-icons/md';

const ParcelDetailsModal = ({ isOpen, onClose, parcel }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  if (!parcel) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const openGoogleMaps = (district, addr) => {
    const query = encodeURIComponent(`${addr}, ${district}, Bangladesh`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <MdAccessTime className="w-5 h-5" />;
      case 'driver_accepted': return <MdCheckCircle className="w-5 h-5" />;
      case 'picked-up': return <MdInventory className="w-5 h-5" />;
      case 'on_the_way': return <MdLocalShipping className="w-5 h-5" />;
      case 'delivered': return <MdCheckCircle className="w-5 h-5" />;
      case 'cancelled': return <MdCancel className="w-5 h-5" />;
      default: return <MdAccessTime className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'driver_accepted': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'picked-up': return 'text-purple-500 bg-purple-50 border-purple-200';
      case 'on_the_way': return 'text-amber-500 bg-amber-50 border-amber-200';
      case 'delivered': return 'text-green-500 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-500 bg-red-50 border-red-200';
      default: return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 1 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200 overflow-hidden"
          >
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="shrink-0 bg-linear-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 rounded-lg">
                  <MdLocalShipping className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Delivery Details</h2>
                  <p className="text-xs font-semibold text-emerald-600 tracking-widest uppercase mt-0.5">{parcel.trackingId}</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2.5 hover:bg-slate-200 rounded-xl text-slate-600 transition-colors"
              >
                <MdClose className="w-5 h-5" />
              </motion.button>
            </motion.div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent overscroll-contain">
              <div className="p-6 space-y-5">

                {/* Status Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${getStatusColor(parcel.status)}`}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    {getStatusIcon(parcel.status)}
                  </motion.div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Current Status</p>
                    <p className="text-sm font-bold capitalize">{parcel.status?.replace('_', ' ')}</p>
                  </div>
                </motion.div>

                {/* Parcel Information */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-slate-50 rounded-xl p-5 border border-slate-200"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                      <MdInventory className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Parcel Info</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Tracking ID</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{parcel.trackingId || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Type</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">{parcel.parcelType || 'Document'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Weight</span>
                      <span className="font-bold text-slate-900">{parcel.parcelWeight} kg</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Delivery Fee</span>
                      <span className="font-bold text-emerald-600">৳{parcel.deliveryFee || parcel.totalPrice || 0}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-slate-600 font-medium">Payment Status</span>
                      <span className={`px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider ${parcel.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {parcel.paymentStatus || 'Unpaid'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 text-slate-500 text-xs">
                      <MdCalendarToday className="w-4 h-4" />
                      <span>{formatDate(parcel.createdAt)}</span>
                    </div>
                  </div>
                </motion.section>

                {/* Sender & Receiver */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {/* Sender */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-emerald-100 rounded-lg">
                        <MdLocationOn className="w-4 h-4 text-emerald-600" />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">Sender</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="font-bold text-slate-900">{parcel.senderName}</div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MdPhone className="w-3.5 h-3.5" />
                        <span className="text-xs">{parcel.senderPhone}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">{parcel.senderDistrict} ({parcel.senderDivision})</div>
                      <div className="text-xs text-slate-500 leading-snug max-h-12 overflow-y-auto">{parcel.senderAddress}</div>
                      <button 
                        onClick={() => openGoogleMaps(parcel.senderDistrict, parcel.senderAddress)}
                        className="w-full mt-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MdMap className="w-3.5 h-3.5" /> Map
                      </button>
                    </div>
                  </div>

                  {/* Receiver */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <MdLocationOn className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-700">Receiver</h4>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="font-bold text-slate-900">{parcel.receiverName}</div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <MdPhone className="w-3.5 h-3.5" />
                        <span className="text-xs">{parcel.receiverPhone}</span>
                      </div>
                      <div className="text-xs text-slate-600 font-semibold">{parcel.receiverDistrict} ({parcel.receiverDivision})</div>
                      <div className="text-xs text-slate-500 leading-snug max-h-12 overflow-y-auto">{parcel.receiverAddress}</div>
                      <button 
                        onClick={() => openGoogleMaps(parcel.receiverDistrict, parcel.receiverAddress)}
                        className="w-full mt-2 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                      >
                        <MdMap className="w-3.5 h-3.5" /> Map
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Rider Information */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-linear-to-br from-purple-50 to-purple-50/50 rounded-xl p-5 border border-purple-200"
                >
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="p-1.5 bg-purple-100 rounded-lg">
                      <MdPerson className="w-4 h-4 text-purple-600" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Assigned Rider</h3>
                  </div>
                  {parcel.assignedRider ? (
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center border-2 border-purple-200 overflow-hidden shrink-0">
                        {parcel.assignedRiderPhoto ? (
                          <img src={parcel.assignedRiderPhoto} alt="Rider" className="w-full h-full object-cover" />
                        ) : (
                          <MdPerson className="w-6 h-6 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-slate-900 text-sm">{parcel.assignedRiderName}</div>
                        <div className="flex items-center gap-1.5 text-slate-600 text-xs mt-0.5">
                          <MdPhone className="w-3.5 h-3.5" />
                          <span>{parcel.assignedRiderPhone || parcel.assignedRider}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs font-semibold">
                          <span className="flex items-center gap-1.5 text-emerald-600">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
                          </span>
                          <span className="text-slate-400">·</span>
                          <span className="text-slate-600">Active: {parcel.riderActiveCount || 1}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 text-center text-sm text-slate-500 font-medium border border-dashed border-slate-300 rounded-lg">
                      No Rider Assigned Yet
                    </div>
                  )}
                </motion.section>

                {/* Delivery Timeline */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                >
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 px-1">Timeline</h3>
                  <div className="space-y-3 pl-2 border-l-2 border-slate-300">
                    
                    {/* Created */}
                    <motion.div className="relative pl-6 -ml-4">
                      <div className="absolute -left-3.5 top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white"></div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Parcel Created</div>
                      <div className="text-xs text-slate-500 mt-0.5">{formatDate(parcel.createdAt)}</div>
                    </motion.div>

                    {/* Assigned */}
                    <motion.div className={`relative pl-6 -ml-4 ${!parcel.assignedAt ? 'opacity-40' : ''}`}>
                      <div className={`absolute -left-3.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${parcel.assignedAt ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rider Accepted</div>
                      <div className="text-xs text-slate-500 mt-0.5">{parcel.assignedAt ? formatDate(parcel.assignedAt) : 'Pending'}</div>
                    </motion.div>

                    {/* Picked Up */}
                    <motion.div className={`relative pl-6 -ml-4 ${(parcel.status === 'pending' || parcel.status === 'driver_accepted') ? 'opacity-40' : ''}`}>
                      <div className={`absolute -left-3.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${['picked-up', 'on_the_way', 'delivered'].includes(parcel.status) ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Picked Up</div>
                      <div className="text-xs text-slate-500 mt-0.5">{['picked-up', 'on_the_way', 'delivered'].includes(parcel.status) ? 'Confirmed' : 'Awaiting'}</div>
                    </motion.div>

                    {/* On The Way */}
                    <motion.div className={`relative pl-6 -ml-4 ${(!['on_the_way', 'delivered'].includes(parcel.status)) ? 'opacity-40' : ''}`}>
                      <div className={`absolute -left-3.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${['on_the_way', 'delivered'].includes(parcel.status) ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">In Transit</div>
                      <div className="text-xs text-slate-500 mt-0.5">{['on_the_way', 'delivered'].includes(parcel.status) ? 'On the way' : 'Pending'}</div>
                    </motion.div>

                    {/* Delivered / Cancelled */}
                    <motion.div className={`relative pl-6 -ml-4 ${(parcel.status !== 'delivered' && parcel.status !== 'cancelled') ? 'opacity-40' : ''}`}>
                      <div className={`absolute -left-3.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${parcel.status === 'delivered' ? 'bg-green-500' : parcel.status === 'cancelled' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                      <div className={`text-xs font-bold uppercase tracking-wider ${parcel.status === 'delivered' ? 'text-green-700' : parcel.status === 'cancelled' ? 'text-red-700' : 'text-slate-700'}`}>
                        {parcel.status === 'cancelled' ? 'Cancelled' : 'Delivered'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {parcel.status === 'delivered' || parcel.status === 'cancelled' ? formatDate(parcel.updatedAt) : 'Awaiting'}
                      </div>
                    </motion.div>
                  </div>
                </motion.section>

                {/* Admin Actions */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-linear-to-br from-amber-50 to-amber-50/50 rounded-xl p-5 border border-amber-200"
                >
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4">Admin Actions</h3>
                  <div className="space-y-2.5">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <MdCall className="w-4 h-4" /> Contact Rider
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <MdCall className="w-4 h-4" /> Contact Sender
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <MdCall className="w-4 h-4" /> Contact Receiver
                    </motion.button>
                    
                    {parcel.status !== 'delivered' && parcel.status !== 'cancelled' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 px-4 mt-3 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-bold rounded-lg transition-colors"
                      >
                        Force Cancel Delivery
                      </motion.button>
                    )}

                    {(parcel.status === 'delivered' || parcel.status === 'cancelled') && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-2.5 px-4 mt-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-600 text-xs font-bold rounded-lg transition-colors"
                      >
                        Mark as Resolved
                      </motion.button>
                    )}
                  </div>
                </motion.section>

                <div className="h-6"></div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ParcelDetailsModal;
