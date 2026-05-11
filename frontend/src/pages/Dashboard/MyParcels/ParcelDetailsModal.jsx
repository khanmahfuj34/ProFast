import React from 'react';
import {
    FiX, FiPackage, FiUser, FiPhone, FiMapPin,
    FiCreditCard, FiTruck, FiCalendar, FiTag, FiCheckCircle, FiClock
} from 'react-icons/fi';
import { MdOutlineLocalShipping, MdOutlineAssignmentInd } from 'react-icons/md';

const TIMELINE_STEPS = [
    { key: 'awaiting-payment', label: 'Order Placed',       icon: FiPackage },
    { key: 'pending-pickup',   label: 'Rider Assigned',     icon: MdOutlineAssignmentInd },
    { key: 'picked-up',        label: 'Picked Up',          icon: FiTruck },
    { key: 'on-the-way',       label: 'On The Way',         icon: MdOutlineLocalShipping },
    { key: 'delivered',        label: 'Delivered',          icon: FiCheckCircle },
];

const STATUS_ORDER = ['awaiting-payment', 'pending-pickup', 'picked-up', 'on-the-way', 'delivered'];

function getStepIndex(status) {
    const idx = STATUS_ORDER.indexOf(status);
    return idx === -1 ? 0 : idx;
}

function formatLabel(val) {
    if (!val) return 'N/A';
    return val.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

const InfoRow = ({ icon: Icon, label, value, mono }) => (
    <div className="flex items-start gap-3 py-2">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-lime-50 flex items-center justify-center mt-0.5">
            <Icon className="text-lime-600 text-sm" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
            <p className={`text-sm font-semibold text-slate-800 mt-0.5 break-all ${mono ? 'font-mono' : ''}`}>
                {value || 'N/A'}
            </p>
        </div>
    </div>
);

const ParcelDetailsModal = ({ parcel, onClose }) => {
    if (!parcel) return null;

    const deliveryStatus = parcel.deliveryStatus || 'awaiting-payment';
    const isCancelled = deliveryStatus === 'cancelled';
    const currentStep = isCancelled ? -1 : getStepIndex(deliveryStatus);

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/50 backdrop-blur-sm overflow-y-auto">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl relative animate-in fade-in slide-in-from-top-4 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center">
                            <FiPackage className="text-lime-600 text-lg" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">{parcel.parcelName || 'Parcel Details'}</h2>
                            {parcel.trackingId && (
                                <p className="text-xs font-mono text-slate-400">{parcel.trackingId}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800 transition"
                    >
                        <FiX />
                    </button>
                </div>

                <div className="p-6 space-y-6">

                    {/* Delivery Timeline */}
                    <div className="bg-slate-50 rounded-xl p-5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Delivery Timeline</p>
                        {isCancelled ? (
                            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
                                <FiX className="text-red-500 text-lg flex-shrink-0" />
                                <p className="text-sm font-semibold text-red-700">This parcel has been cancelled.</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between gap-1">
                                {TIMELINE_STEPS.map((step, i) => {
                                    const Icon = step.icon;
                                    const done = i <= currentStep;
                                    const active = i === currentStep;
                                    return (
                                        <React.Fragment key={step.key}>
                                            <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                                                    done
                                                        ? active
                                                            ? 'bg-lime-500 border-lime-500 text-white shadow-lg shadow-lime-200'
                                                            : 'bg-lime-100 border-lime-300 text-lime-600'
                                                        : 'bg-white border-slate-200 text-slate-300'
                                                }`}>
                                                    <Icon className="text-sm" />
                                                </div>
                                                <p className={`text-[10px] font-semibold text-center leading-tight max-w-[52px] ${
                                                    done ? 'text-lime-700' : 'text-slate-400'
                                                }`}>{step.label}</p>
                                            </div>
                                            {i < TIMELINE_STEPS.length - 1 && (
                                                <div className={`flex-1 h-0.5 mb-5 rounded-full transition-all ${
                                                    i < currentStep ? 'bg-lime-400' : 'bg-slate-200'
                                                }`} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Sender Info */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Sender</p>
                            <InfoRow icon={FiUser}    label="Name"    value={parcel.senderName} />
                            <InfoRow icon={FiPhone}   label="Phone"   value={parcel.senderPhone} />
                            <InfoRow icon={FiMapPin}  label="Address" value={parcel.senderAddress} />
                        </div>

                        {/* Receiver Info */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Receiver</p>
                            <InfoRow icon={FiUser}    label="Name"    value={parcel.receiverName} />
                            <InfoRow icon={FiPhone}   label="Phone"   value={parcel.receiverPhone} />
                            <InfoRow icon={FiMapPin}  label="Address" value={parcel.receiverAddress} />
                        </div>

                        {/* Parcel Info */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Parcel Info</p>
                            <InfoRow icon={FiTag}      label="Name"          value={parcel.parcelName} />
                            <InfoRow icon={FiPackage}  label="Type"          value={formatLabel(parcel.parcelType)} />
                            <InfoRow icon={FiTruck}    label="Delivery Type" value={formatLabel(parcel.deliveryType)} />
                            {parcel.parcelDescription && (
                                <InfoRow icon={FiTag} label="Description" value={parcel.parcelDescription} />
                            )}
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-100 pb-2">Payment</p>
                            <InfoRow icon={FiCreditCard} label="Cost"           value={`৳${parcel.totalPrice ?? 0}`} />
                            <InfoRow icon={FiCheckCircle} label="Payment Status" value={formatLabel(parcel.paymentStatus || 'unpaid')} />
                            {parcel.trackingId && (
                                <InfoRow icon={FiTag} label="Tracking ID" value={parcel.trackingId} mono />
                            )}
                            {parcel.paidAt && (
                                <InfoRow icon={FiCalendar} label="Paid At" value={formatDate(parcel.paidAt)} />
                            )}
                        </div>
                    </div>

                    {/* Rider Info (if assigned) */}
                    {parcel.riderName && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Rider Information</p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-bold">
                                    {parcel.riderName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-800">{parcel.riderName}</p>
                                    {parcel.riderEmail && (
                                        <p className="text-sm text-slate-500">{parcel.riderEmail}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                            <FiCalendar className="text-slate-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-500 font-semibold">Created</p>
                            <p className="text-sm font-bold text-slate-700 mt-1">{formatDate(parcel.createdAt)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-4 text-center">
                            <FiClock className="text-slate-400 mx-auto mb-1" />
                            <p className="text-xs text-slate-500 font-semibold">Status</p>
                            <p className="text-sm font-bold text-slate-700 mt-1">{formatLabel(deliveryStatus)}</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-700 text-white font-semibold transition text-sm"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ParcelDetailsModal;
