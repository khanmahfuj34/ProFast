import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
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
    html: `<div style="background:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.2);"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

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

const isToday = (dateStr) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const getPriority = (parcel) => {
    const type = (parcel.parcelType || '').toLowerCase();
    const deliveryType = (parcel.deliveryType || '').toLowerCase();
    if (type === 'electronics' || type === 'fragile' || deliveryType === 'express') return 'high';
    if (type === 'documents' || type === 'food') return 'low';
    return 'medium';
};

const priorityConfig = {
    high: { label: 'High', class: 'bg-red-50 text-red-700 border-red-200' },
    medium: { label: 'Medium', class: 'bg-amber-50 text-amber-700 border-amber-200' },
    low: { label: 'Low', class: 'bg-blue-50 text-blue-700 border-blue-200' }
};

const typeConfig = {
    electronics: { label: 'Electronics', class: 'bg-blue-50 text-blue-700 border-blue-200' },
    documents: { label: 'Documents', class: 'bg-purple-50 text-purple-700 border-purple-200' },
    gift: { label: 'Gift', class: 'bg-pink-50 text-pink-700 border-pink-200' },
    food: { label: 'Food', class: 'bg-orange-50 text-orange-700 border-orange-200' },
    clothing: { label: 'Clothing', class: 'bg-teal-50 text-teal-700 border-teal-200' },
    fragile: { label: 'Fragile', class: 'bg-red-50 text-red-700 border-red-200' }
};

const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

/* ─── Stat Card ─── */
const StatCard = ({ icon, label, value, subtext, colorClass }) => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${colorClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{subtext}</p>
        </div>
    </div>
);

/* ─── Badges ─── */
const PaymentBadge = ({ status }) => {
    const isPaid = status === 'paid';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${isPaid ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
            {isPaid ? 'Paid' : 'Unpaid'}
        </span>
    );
};

const DeliveryStatusBadge = ({ status }) => {
    const config = {
        'awaiting-payment': { label: 'Awaiting Payment', class: 'bg-slate-100 text-slate-600 border-slate-200' },
        'pending': { label: 'Pending', class: 'bg-amber-50 text-amber-700 border-amber-200' },
        'paid': { label: 'Paid', class: 'bg-blue-50 text-blue-700 border-blue-200' },
        'driver_assigned': { label: 'Assigned', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        'driver_accepted': { label: 'Accepted', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        'picked_up': { label: 'Picked Up', class: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
        'on_the_way': { label: 'On The Way', class: 'bg-blue-50 text-blue-700 border-blue-200' },
        'delivered': { label: 'Delivered', class: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        'pending-pickup': { label: 'Rejected', class: 'bg-red-50 text-red-700 border-red-200' }
    };
    const c = config[status] || config['pending'];
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.class}`}>{c.label}</span>;
};

const TypeBadge = ({ type }) => {
    const t = (type || '').toLowerCase();
    const c = typeConfig[t] || { label: type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Standard', class: 'bg-slate-100 text-slate-600 border-slate-200' };
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.class}`}>{c.label}</span>;
};

const PriorityBadge = ({ priority }) => {
    const c = priorityConfig[priority] || priorityConfig.medium;
    return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.class}`}>{c.label}</span>;
};

/* ─── Mini Map ─── */
const MiniMap = React.memo(({ parcels }) => {
    const active = parcels.filter(p => ['driver_accepted', 'picked_up', 'on_the_way'].includes(p.deliveryStatus));
    const markers = active.slice(0, 6).map(p => ({
        pickup: getCoords(p.senderDistrict),
        drop: getCoords(p.receiverDistrict)
    }));

    return (
        <div className="h-40 rounded-xl overflow-hidden border border-slate-200">
            <MapContainer center={[23.8103, 90.4125]} zoom={11} scrollWheelZoom={false} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {markers.map((m, i) => (
                    <React.Fragment key={i}>
                        <Marker position={m.pickup} icon={customMarker('#10b981')} />
                        <Marker position={m.drop} icon={customMarker('#ef4444')} />
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
});

/* ─── Main Component ─── */
const AssignRider = () => {
    const { isAdmin } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const [searchQuery, setSearchQuery] = useState('');
    const [districtFilter, setDistrictFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [riderSearch, setRiderSearch] = useState('');
    const [selectedRiderId, setSelectedRiderId] = useState('');
    const pageSize = 5;

    /* ── Queries ── */
    const { data: parcelsData, isLoading: parcelsLoading } = useQuery({
        queryKey: ['admin-parcels'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin/parcels');
            return res.data?.parcels || [];
        },
        enabled: !!isAdmin,
    });

    const { data: ridersData, isLoading: ridersLoading } = useQuery({
        queryKey: ['admin-riders-approved'],
        queryFn: async () => {
            const res = await axiosSecure.get('/riders?status=approved');
            return res.data?.riders || [];
        },
        enabled: !!isAdmin,
    });

    const allParcels = parcelsData || [];
    const allRiders = ridersData || [];

    /* ── Stats ── */
    const pendingParcelsCount = allParcels.filter(p => !['driver_assigned', 'driver_accepted', 'picked_up', 'on_the_way', 'delivered', 'pending-pickup'].includes(p.deliveryStatus)).length;
    const availableRidersCount = allRiders.filter(r => r.workStatus === 'Available' || r.isOnline === true).length;
    const activeDeliveriesCount = allParcels.filter(p => ['driver_accepted', 'picked_up', 'on_the_way'].includes(p.deliveryStatus)).length;
    const deliveredTodayCount = allParcels.filter(p => p.deliveryStatus === 'delivered' && isToday(p.updatedAt)).length;
    const rejectedRequestsCount = allParcels.filter(p => p.deliveryStatus === 'pending-pickup').length;

    /* ── Filtered table parcels ── */
    const tableParcels = useMemo(() => {
        let result = allParcels.filter(p => !['driver_assigned', 'driver_accepted', 'picked_up', 'on_the_way', 'delivered'].includes(p.deliveryStatus));

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                (p.trackingId || '').toLowerCase().includes(q) ||
                (p.parcelName || '').toLowerCase().includes(q) ||
                (p.receiverName || '').toLowerCase().includes(q)
            );
        }
        if (districtFilter !== 'all') {
            result = result.filter(p => (p.senderDistrict || '').toLowerCase() === districtFilter.toLowerCase());
        }
        if (statusFilter !== 'all') {
            result = result.filter(p => (p.deliveryStatus || '') === statusFilter);
        }
        if (paymentFilter !== 'all') {
            result = result.filter(p => (p.paymentStatus || '') === paymentFilter);
        }

        if (sortBy === 'newest') {
            result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        } else if (sortBy === 'oldest') {
            result.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        } else if (sortBy === 'cost-high') {
            result.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
        } else if (sortBy === 'cost-low') {
            result.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
        }

        return result;
    }, [allParcels, searchQuery, districtFilter, statusFilter, paymentFilter, sortBy]);

    const totalPages = Math.max(1, Math.ceil(tableParcels.length / pageSize));
    const paginatedParcels = tableParcels.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    /* ── Districts list ── */
    const districts = useMemo(() => {
        const set = new Set(allParcels.map(p => p.senderDistrict).filter(Boolean));
        return Array.from(set).sort();
    }, [allParcels]);

    /* ── Modal riders ── */
    const modalRiders = useMemo(() => {
        let riders = allRiders.map(r => {
            const activeCount = allParcels.filter(p =>
                p.riderEmail === r.email &&
                ['driver_accepted', 'picked_up', 'on_the_way'].includes(p.deliveryStatus)
            ).length;
            const earningsToday = allParcels.filter(p =>
                p.riderEmail === r.email &&
                p.deliveryStatus === 'delivered' &&
                isToday(p.updatedAt)
            ).reduce((sum, p) => sum + (p.totalPrice || 0) * 0.7, 0);
            return { ...r, activeCount, earningsToday, rating: r.rating || 4.5 };
        });

        if (riderSearch.trim()) {
            const q = riderSearch.toLowerCase();
            riders = riders.filter(r =>
                (r.name || '').toLowerCase().includes(q) ||
                (r.district || '').toLowerCase().includes(q)
            );
        }

        return riders;
    }, [allRiders, allParcels, riderSearch]);

    /* ── Recent assignments ── */
    const recentAssignments = useMemo(() => {
        return allParcels
            .filter(p => p.deliveryStatus === 'driver_assigned')
            .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0))
            .slice(0, 5);
    }, [allParcels]);

    /* ── Rider status counts ── */
    const onlineRiders = allRiders.filter(r => r.workStatus === 'Available' || r.isOnline === true).length;
    const busyRiders = allRiders.filter(r => r.workStatus === 'in_delivery').length;
    const offlineRiders = allRiders.filter(r => r.workStatus === 'Unavailable' || r.isOnline === false).length;

    /* ── Assign mutation ── */
    const assignRiderMutation = useMutation({
        mutationFn: async ({ parcelId, riderId, riderName, riderEmail }) => {
            return axiosSecure.patch(`/parcels/${parcelId}`, {
                deliveryStatus: 'driver_assigned',
                riderId,
                riderName,
                riderEmail
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-parcels'] });
            queryClient.invalidateQueries({ queryKey: ['admin-riders-approved'] });
            Swal.fire({
                title: 'Assigned!',
                text: 'Rider has been successfully assigned to the parcel.',
                icon: 'success',
                confirmButtonColor: '#10b981',
                timer: 2000,
            });
            setShowModal(false);
            setSelectedRiderId('');
            setRiderSearch('');
        },
        onError: () => {
            Swal.fire('Error', 'Failed to assign rider. Please try again.', 'error');
        }
    });

    const openModal = (parcel) => {
        setSelectedParcel(parcel);
        setSelectedRiderId('');
        setRiderSearch('');
        setShowModal(true);
    };

    const handleAssign = () => {
        if (!selectedRiderId) {
            Swal.fire({ title: 'Select Rider', text: 'Please select a rider to assign.', icon: 'warning', confirmButtonColor: '#f59e0b' });
            return;
        }
        const rider = modalRiders.find(r => r._id === selectedRiderId);
        if (!rider) return;
        assignRiderMutation.mutate({
            parcelId: selectedParcel._id,
            riderId: selectedRiderId,
            riderName: rider.name || '',
            riderEmail: rider.email || ''
        });
    };

    if (!isAdmin) return null;

    const startIdx = tableParcels.length > 0 ? (currentPage - 1) * pageSize + 1 : 0;
    const endIdx = Math.min(currentPage * pageSize, tableParcels.length);

    return (
        <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Assign Rider</h1>
                    <p className="text-sm text-slate-500 mt-1">Assign available riders to pending parcels</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <StatCard icon="📦" label="Pending Parcels" value={pendingParcelsCount} subtext="Waiting for assignment" colorClass="bg-blue-50 text-blue-600" />
                    <StatCard icon="🛵" label="Available Riders" value={availableRidersCount} subtext="Online & Available" colorClass="bg-emerald-50 text-emerald-600" />
                    <StatCard icon="🚚" label="Active Deliveries" value={activeDeliveriesCount} subtext="On the way" colorClass="bg-amber-50 text-amber-600" />
                    <StatCard icon="✅" label="Delivered Today" value={deliveredTodayCount} subtext="Completed" colorClass="bg-purple-50 text-purple-600" />
                    <StatCard icon="❌" label="Rejected Requests" value={rejectedRequestsCount} subtext="Today" colorClass="bg-red-50 text-red-600" />
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
                        <div className="relative flex-1 w-full">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by Tracking ID / Parcel Name / Receiver..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                            <select value={districtFilter} onChange={(e) => { setDistrictFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="all">All District</option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="all">All Status</option>
                                <option value="awaiting-payment">Awaiting Payment</option>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                            </select>
                            <select value={paymentFilter} onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="all">All Payment Status</option>
                                <option value="paid">Paid</option>
                                <option value="unpaid">Unpaid</option>
                            </select>
                            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2.5 text-sm text-slate-800 border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <option value="newest">Sort By: Newest</option>
                                <option value="oldest">Sort By: Oldest</option>
                                <option value="cost-high">Cost: High to Low</option>
                                <option value="cost-low">Cost: Low to High</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                    {/* Table */}
                    <div className="xl:col-span-3 space-y-4">
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            {parcelsLoading ? (
                                <div className="flex justify-center items-center py-20">
                                    <span className="loading loading-spinner loading-lg text-emerald-600"></span>
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Parcel Info</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Sender / Receiver</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Route</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Type</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Cost</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Payment</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Priority</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Created At</th>
                                                    <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide text-center">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {paginatedParcels.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="10" className="px-4 py-12 text-center text-slate-500">
                                                            <div className="text-4xl mb-2">📭</div>
                                                            <p className="font-semibold">No pending parcels found</p>
                                                            <p className="text-xs text-slate-400 mt-1">All parcels have been assigned or delivered</p>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    paginatedParcels.map((parcel) => (
                                                        <tr key={parcel._id} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="px-4 py-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-sm shrink-0">📦</div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-800">{parcel.parcelName || 'Unnamed'}</p>
                                                                        <p className="text-[10px] text-slate-400 font-mono">{parcel.trackingId || `TRK-${parcel._id?.slice(-6)?.toUpperCase()}`}</p>
                                                                        <p className="text-[10px] text-slate-400">{parcel.parcelWeight || 1} kg</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="text-xs space-y-0.5">
                                                                    <p className="text-slate-700 font-medium">{parcel.senderName || '—'}</p>
                                                                    <p className="text-slate-500">→ {parcel.receiverName || '—'}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3">
                                                                <div className="text-xs space-y-0.5">
                                                                    <p className="text-slate-700 font-medium">{parcel.senderDistrict || '—'}</p>
                                                                    <p className="text-slate-400">→ {parcel.receiverDistrict || '—'}</p>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3"><TypeBadge type={parcel.parcelType} /></td>
                                                            <td className="px-4 py-3 text-sm font-bold text-emerald-700">৳{parcel.totalPrice || 0}</td>
                                                            <td className="px-4 py-3"><PaymentBadge status={parcel.paymentStatus} /></td>
                                                            <td className="px-4 py-3"><DeliveryStatusBadge status={parcel.deliveryStatus} /></td>
                                                            <td className="px-4 py-3"><PriorityBadge priority={getPriority(parcel)} /></td>
                                                            <td className="px-4 py-3 text-xs text-slate-500">{formatDate(parcel.createdAt)}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    onClick={() => openModal(parcel)}
                                                                    className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition shadow-sm"
                                                                >
                                                                    Assign Rider
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {tableParcels.length > 0 && (
                                        <div className="px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                                            <p className="text-xs text-slate-500">
                                                Showing {startIdx} to {endIdx} of {tableParcels.length} entries
                                            </p>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={currentPage === 1}
                                                    className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition"
                                                >←</button>
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`w-7 h-7 text-xs font-medium rounded-md transition ${currentPage === page ? 'bg-emerald-600 text-white' : 'hover:bg-slate-50 text-slate-600'}`}
                                                    >{page}</button>
                                                ))}
                                                <button
                                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={currentPage === totalPages}
                                                    className="px-2.5 py-1 text-xs font-medium border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 transition"
                                                >→</button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Sidebar */}
                    <div className="xl:col-span-1 space-y-5">
                        {/* Rider Status Overview */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 mb-4">Rider Status Overview</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs shrink-0">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-emerald-700">Online Riders</p>
                                            <p className="text-[10px] text-emerald-500">Available for assignment</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-emerald-700">{onlineRiders}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs shrink-0">
                                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-amber-700">Busy Riders</p>
                                            <p className="text-[10px] text-amber-500">On active deliveries</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-amber-700">{busyRiders}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs shrink-0">
                                            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-600">Offline Riders</p>
                                            <p className="text-[10px] text-slate-400">Currently offline</p>
                                        </div>
                                    </div>
                                    <span className="text-lg font-bold text-slate-600">{offlineRiders}</span>
                                </div>
                            </div>
                        </div>

                        {/* Live Map */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 mb-3">Live Map Overview</h3>
                            <MiniMap parcels={allParcels} />
                            <div className="grid grid-cols-2 gap-3 mt-3">
                                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-center">
                                    <p className="text-[10px] text-slate-400">Active Deliveries</p>
                                    <p className="text-lg font-bold text-slate-700">{activeDeliveriesCount}</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-center">
                                    <p className="text-[10px] text-slate-400">Total Riders</p>
                                    <p className="text-lg font-bold text-slate-700">{allRiders.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Assignments */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-800 mb-4">Recent Assignments</h3>
                            <div className="space-y-3">
                                {recentAssignments.length === 0 ? (
                                    <p className="text-xs text-slate-400 text-center py-2">No recent assignments</p>
                                ) : (
                                    recentAssignments.map((parcel, i) => (
                                        <div key={i} className="flex items-start gap-3 pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                                            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-xs text-emerald-600 shrink-0">📦</div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-slate-700 truncate">{parcel.parcelName || 'Unnamed'}</p>
                                                <p className="text-[10px] text-slate-400 font-mono">{parcel.trackingId || `TRK-${parcel._id?.slice(-6)?.toUpperCase()}`}</p>
                                                <p className="text-[10px] text-slate-400">{formatDate(parcel.updatedAt)}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Assign Rider Modal */}
            {showModal && selectedParcel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Assign Rider</h3>
                                <p className="text-xs text-slate-500 font-mono">Tracking ID: {selectedParcel.trackingId || `TRK-${selectedParcel._id?.slice(-6)?.toUpperCase()}`}</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto">
                            {/* Parcel Info Bar */}
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-5 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-lg shrink-0">📦</div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{selectedParcel.parcelName || 'Unnamed Parcel'}</p>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                                        <span>Pickup: <span className="font-semibold text-slate-700">{selectedParcel.senderDistrict || '—'}</span></span>
                                        <span>→</span>
                                        <span>Delivery: <span className="font-semibold text-slate-700">{selectedParcel.receiverDistrict || '—'}</span></span>
                                    </div>
                                </div>
                            </div>

                            {/* Search */}
                            <div className="relative mb-4">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search rider by name or district..."
                                    value={riderSearch}
                                    onChange={(e) => setRiderSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>

                            {/* Riders Table */}
                            {ridersLoading ? (
                                <div className="flex justify-center items-center py-10">
                                    <span className="loading loading-spinner loading-md text-emerald-600"></span>
                                </div>
                            ) : modalRiders.length === 0 ? (
                                <div className="text-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                    <div className="text-4xl mb-2">🛵</div>
                                    <p className="font-semibold text-slate-600">No riders found</p>
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-xl overflow-hidden">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-slate-50 border-b border-slate-200">
                                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Rider</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">District</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide">Status</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide text-center">Active</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide text-center">Rating</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide text-right">Earnings</th>
                                                <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wide text-center">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {modalRiders.map((rider) => {
                                                const isSelected = selectedRiderId === rider._id;
                                                const isOnline = rider.workStatus === 'Available' || rider.isOnline === true;
                                                const isBusy = rider.workStatus === 'in_delivery';
                                                const overloaded = rider.activeCount >= 3;

                                                return (
                                                    <tr
                                                        key={rider._id}
                                                        className={`transition-colors ${isSelected ? 'bg-emerald-50/60' : 'hover:bg-slate-50/50'}`}
                                                    >
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative shrink-0">
                                                                    {rider.photo ? (
                                                                        <img src={rider.photo} alt={rider.name} className="w-9 h-9 rounded-full object-cover border border-slate-200" />
                                                                    ) : (
                                                                        <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold border border-slate-200">
                                                                            {rider.name?.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    )}
                                                                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${isOnline ? 'bg-emerald-500' : isBusy ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-800">{rider.name}</p>
                                                                    <p className="text-[10px] text-slate-400 font-mono">ID: RID-{rider._id?.slice(-4)?.toUpperCase()}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-slate-600">{rider.district || rider.region || '—'}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${isOnline ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isBusy ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-emerald-500' : isBusy ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                                                                {isOnline ? 'Online' : isBusy ? 'Busy' : 'Offline'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center text-xs font-semibold text-slate-700">{rider.activeCount}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            <div className="flex items-center justify-center gap-0.5 text-amber-400 text-xs">
                                                                {'★'.repeat(Math.floor(rider.rating))}
                                                                <span className="text-slate-300 text-[10px]">{'★'.repeat(5 - Math.floor(rider.rating))}</span>
                                                                <span className="text-slate-500 text-[10px] ml-1">{rider.rating}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3 text-right text-xs font-semibold text-slate-700">৳{Math.round(rider.earningsToday)}</td>
                                                        <td className="px-4 py-3 text-center">
                                                            {isOnline ? (
                                                                <button
                                                                    onClick={() => setSelectedRiderId(rider._id)}
                                                                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition ${isSelected ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'}`}
                                                                >
                                                                    {isSelected ? 'Selected ✓' : 'Assign'}
                                                                </button>
                                                            ) : isBusy ? (
                                                                <span className={`inline-flex items-center px-3 py-1.5 text-[10px] font-bold rounded-lg ${overloaded ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                                    {overloaded ? '⚠️ Overloaded' : 'Busy'}
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center px-3 py-1.5 text-[10px] font-bold rounded-lg bg-slate-100 text-slate-500 border border-slate-200">
                                                                    Offline
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Overloaded warning */}
                            {modalRiders.some(r => r.activeCount >= 3 && (r.workStatus === 'Available' || r.isOnline === true)) && (
                                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-2">
                                    <span className="text-amber-600 text-sm">⚠️</span>
                                    <p className="text-xs text-amber-700">Some riders are overloaded with 3+ active deliveries. Consider assigning to a less busy rider.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 bg-slate-50">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-white transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={assignRiderMutation.isPending || !selectedRiderId}
                                className="flex-1 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
                            >
                                {assignRiderMutation.isPending ? <span className="loading loading-spinner loading-sm"></span> : 'Assign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignRider;
