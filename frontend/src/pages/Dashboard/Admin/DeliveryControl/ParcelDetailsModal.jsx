import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MdClose, MdMap, MdPerson, MdPhone, MdLocationOn, MdLocalShipping,
  MdCheckCircle, MdAccessTime, MdCancel, MdInventory,
  MdCalendarToday, MdCall, MdEmail, MdDirectionsBike,
  MdBadge, MdVerified, MdContentCopy, MdOpenInNew
} from 'react-icons/md';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';

const ParcelDetailsModal = ({ isOpen, onClose, parcel }) => {
  const axiosSecure = useAxiosSecure();
  const [riderDetails, setRiderDetails] = useState(null);
  const [riderLoading, setRiderLoading] = useState(false);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen, onClose]);

  // Fetch rider details when modal opens and parcel has assigned rider
  useEffect(() => {
    if (isOpen && parcel && (parcel.riderEmail || parcel.assignedRider)) {
      const riderEmail = parcel.riderEmail || parcel.assignedRider;
      setRiderLoading(true);
      axiosSecure.get(`/api/delivery-control/rider/${riderEmail}`)
        .then(res => {
          if (res.data.success) setRiderDetails(res.data.rider);
        })
        .catch(() => setRiderDetails(null))
        .finally(() => setRiderLoading(false));
    } else {
      setRiderDetails(null);
    }
  }, [isOpen, parcel, axiosSecure]);

  if (!parcel) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const openGoogleMaps = (district, addr) => {
    const query = encodeURIComponent(`${addr || ''}, ${district || ''}, Bangladesh`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 1500);
  };

  // Normalize status for timeline
  const currentStatus = (parcel.deliveryStatus || parcel.status || '').toLowerCase();

  const getStatusDisplay = (status) => {
    const map = {
      'pending': { label: 'Pending Acceptance', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <MdAccessTime className="w-5 h-5" /> },
      'pending_rider': { label: 'Pending Acceptance', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <MdAccessTime className="w-5 h-5" /> },
      'pending_rider_response': { label: 'Pending Acceptance', color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <MdAccessTime className="w-5 h-5" /> },
      'accepted': { label: 'Accepted', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <MdCheckCircle className="w-5 h-5" /> },
      'driver_accepted': { label: 'Accepted', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <MdCheckCircle className="w-5 h-5" /> },
      'picked-up': { label: 'Picked Up', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: <MdInventory className="w-5 h-5" /> },
      'picked_up': { label: 'Picked Up', color: 'text-purple-600 bg-purple-50 border-purple-200', icon: <MdInventory className="w-5 h-5" /> },
      'on_the_way': { label: 'On The Way', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: <MdLocalShipping className="w-5 h-5" /> },
      'delivered': { label: 'Delivered', color: 'text-green-600 bg-green-50 border-green-200', icon: <MdCheckCircle className="w-5 h-5" /> },
      'cancelled': { label: 'Cancelled', color: 'text-red-600 bg-red-50 border-red-200', icon: <MdCancel className="w-5 h-5" /> },
    };
    return map[status] || { label: status || 'Unknown', color: 'text-slate-600 bg-slate-50 border-slate-200', icon: <MdAccessTime className="w-5 h-5" /> };
  };

  const statusInfo = getStatusDisplay(currentStatus);

  // Timeline steps
  const timelineSteps = [
    {
      key: 'created',
      label: 'Parcel Created',
      isComplete: true,
      date: parcel.createdAt,
      color: 'emerald',
    },
    {
      key: 'accepted',
      label: 'Rider Accepted',
      isComplete: ['accepted', 'driver_accepted', 'picked-up', 'picked_up', 'on_the_way', 'delivered'].includes(currentStatus),
      date: parcel.acceptedAt || parcel.assignedAt,
      color: 'emerald',
    },
    {
      key: 'picked_up',
      label: 'Picked Up',
      isComplete: ['picked-up', 'picked_up', 'on_the_way', 'delivered'].includes(currentStatus),
      date: parcel.pickedUpAt,
      color: 'purple',
    },
    {
      key: 'on_the_way',
      label: 'On The Way',
      isComplete: ['on_the_way', 'delivered'].includes(currentStatus),
      date: parcel.onTheWayAt,
      color: 'blue',
    },
    {
      key: 'delivered',
      label: currentStatus === 'cancelled' ? 'Cancelled' : 'Delivered',
      isComplete: currentStatus === 'delivered' || currentStatus === 'cancelled',
      date: parcel.deliveredAt || (currentStatus === 'cancelled' ? parcel.updatedAt : null),
      color: currentStatus === 'cancelled' ? 'red' : 'green',
      isCancelled: currentStatus === 'cancelled',
    },
  ];

  // Info row helper
  const InfoRow = ({ label, value, mono, accent }) => (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</span>
      <span className={`text-sm font-bold ${accent ? accent : 'text-slate-800'} ${mono ? 'font-mono tracking-wide' : ''}`}>{value || '—'}</span>
    </div>
  );

  // Section header helper
  const SectionHeader = ({ icon, title, iconBg, iconColor }) => (
    <div className="flex items-center gap-2.5 mb-4">
      <div className={`p-2 rounded-lg ${iconBg}`}>
        {React.cloneElement(icon, { className: `w-4 h-4 ${iconColor}` })}
      </div>
      <h3 className="text-xs font-extrabold text-slate-700 uppercase tracking-[0.15em]">{title}</h3>
    </div>
  );

  // Contact card for sender/receiver
  const ContactCard = ({ type, name, phone, address, district, division, borderHover, iconBg, iconColor, mapBtnBg, mapBtnText }) => (
    <div className={`bg-white rounded-xl p-5 border border-slate-200 hover:border-opacity-80 ${borderHover} transition-all duration-200 hover:shadow-md`}>
      <SectionHeader icon={<MdLocationOn />} title={type} iconBg={iconBg} iconColor={iconColor} />
      <div className="space-y-1.5">
        <div className="text-sm font-bold text-slate-900">{name || '—'}</div>
        <div className="flex items-center gap-2 text-slate-600">
          <MdPhone className="w-3.5 h-3.5 shrink-0" />
          <a href={`tel:${phone}`} className="text-xs hover:text-emerald-600 transition-colors font-medium">{phone || '—'}</a>
        </div>
        <div className="text-xs text-slate-600 font-semibold">{district}{division ? ` (${division})` : ''}</div>
        <div className="text-xs text-slate-500 leading-relaxed mt-1">{address || '—'}</div>
      </div>
      <div className="flex gap-2 mt-4">
        <a
          href={`tel:${phone}`}
          className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
        >
          <MdCall className="w-3.5 h-3.5" /> Call
        </a>
        <button
          onClick={() => openGoogleMaps(district, address)}
          className={`flex-1 py-2 ${mapBtnBg} ${mapBtnText} text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5`}
        >
          <MdMap className="w-3.5 h-3.5" /> Map
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 30 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350, mass: 0.8 }}
            className="relative w-full max-w-[680px] max-h-[92vh] bg-white rounded-2xl shadow-2xl flex flex-col border border-slate-200/80 overflow-hidden"
          >
            {/* ─── Header ─── */}
            <div className="shrink-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 border-b border-slate-200 px-5 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 rounded-xl">
                  <MdLocalShipping className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Delivery Details</h2>
                  <button
                    onClick={() => copyToClipboard(parcel.trackingId, 'tracking')}
                    className="flex items-center gap-1.5 group"
                  >
                    <span className="text-xs font-bold text-emerald-600 tracking-widest uppercase">{parcel.trackingId}</span>
                    <MdContentCopy className="w-3 h-3 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    {copied === 'tracking' && <span className="text-[10px] text-emerald-500 font-bold">Copied!</span>}
                  </button>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
              >
                <MdClose className="w-5 h-5" />
              </motion.button>
            </div>

            {/* ─── Content ─── */}
            <div className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent overscroll-contain">
              <div className="p-5 sm:p-6 space-y-5">

                {/* ═══ Current Status Badge ═══ */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border ${statusInfo.color}`}
                >
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                    {statusInfo.icon}
                  </motion.div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-70">Current Status</p>
                    <p className="text-sm font-extrabold">{statusInfo.label}</p>
                  </div>
                </motion.div>

                {/* ═══ 1. Parcel Information ═══ */}
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-slate-50/80 rounded-xl p-5 border border-slate-200"
                >
                  <SectionHeader icon={<MdInventory />} title="Parcel Information" iconBg="bg-blue-100" iconColor="text-blue-600" />
                  <div>
                    <InfoRow label="Tracking ID" value={parcel.trackingId} mono />
                    <InfoRow label="Parcel Name" value={parcel.parcelName} />
                    <InfoRow label="Parcel Type" value={parcel.parcelType || 'Standard'} />
                    <InfoRow label="Weight" value={`${parcel.parcelWeight || 0} kg`} />
                    <InfoRow label="Delivery Fee" value={`৳${parcel.deliveryFee || parcel.totalPrice || 0}`} accent="text-emerald-600" />
                    <InfoRow
                      label="Payment"
                      value={
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                          (parcel.paymentStatus || '').toLowerCase() === 'paid'
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-200/60'
                            : 'bg-amber-100 text-amber-700 border border-amber-200/60'
                        }`}>
                          {parcel.paymentStatus || 'Unpaid'}
                        </span>
                      }
                    />
                    <div className="flex items-center gap-1.5 pt-3 mt-1 border-t border-slate-200 text-slate-500 text-xs">
                      <MdCalendarToday className="w-3.5 h-3.5" />
                      <span className="font-medium">Created: {formatDate(parcel.createdAt)}</span>
                    </div>
                  </div>
                </motion.section>

                {/* ═══ 2 & 3. Sender & Receiver ═══ */}
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  <ContactCard
                    type="Sender"
                    name={parcel.senderName}
                    phone={parcel.senderPhone}
                    address={parcel.senderAddress}
                    district={parcel.senderDistrict}
                    division={parcel.senderDivision}
                    borderHover="hover:border-emerald-300"
                    iconBg="bg-emerald-100"
                    iconColor="text-emerald-600"
                    mapBtnBg="bg-emerald-50 hover:bg-emerald-100"
                    mapBtnText="text-emerald-700"
                  />
                  <ContactCard
                    type="Receiver"
                    name={parcel.receiverName}
                    phone={parcel.receiverPhone}
                    address={parcel.receiverAddress}
                    district={parcel.receiverDistrict}
                    division={parcel.receiverDivision}
                    borderHover="hover:border-blue-300"
                    iconBg="bg-blue-100"
                    iconColor="text-blue-600"
                    mapBtnBg="bg-blue-50 hover:bg-blue-100"
                    mapBtnText="text-blue-700"
                  />
                </motion.div>

                {/* ═══ 4. Assigned Rider ═══ */}
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="bg-gradient-to-br from-purple-50/80 to-purple-50/30 rounded-xl p-5 border border-purple-200/80"
                >
                  <SectionHeader icon={<MdPerson />} title="Assigned Rider" iconBg="bg-purple-100" iconColor="text-purple-600" />

                  {riderLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                      <span className="ml-3 text-sm text-slate-500 font-medium">Loading rider info...</span>
                    </div>
                  ) : (parcel.riderEmail || parcel.assignedRider) ? (
                    <div className="space-y-4">
                      {/* Rider Profile Row */}
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center border-2 border-purple-200 overflow-hidden shrink-0 shadow-sm">
                          {(riderDetails?.photo || parcel.assignedRiderPhoto) ? (
                            <img src={riderDetails?.photo || parcel.assignedRiderPhoto} alt="Rider" className="w-full h-full object-cover" />
                          ) : (
                            <MdPerson className="w-7 h-7 text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-extrabold text-slate-900 text-sm truncate">{riderDetails?.name || parcel.assignedRiderName || parcel.riderName || 'Rider'}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <a href={`tel:${riderDetails?.phone || parcel.assignedRiderPhone}`} className="flex items-center gap-1 text-slate-600 hover:text-purple-600 transition-colors text-xs font-medium">
                              <MdPhone className="w-3 h-3" />
                              {riderDetails?.phone || parcel.assignedRiderPhone || '—'}
                            </a>
                          </div>
                          {(riderDetails?.email || parcel.riderEmail) && (
                            <div className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5 font-medium">
                              <MdEmail className="w-3 h-3" />
                              <span className="truncate">{riderDetails?.email || parcel.riderEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border ${
                          riderDetails?.isOnline
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${riderDetails?.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                          {riderDetails?.isOnline ? 'Online' : 'Offline'}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-extrabold uppercase tracking-wider">
                          <MdLocalShipping className="w-3 h-3" />
                          {riderDetails?.activeDeliveries ?? parcel.riderActiveCount ?? 0} Active
                        </span>
                      </div>

                      {/* Vehicle Info */}
                      {riderDetails && (riderDetails.bikeType || riderDetails.bikeRegistration || riderDetails.drivingLicense) && (
                        <div className="bg-white/80 rounded-lg p-4 border border-purple-100 space-y-0">
                          <div className="flex items-center gap-2 mb-3">
                            <MdDirectionsBike className="w-4 h-4 text-purple-500" />
                            <span className="text-[10px] font-extrabold text-purple-600 uppercase tracking-[0.15em]">Vehicle Details</span>
                          </div>
                          {riderDetails.bikeType && <InfoRow label="Bike Type" value={riderDetails.bikeType} />}
                          {riderDetails.bikeRegistration && <InfoRow label="Registration" value={riderDetails.bikeRegistration} mono />}
                          {riderDetails.drivingLicense && <InfoRow label="Driving License" value={riderDetails.drivingLicense} mono />}
                          <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
                            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">NID Verified</span>
                            <span className={`inline-flex items-center gap-1 text-xs font-bold ${riderDetails.nidVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                              {riderDetails.nidVerified ? <MdVerified className="w-4 h-4" /> : <MdBadge className="w-4 h-4" />}
                              {riderDetails.nidVerified ? 'Verified' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="flex gap-2 pt-1">
                        <a
                          href={`tel:${riderDetails?.phone || parcel.assignedRiderPhone}`}
                          className="flex-1 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-purple-200"
                        >
                          <MdCall className="w-3.5 h-3.5" /> Call Rider
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center border border-dashed border-slate-300 rounded-xl bg-white/50">
                      <MdPerson className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-500 font-semibold">No Rider Assigned Yet</p>
                      <p className="text-xs text-slate-400 mt-1">Waiting for a rider to accept this delivery</p>
                    </div>
                  )}
                </motion.section>

                {/* ═══ 5. Delivery Timeline ═══ */}
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl p-5 border border-slate-200"
                >
                  <SectionHeader icon={<MdAccessTime />} title="Delivery Timeline" iconBg="bg-slate-100" iconColor="text-slate-600" />

                  <div className="relative ml-3">
                    {/* Vertical line */}
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-slate-200"></div>

                    <div className="space-y-0">
                      {timelineSteps.map((step, idx) => {
                        const isActive = step.isComplete;
                        const isCurrent = (
                          (step.key === 'created' && ['pending', 'pending_rider', 'pending_rider_response'].includes(currentStatus)) ||
                          (step.key === 'accepted' && ['accepted', 'driver_accepted', 'driver_assigned'].includes(currentStatus)) ||
                          (step.key === 'picked_up' && ['picked-up', 'picked_up'].includes(currentStatus)) ||
                          (step.key === 'on_the_way' && currentStatus === 'on_the_way') ||
                          (step.key === 'delivered' && (currentStatus === 'delivered' || currentStatus === 'cancelled'))
                        );

                        const dotColor = step.isCancelled
                          ? 'bg-red-500 border-red-200'
                          : isActive
                            ? `bg-${step.color}-500 border-${step.color}-200`
                            : 'bg-slate-300 border-slate-100';

                        return (
                          <div key={step.key} className={`relative pl-8 py-3 ${!isActive ? 'opacity-40' : ''} ${isCurrent ? 'opacity-100' : ''}`}>
                            {/* Dot */}
                            <div className={`absolute left-0 top-4 w-3 h-3 rounded-full border-2 border-white shadow-sm -translate-x-[5px] ${
                              step.isCancelled ? 'bg-red-500' :
                              isActive ? (step.color === 'emerald' ? 'bg-emerald-500' : step.color === 'purple' ? 'bg-purple-500' : step.color === 'blue' ? 'bg-blue-500' : step.color === 'green' ? 'bg-green-500' : 'bg-slate-300') :
                              'bg-slate-300'
                            }`}>
                              {isCurrent && isActive && (
                                <motion.div
                                  className={`absolute inset-0 rounded-full ${
                                    step.isCancelled ? 'bg-red-400' :
                                    step.color === 'emerald' ? 'bg-emerald-400' : step.color === 'purple' ? 'bg-purple-400' : step.color === 'blue' ? 'bg-blue-400' : step.color === 'green' ? 'bg-green-400' : 'bg-slate-400'
                                  }`}
                                  animate={{ scale: [1, 1.8, 1], opacity: [1, 0, 1] }}
                                  transition={{ repeat: Infinity, duration: 2 }}
                                />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <div className={`text-xs font-extrabold uppercase tracking-wider ${
                                  step.isCancelled ? 'text-red-700' :
                                  isActive ? 'text-slate-800' : 'text-slate-500'
                                }`}>
                                  {step.label}
                                </div>
                                <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                  {step.date ? formatDate(step.date) : 'Awaiting...'}
                                </div>
                              </div>
                              {isCurrent && isActive && (
                                <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                                  step.isCancelled ? 'bg-red-50 text-red-600 border-red-200' :
                                  'bg-emerald-50 text-emerald-600 border-emerald-200'
                                }`}>
                                  {step.isCancelled ? 'Cancelled' : 'Current'}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.section>

                {/* Bottom spacer */}
                <div className="h-4"></div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ParcelDetailsModal;
