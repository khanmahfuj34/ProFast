import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Swal from 'sweetalert2';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const customMarker = (color) => new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background:${color};width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
});

// District coords (mirrors backend logic for map preview)
const districtCoords = {
    'Dhaka': [23.8103, 90.4125], 'Mirpur': [23.8223, 90.3654], 'Banani': [23.7936, 90.4065],
    'Uttara': [23.8746, 90.3980], 'Gulshan': [23.7925, 90.4078], 'Dhanmondi': [23.7465, 90.3740],
    'Mohammadpur': [23.7536, 90.3595], 'Badda': [23.7805, 90.4250], 'Malibagh': [23.7423, 90.4125],
    'Farmgate': [23.7562, 90.3907], 'Tejgaon': [23.7608, 90.3900], 'Shyamoli': [23.7747, 90.3655],
    'Dumni': [23.8400, 90.4700], 'Wari': [23.7150, 90.4150], 'Lalmatia': [23.7550, 90.3700],
    'Rampura': [23.7580, 90.4150], 'Bashundhara': [23.8195, 90.4360], 'Motijheel': [23.7333, 90.4167],
    'Chittagong': [22.3569, 91.7832], 'Sylhet': [24.8949, 91.8687], 'Khulna': [22.8456, 89.5403],
    'Rajshahi': [24.3745, 88.6042], 'Barisal': [22.7010, 90.3535], 'Rangpur': [25.7439, 89.2752],
    'Mymensingh': [24.7471, 90.4203], 'Narayanganj': [23.6238, 90.5000], 'Gazipur': [23.9999, 90.4203]
};

const getCoords = (districtName) => {
    if (!districtName) return [23.8103, 90.4125];
    const key = Object.keys(districtCoords).find(k => districtName.toLowerCase().includes(k.toLowerCase()));
    return key ? districtCoords[key] : [23.8103, 90.4125];
};

const getSizeLabel = (weight) => {
    const w = parseFloat(weight) || 0;
    if (w <= 1) return 'Small';
    if (w <= 5) return 'Medium';
    return 'Large';
};

const getPaymentTypeLabel = (status) => status === 'paid' ? 'Prepaid' : 'Cash on Delivery';

const formatDateTime = (date) => {
    if (!date) return '—';
    const d = new Date(date);
    return d.toLocaleString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getTimeline = (statusRaw) => {
    const steps = [
        { label: 'Assigned', desc: 'Parcel assigned to you', icon: '✓' },
        { label: 'Pick Up', desc: 'Collect parcel from sender', icon: '📦' },
        { label: 'On The Way', desc: 'In transit to delivery', icon: '🛵' },
        { label: 'Delivered', desc: 'Parcel delivered successfully', icon: '✅' }
    ];
    const order = ['driver_assigned', 'driver_accepted', 'picked_up', 'on_the_way', 'delivered'];
    const idx = order.indexOf(statusRaw);
    return steps.map((s, i) => {
        const stepIdx = i + 1; // mapped to order indices 1,2,3,4
        const completed = idx >= stepIdx;
        const current = idx === stepIdx;
        return { ...s, completed, current };
    });
};

const statusBadgeClasses = {
    'driver_assigned': 'bg-amber-50 text-amber-700 border-amber-200',
    'driver_accepted': 'bg-blue-50 text-blue-700 border-blue-200',
    'picked_up': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'on_the_way': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'delivered': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'pending-pickup': 'bg-red-50 text-red-700 border-red-200',
};

const formatStatusLabel = (status) => {
    const map = {
        'driver_assigned': 'Assigned',
        'driver_accepted': 'Accepted',
        'picked_up': 'Picked Up',
        'on_the_way': 'On The Way',
        'delivered': 'Delivered',
        'pending-pickup': 'Pending'
    };
    return map[status] || status?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
};

/* ─── Delivery Detail Card ─── */
const DeliveryCard = ({ parcel, onAccept, onReject, onUpdateProgress, isUpdating }) => {
    const [expanded, setExpanded] = useState(false);
    const pickupCoords = getCoords(parcel.senderDistrict);
    const dropCoords = getCoords(parcel.receiverDistrict);
    const midLat = (pickupCoords[0] + dropCoords[0]) / 2;
    const midLng = (pickupCoords[1] + dropCoords[1]) / 2;
    const riderEarning = Math.round((parcel.totalPrice || 0) * 0.7);
    const timeline = getTimeline(parcel.deliveryStatus);

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md">
            {/* ── Summary Row ── */}
            <div className="p-5 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                    {/* Left: parcel info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-xl shrink-0">
                            📦
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-base font-bold text-slate-800">{parcel.parcelName || 'Unnamed Parcel'}</h3>
                                {parcel.deliveryStatus === 'driver_assigned' && (
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-wide">
                                        New Assignment
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-slate-500">
                                <span className="font-mono">{parcel.trackingId || `ZS-${parcel._id?.slice(-6)?.toUpperCase()}`}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{parcel.parcelWeight || 1} kg</span>
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                <span>{formatDateTime(parcel.updatedAt)}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadgeClasses[parcel.deliveryStatus] || statusBadgeClasses['driver_assigned']}`}>
                                    {formatStatusLabel(parcel.deliveryStatus)}
                                </span>
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                    parcel.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {parcel.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Middle: route preview + fee */}
                    <div className="flex items-center gap-6 lg:gap-8 flex-wrap">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="text-center">
                                <p className="text-xs text-slate-400 mb-0.5">Pickup</p>
                                <p className="font-semibold text-slate-700 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    {parcel.senderDistrict || 'N/A'}
                                </p>
                            </div>
                            <div className="flex flex-col items-center px-2">
                                <span className="text-slate-300 text-lg">→</span>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-slate-400 mb-0.5">Delivery</p>
                                <p className="font-semibold text-slate-700 flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                    {parcel.receiverDistrict || 'N/A'}
                                </p>
                            </div>
                        </div>
                        <div className="text-right min-w-[80px]">
                            <p className="text-xs text-slate-400">Earning</p>
                            <p className="text-lg font-bold text-emerald-600">৳{riderEarning}</p>
                        </div>
                        <button
                            onClick={() => setExpanded(v => !v)}
                            className="px-4 py-2 text-sm font-semibold text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition shrink-0"
                        >
                            {expanded ? 'Hide Details' : 'View Full Details'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Expanded Detail Section ── */}
            {expanded && (
                <div className="border-t border-slate-100 bg-slate-50/50">
                    {/* Header bar */}
                    <div className="px-5 sm:px-6 pt-5 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-lg">
                                🏠
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-800">{parcel.parcelName || 'Unnamed Parcel'}</h4>
                                <p className="text-xs text-slate-500 font-mono">Tracking ID: {parcel.trackingId || `ZS-${parcel._id?.slice(-6)?.toUpperCase()}`}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-100">
                                {parcel.deliveryType === 'within-city' ? 'Standard Delivery' : 'Express Delivery'}
                            </span>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="px-5 sm:px-6 mt-4">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                { icon: '⚖️', label: 'Parcel Weight', value: `${parcel.parcelWeight || 1} kg` },
                                { icon: '📐', label: 'Parcel Size', value: getSizeLabel(parcel.parcelWeight) },
                                { icon: '💳', label: 'Payment Type', value: getPaymentTypeLabel(parcel.paymentStatus) },
                                { icon: '💰', label: 'Total Cost', value: `৳${parcel.totalPrice || 0}` },
                            ].map((item, i) => (
                                <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                                    <div className="text-lg mb-1">{item.icon}</div>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{item.label}</p>
                                    <p className="text-sm font-bold text-slate-800 mt-0.5">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Two-column layout */}
                    <div className="px-5 sm:px-6 py-5 grid grid-cols-1 lg:grid-cols-5 gap-5">
                        {/* Left: Pickup & Delivery Info */}
                        <div className="lg:col-span-3 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Pickup Information */}
                                <div className="bg-white rounded-xl border border-slate-200 p-5">
                                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        Pickup Information
                                    </h5>
                                    <div className="space-y-3 text-sm">
                                        <InfoRow label="Sender Name" value={parcel.senderName || 'N/A'} />
                                        <InfoRow label="Phone" value={parcel.senderPhone || 'N/A'} icon="📞" />
                                        <InfoRow label="Address" value={parcel.senderAddress || parcel.senderDistrict || 'N/A'} icon="📍" />
                                        <InfoRow label="Area" value={parcel.senderDistrict || 'N/A'} />
                                        <InfoRow label="Landmark" value={parcel.senderLandmark || 'Near main road'} />
                                        <InfoRow label="Pickup Time" value={parcel.pickupTime || `Today, 10:00 AM - 12:00 PM`} icon="🕐" />
                                    </div>
                                </div>

                                {/* Delivery Information */}
                                <div className="bg-white rounded-xl border border-slate-200 p-5">
                                    <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        Delivery Information
                                    </h5>
                                    <div className="space-y-3 text-sm">
                                        <InfoRow label="Receiver Name" value={parcel.receiverName || 'N/A'} />
                                        <InfoRow label="Phone" value={parcel.receiverPhone || 'N/A'} icon="📞" />
                                        <InfoRow label="Address" value={parcel.receiverAddress || parcel.receiverDistrict || 'N/A'} icon="📍" />
                                        <InfoRow label="Area" value={parcel.receiverDistrict || 'N/A'} />
                                        <InfoRow label="Landmark" value={parcel.receiverLandmark || 'Near main road'} />
                                        <InfoRow label="Est. Delivery" value={parcel.estimatedDelivery || `Today, 04:00 PM - 08:00 PM`} icon="🕐" />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Instructions */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                                    <span className="text-amber-500 text-base">⚠️</span>
                                    Delivery Instructions
                                </h5>
                                <p className="text-sm text-slate-600">
                                    {parcel.deliveryInstructions || 'Please handle with care. Ensure the parcel is delivered to the right person and collect signature if required.'}
                                </p>
                            </div>

                            {/* Parcel Notes */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                                    <span className="text-blue-500 text-base">📝</span>
                                    Parcel Notes
                                </h5>
                                <p className="text-sm text-slate-600">
                                    {parcel.parcelNotes || `Keep the parcel safe and deliver to the right person. Category: ${parcel.parcelType || 'standard'}.`}
                                </p>
                            </div>

                            {/* Actions */}
                            {parcel.deliveryStatus === 'driver_assigned' && (
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => onReject(parcel)}
                                        disabled={isUpdating}
                                        className="flex-1 py-3 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <span>✕</span> Reject Delivery
                                    </button>
                                    <button
                                        onClick={() => onAccept(parcel)}
                                        disabled={isUpdating}
                                        className="flex-1 py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <span>✓</span> Accept Delivery
                                    </button>
                                </div>
                            )}

                            {/* Delivery Progress Buttons — shown after accepted */}
                            {parcel.deliveryStatus === 'driver_accepted' && (
                                <div className="pt-2">
                                    <p className="text-xs font-semibold text-slate-500 mb-2">Update delivery status:</p>
                                    <button
                                        onClick={() => onUpdateProgress(parcel, 'picked_up')}
                                        disabled={isUpdating}
                                        className="w-full py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2 mb-2"
                                    >
                                        📦 Mark as Picked Up
                                    </button>
                                </div>
                            )}
                            {parcel.deliveryStatus === 'picked_up' && (
                                <div className="pt-2">
                                    <p className="text-xs font-semibold text-slate-500 mb-2">Update delivery status:</p>
                                    <button
                                        onClick={() => onUpdateProgress(parcel, 'on_the_way')}
                                        disabled={isUpdating}
                                        className="w-full py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2 mb-2"
                                    >
                                        🛵 Mark as On The Way
                                    </button>
                                </div>
                            )}
                            {parcel.deliveryStatus === 'on_the_way' && (
                                <div className="pt-2 space-y-2">
                                    <p className="text-xs font-semibold text-slate-500">Finalize delivery:</p>
                                    <button
                                        onClick={() => onUpdateProgress(parcel, 'delivered')}
                                        disabled={isUpdating}
                                        className="w-full py-3 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        ✅ Mark as Delivered
                                    </button>
                                    <button
                                        onClick={() => onUpdateProgress(parcel, 'delivery_failed')}
                                        disabled={isUpdating}
                                        className="w-full py-3 text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        ✕ Delivery Failed
                                    </button>
                                </div>
                            )}

                            {/* Completed state */}
                            {['delivered', 'delivery_failed', 'cancelled'].includes(parcel.deliveryStatus) && (
                                <div className={`rounded-xl p-4 flex items-center gap-3 border ${
                                    parcel.deliveryStatus === 'delivered'
                                        ? 'bg-emerald-50 border-emerald-100'
                                        : 'bg-red-50 border-red-100'
                                }`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                                        parcel.deliveryStatus === 'delivered'
                                            ? 'bg-emerald-100 text-emerald-600'
                                            : 'bg-red-100 text-red-500'
                                    }`}>
                                        {parcel.deliveryStatus === 'delivered' ? '✓' : '✕'}
                                    </div>
                                    <div>
                                        <p className={`text-sm font-semibold ${
                                            parcel.deliveryStatus === 'delivered' ? 'text-emerald-800' : 'text-red-700'
                                        }`}>
                                            {parcel.deliveryStatus === 'delivered' ? 'Delivery completed!' : 'Delivery not completed'}
                                        </p>
                                        <p className={`text-xs ${
                                            parcel.deliveryStatus === 'delivered' ? 'text-emerald-600' : 'text-red-500'
                                        }`}>
                                            Final status: {formatStatusLabel(parcel.deliveryStatus)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right: Timeline + Route + Payment */}
                        <div className="lg:col-span-2 space-y-4">
                            {/* Delivery Overview / Timeline */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
                                    <span className="text-blue-500 text-base">📋</span>
                                    Delivery Overview
                                </h5>
                                <div className="relative pl-4">
                                    {timeline.map((step, idx) => (
                                        <div key={idx} className="relative pb-5 last:pb-0">
                                            {/* connector line */}
                                            {idx < timeline.length - 1 && (
                                                <div className={`absolute left-[11px] top-6 w-0.5 h-full ${step.completed ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                                            )}
                                            <div className="flex items-start gap-3">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 border-2 ${
                                                    step.completed
                                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                                        : step.current
                                                            ? 'bg-white border-emerald-500 text-emerald-600'
                                                            : 'bg-white border-slate-200 text-slate-300'
                                                }`}>
                                                    {step.completed ? '✓' : step.icon}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-semibold ${step.completed || step.current ? 'text-slate-800' : 'text-slate-400'}`}>
                                                        {step.label}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Route Information */}
                            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                <h5 className="text-sm font-bold text-slate-800 flex items-center gap-2 p-5 pb-0">
                                    <span className="text-emerald-500 text-base">🗺️</span>
                                    Route Information
                                </h5>
                                <div className="p-5 pt-3">
                                    <div className="rounded-xl overflow-hidden border border-slate-200 h-44">
                                        <MapContainer center={[midLat, midLng]} zoom={12} scrollWheelZoom={false} className="h-full w-full" style={{ height: '100%' }}>
                                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <Marker position={pickupCoords} icon={customMarker('#10b981')}></Marker>
                                            <Marker position={dropCoords} icon={customMarker('#ef4444')}></Marker>
                                            <Polyline positions={[pickupCoords, dropCoords]} color="#10b981" weight={3} opacity={0.8} />
                                        </MapContainer>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mt-3">
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-medium uppercase">Distance</p>
                                            <p className="text-sm font-bold text-slate-700">{parcel.distance || '8.5'} km</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <p className="text-[10px] text-slate-400 font-medium uppercase">Est. Time</p>
                                            <p className="text-sm font-bold text-slate-700">{parcel.estimatedTime || '25'} min</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <h5 className="text-sm font-bold text-slate-800 mb-4">Payment Summary</h5>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Delivery Fee</span>
                                        <span className="font-semibold text-slate-700">৳{parcel.basePrice || Math.round((parcel.totalPrice || 0) * 0.85)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Service Charge</span>
                                        <span className="font-semibold text-slate-700">৳{parcel.extraCharges || Math.round((parcel.totalPrice || 0) * 0.15)}</span>
                                    </div>
                                    <div className="border-t border-slate-100 pt-3 flex justify-between">
                                        <span className="text-sm font-bold text-slate-800">Total Amount</span>
                                        <span className="text-lg font-bold text-emerald-600">৳{parcel.totalPrice || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-xs text-slate-400">Payment Status</span>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            parcel.paymentStatus === 'paid'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'bg-amber-50 text-amber-700 border-amber-200'
                                        }`}>
                                            {parcel.paymentStatus === 'paid' ? 'Paid (Prepaid)' : 'Unpaid (COD)'}
                                        </span>
                                    </div>
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mt-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-emerald-700 font-medium">Your Earning (70%)</span>
                                            <span className="text-sm font-bold text-emerald-700">৳{riderEarning}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ─── Info Row helper ─── */
const InfoRow = ({ label, value, icon }) => (
    <div>
        <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-700 mt-0.5 flex items-center gap-1.5">
            {icon && <span className="text-xs opacity-70">{icon}</span>}
            {value}
        </p>
    </div>
);

/* ─── Main Page ─── */
const AssignedDeliveries = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const { data: parcels = [], isLoading, isError } = useQuery({
        queryKey: ['assigned-deliveries', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get('/parcels/assigned');
            return res.data || [];
        },
        enabled: !!user?.email
    });

    const updateDeliveryStatusMutation = useMutation({
        mutationFn: async ({ parcelId, deliveryStatus, clearRider }) => {
            const updatePayload = { deliveryStatus };
            if (clearRider) {
                updatePayload.riderId = null;
                updatePayload.riderName = '';
                updatePayload.riderEmail = '';
            }
            return axiosSecure.patch(`/parcels/${parcelId}`, updatePayload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assigned-deliveries', user?.email] });
            Swal.fire({
                title: 'Success!',
                text: 'Delivery status updated successfully.',
                icon: 'success',
                confirmButtonColor: '#10b981',
                timer: 2000,
            });
        },
        onError: () => {
            Swal.fire('Error', 'Failed to update delivery status', 'error');
        }
    });

    const handleAccept = (parcel) => {
        updateDeliveryStatusMutation.mutate({
            parcelId: parcel._id,
            deliveryStatus: 'driver_accepted'
        });
    };

    const handleReject = (parcel) => {
        Swal.fire({
            title: 'Reject Delivery?',
            text: 'Are you sure you want to reject this delivery? It will be sent back to the admin.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, reject it!'
        }).then((result) => {
            if (result.isConfirmed) {
                updateDeliveryStatusMutation.mutate({
                    parcelId: parcel._id,
                    deliveryStatus: 'pending-pickup',
                    clearRider: true
                });
            }
        });
    };

    const handleUpdateProgress = (parcel, status) => {
        let title = 'Update Status?';
        let text = `Mark this parcel as ${formatStatusLabel(status)}?`;
        
        if (status === 'delivered') {
            title = 'Complete Delivery?';
            text = 'Mark this parcel as successfully delivered? This cannot be undone.';
        } else if (status === 'delivery_failed') {
            title = 'Delivery Failed?';
            text = 'Mark this delivery as failed? This will return the parcel to the admin. This cannot be undone.';
        }

        Swal.fire({
            title,
            text,
            icon: status === 'delivery_failed' ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: status === 'delivery_failed' ? '#ef4444' : '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, update it!'
        }).then((result) => {
            if (result.isConfirmed) {
                updateDeliveryStatusMutation.mutate({
                    parcelId: parcel._id,
                    deliveryStatus: status
                });
            }
        });
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Assigned Deliveries</h1>
                        <p className="text-sm text-slate-500 mt-1">
                            Review delivery details and take action on your assigned parcels.
                        </p>
                    </div>
                    <Link
                        to="/dashboard/rider-dashboard"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition self-start"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>

                {/* Loading */}
                {isLoading && (
                    <div className="flex justify-center items-center py-20">
                        <span className="loading loading-spinner loading-lg text-emerald-600"></span>
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-xl">
                        <p className="text-red-700 font-medium">Failed to load assigned deliveries. Please try again later.</p>
                    </div>
                )}

                {/* Empty */}
                {!isLoading && !isError && parcels.length === 0 && (
                    <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 px-6 py-20 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <p className="text-xl font-bold text-slate-700">No Deliveries Assigned</p>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">
                            You currently don't have any parcels assigned to you. Check back later when admins assign new deliveries.
                        </p>
                    </div>
                )}

                {/* Cards */}
                {!isLoading && !isError && parcels.length > 0 && (
                    <div className="space-y-5">
                        {parcels.map((parcel) => (
                            <DeliveryCard
                                key={parcel._id}
                                parcel={parcel}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                onUpdateProgress={handleUpdateProgress}
                                isUpdating={updateDeliveryStatusMutation.isPending}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AssignedDeliveries;
