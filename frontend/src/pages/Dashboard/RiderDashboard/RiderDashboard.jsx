import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import Swal from 'sweetalert2';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

// Fix for leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom map icons
const createCustomIcon = (color) => new L.DivIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color:${color};width:12px;height:12px;border-radius:50%;border:2px solid white;box-shadow:0 0 0 2px ${color}40;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6]
});

const statusColorMap = {
    'Assigned': 'amber',
    'Pickup Ready': 'blue',
    'On The Way': 'emerald',
    'Delivered': 'emerald'
};

const RiderDashboard = () => {
    const { user, userProfile } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // Fetch rider status
    const { data: riderStatusData } = useQuery({
        queryKey: ['rider-status'],
        queryFn: async () => {
            const res = await axiosSecure.get('/rider/status');
            return res.data;
        },
        enabled: !!user?.email
    });

    const isOnline = riderStatusData?.isOnline ?? true;

    // Fetch dashboard stats
    const { data: statsData, isLoading: statsLoading } = useQuery({
        queryKey: ['rider-dashboard-stats'],
        queryFn: async () => {
            const res = await axiosSecure.get('/rider/dashboard-stats');
            return res.data;
        },
        enabled: !!user?.email
    });

    // Fetch assigned deliveries
    const { data: deliveriesData, isLoading: deliveriesLoading } = useQuery({
        queryKey: ['rider-dashboard-deliveries'],
        queryFn: async () => {
            const res = await axiosSecure.get('/rider/assigned-deliveries');
            return res.data;
        },
        enabled: !!user?.email
    });

    // Fetch active delivery
    const { data: activeDeliveryData } = useQuery({
        queryKey: ['rider-active-delivery'],
        queryFn: async () => {
            const res = await axiosSecure.get('/rider/active-delivery');
            return res.data;
        },
        enabled: !!user?.email
    });

    // Fetch weekly earnings
    const { data: earningsData, isLoading: earningsLoading } = useQuery({
        queryKey: ['rider-weekly-earnings'],
        queryFn: async () => {
            const res = await axiosSecure.get('/rider/weekly-earnings');
            return res.data;
        },
        enabled: !!user?.email
    });

    // Toggle online status mutation
    const toggleStatusMutation = useMutation({
        mutationFn: async (newStatus) => {
            const res = await axiosSecure.patch('/rider/status', { isOnline: newStatus });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rider-status'] });
            queryClient.invalidateQueries({ queryKey: ['rider-dashboard-stats'] });
        },
        onError: (error) => {
            Swal.fire('Error', error?.response?.data?.message || 'Failed to update status', 'error');
        }
    });

    // Update delivery status mutation
    const updateDeliveryMutation = useMutation({
        mutationFn: async ({ parcelId, deliveryStatus }) => {
            const res = await axiosSecure.patch(`/rider/delivery/${parcelId}/status`, { deliveryStatus });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rider-dashboard-deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['rider-active-delivery'] });
            queryClient.invalidateQueries({ queryKey: ['rider-dashboard-stats'] });
            queryClient.invalidateQueries({ queryKey: ['rider-weekly-earnings'] });
            Swal.fire({
                title: 'Success!',
                text: 'Delivery status updated.',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
        },
        onError: (error) => {
            Swal.fire('Error', error?.response?.data?.message || 'Failed to update delivery', 'error');
        }
    });

    // Reject delivery mutation (uses existing parcels endpoint for backwards compat)
    const rejectDeliveryMutation = useMutation({
        mutationFn: async (parcelId) => {
            const res = await axiosSecure.patch(`/parcels/${parcelId}`, {
                deliveryStatus: 'pending-pickup',
                riderId: null,
                riderName: '',
                riderEmail: ''
            });
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rider-dashboard-deliveries'] });
            queryClient.invalidateQueries({ queryKey: ['rider-active-delivery'] });
            queryClient.invalidateQueries({ queryKey: ['rider-dashboard-stats'] });
            Swal.fire({
                title: 'Rejected',
                text: 'Delivery has been unassigned.',
                icon: 'info',
                timer: 1500,
                showConfirmButton: false
            });
        },
        onError: (error) => {
            Swal.fire('Error', error?.response?.data?.message || 'Failed to reject delivery', 'error');
        }
    });

    const handleToggleOnline = () => {
        toggleStatusMutation.mutate(!isOnline);
    };

    const handleAccept = (delivery) => {
        updateDeliveryMutation.mutate({ parcelId: delivery.id, deliveryStatus: 'driver_accepted' });
    };

    const handleReject = (delivery) => {
        Swal.fire({
            title: 'Reject Delivery?',
            text: 'This will send the parcel back to admin for reassignment.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, reject it!'
        }).then((result) => {
            if (result.isConfirmed) {
                rejectDeliveryMutation.mutate(delivery.id);
            }
        });
    };

    const handlePickUp = (delivery) => {
        updateDeliveryMutation.mutate({ parcelId: delivery.id, deliveryStatus: 'picked_up' });
    };

    const handleConfirm = (delivery) => {
        updateDeliveryMutation.mutate({ parcelId: delivery.id, deliveryStatus: 'delivered' });
    };

    const stats = statsData?.stats || { assignedCount: 0, pendingPickups: 0, completedToday: 0, todayEarnings: 0 };

    const statCards = [
        {
            label: 'ASSIGNED DELIVERIES',
            value: String(stats.assignedCount || 0),
            subtext: `${stats.assignedCount || 0} active assignments`,
            accent: 'border-t-2 border-cyan-500',
            indicator: 'bg-slate-700',
            indicatorDot: 'bg-cyan-400'
        },
        {
            label: 'PENDING PICKUPS',
            value: String(stats.pendingPickups || 0),
            subtext: `${stats.pendingPickups || 0} awaiting pickup`,
            accent: 'border-t-2 border-amber-500',
            indicator: 'bg-red-500/20',
            indicatorDot: 'bg-red-500'
        },
        {
            label: 'COMPLETED TODAY',
            value: String(stats.completedToday || 0),
            subtext: 'deliveries today',
            accent: 'border-t-2 border-emerald-500',
            indicator: 'bg-emerald-500/20',
            indicatorIcon: 'check'
        },
        {
            label: 'TODAY\'S EARNINGS',
            value: `৳ ${(stats.todayEarnings || 0).toLocaleString()}`,
            subtext: 'commission earned today',
            accent: 'border-t-2 border-violet-500',
            indicator: 'bg-orange-500/20',
            indicatorDot: 'bg-orange-500'
        }
    ];

    const activeDeliveries = deliveriesData?.deliveries || [];
    const assignedCount = activeDeliveries.length;

    const weeklyEarnings = (earningsData?.weeklyEarnings || []).map(d => ({
        day: d.isToday ? 'Today' : d.day,
        amount: d.earnings > 0 ? Math.min(Math.max(d.earnings / 50, 10), 100) : 5,
        earnings: d.earnings,
        highlight: d.isToday
    }));

    // Fallback empty state for earnings chart
    const fallbackEarnings = [
        { day: 'Mon', amount: 5, highlight: false },
        { day: 'Tue', amount: 5, highlight: false },
        { day: 'Wed', amount: 5, highlight: false },
        { day: 'Thu', amount: 5, highlight: false },
        { day: 'Fri', amount: 5, highlight: false },
        { day: 'Sat', amount: 5, highlight: false },
        { day: 'Sun', amount: 5, highlight: false }
    ];
    const chartData = weeklyEarnings.length > 0 ? weeklyEarnings : fallbackEarnings;
    const totalWeeklyEarnings = (earningsData?.weeklyEarnings || []).reduce((sum, d) => sum + d.earnings, 0);

    // Build timeline from active delivery
    const activeDelivery = activeDeliveryData?.activeDelivery;
    const timeline = activeDelivery ? buildTimeline(activeDelivery.statusRaw) : [];
    const routeCoordinates = activeDelivery?.route || [[23.8103, 90.4125], [23.8103, 90.4125], [23.8103, 90.4125]];

    const todayDate = new Date().toLocaleDateString('en-US', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const getStatusBadge = (status) => {
        const color = statusColorMap[status] || 'amber';
        const colors = {
            amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
            blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
            emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
        };
        const dotColors = {
            amber: 'bg-amber-400',
            blue: 'bg-blue-400',
            emerald: 'bg-emerald-400'
        };
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colors[color]}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[color]}`}></span>
                {status}
            </span>
        );
    };

    const getActionButtons = (delivery) => {
        const status = delivery.status;
        const isUpdating = updateDeliveryMutation.isPending || rejectDeliveryMutation.isPending;
        if (status === 'Assigned') {
            return (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleAccept(delivery)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {updateDeliveryMutation.isPending ? '...' : 'Accept'}
                    </button>
                    <button
                        onClick={() => handleReject(delivery)}
                        disabled={isUpdating}
                        className="px-3 py-1.5 border border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {rejectDeliveryMutation.isPending ? '...' : 'Reject'}
                    </button>
                </div>
            );
        }
        if (status === 'Pickup Ready') {
            return (
                <button
                    onClick={() => handlePickUp(delivery)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                    {updateDeliveryMutation.isPending ? '...' : 'Pick Up'}
                </button>
            );
        }
        if (status === 'On The Way') {
            return (
                <button
                    onClick={() => handleConfirm(delivery)}
                    disabled={isUpdating}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                    {updateDeliveryMutation.isPending ? '...' : 'Confirm'}
                </button>
            );
        }
        return <span className="text-xs text-slate-500">—</span>;
    };

    return (
        <div className="min-h-screen bg-[#0b1120] -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 text-slate-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">👋</span>
                        Good Morning, {userProfile?.displayName || user?.displayName || 'Rider'}!
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">
                        {todayDate} • Dhaka, Bangladesh
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Toggle Switch */}
                    <button
                        onClick={handleToggleOnline}
                        disabled={toggleStatusMutation.isPending}
                        className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 rounded-full px-1.5 py-1.5 transition-all disabled:opacity-50"
                        aria-label={isOnline ? 'Go offline' : 'Go online'}
                    >
                        {/* Track */}
                        <div className="relative flex items-center">
                            {/* Slider thumb */}
                            <div
                                className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${
                                    isOnline ? 'bg-emerald-500' : 'bg-slate-600'
                                }`}
                            >
                                <div
                                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
                                        isOnline ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                                >
                                    {toggleStatusMutation.isPending && (
                                        <span className="absolute inset-0 flex items-center justify-center">
                                            <span className="w-2.5 h-2.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <span className={`text-sm font-semibold pr-2 ${isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
                            {isOnline ? 'Online' : 'Offline'}
                        </span>
                    </button>
                    <button className="relative w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 hover:bg-slate-700 transition">
                        <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-800"></span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {statCards.map((stat, idx) => (
                    <div key={idx} className={`bg-[#1e293b]/80 rounded-xl p-5 border border-slate-700/50 ${stat.accent} relative`}>
                        <div className="absolute top-4 right-4">
                            {stat.indicatorIcon === 'check' ? (
                                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className={`w-4 h-4 rounded-full ${stat.indicator} flex items-center justify-center`}>
                                    {stat.indicatorDot && <div className={`w-2 h-2 rounded-full ${stat.indicatorDot}`}></div>}
                                </div>
                            )}
                        </div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-white mb-1">{statsLoading ? <span className="loading loading-spinner loading-sm"></span> : stat.value}</p>
                        <p className="text-xs text-slate-500">{stat.subtext}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Active Deliveries */}
                    <div className="bg-[#1e293b]/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">🚚</span>
                                <h2 className="text-base font-bold text-white">Active Deliveries</h2>
                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">
                                    {assignedCount} Assigned
                                </span>
                            </div>
                            <button
                                onClick={() => navigate('/dashboard/assigned-deliveries')}
                                className="text-sm text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1 transition"
                            >
                                View All
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            {deliveriesLoading ? (
                                <div className="flex justify-center items-center py-12">
                                    <span className="loading loading-spinner loading-lg text-emerald-500"></span>
                                </div>
                            ) : activeDeliveries.length === 0 ? (
                                <div className="text-center py-12 text-slate-500">
                                    <div className="text-4xl mb-3">📭</div>
                                    <p className="font-semibold text-slate-400">No Active Deliveries</p>
                                    <p className="text-xs mt-1">Check the Assigned Deliveries page for new assignments.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-slate-700/50">
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Parcel</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Pickup</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Delivery</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tracking ID</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/30">
                                        {activeDeliveries.map((delivery) => (
                                            <tr key={delivery.id} className="hover:bg-slate-700/20 transition">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="text-sm font-semibold text-white">{delivery.name}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5">{delivery.category} - {delivery.weight}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-300">{delivery.pickup}</td>
                                                <td className="px-6 py-4 text-sm text-slate-300">{delivery.delivery}</td>
                                                <td className="px-6 py-4 text-xs font-mono text-slate-400">{delivery.trackingId}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(delivery.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getActionButtons(delivery)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Weekly Earnings */}
                    <div className="bg-[#1e293b]/50 rounded-2xl border border-slate-700/50 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="text-lg">📊</span>
                                <div>
                                    <h2 className="text-base font-bold text-white">Weekly Earnings</h2>
                                    <p className="text-xs text-slate-400">This week - Dhaka Zone</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 text-emerald-400 font-bold text-lg">
                                <span>৳</span>
                                <span>{totalWeeklyEarnings.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex items-end gap-2 h-40">
                            {earningsLoading ? (
                                <div className="flex-1 flex justify-center items-center h-full">
                                    <span className="loading loading-spinner loading-md text-emerald-500"></span>
                                </div>
                            ) : (
                                chartData.map((item, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full bg-slate-700/50 rounded-t-lg relative h-32 overflow-hidden">
                                            <div
                                                className={`absolute bottom-0 left-0 right-0 rounded-t-lg transition-all ${item.highlight ? 'bg-emerald-500' : 'bg-emerald-500/30'}`}
                                                style={{ height: `${item.amount}%` }}
                                            ></div>
                                        </div>
                                        <span className={`text-xs ${item.highlight ? 'text-emerald-400 font-medium' : 'text-slate-500'}`}>{item.day}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Active Delivery Status */}
                    <div className="bg-[#1e293b]/50 rounded-2xl border border-slate-700/50 p-6">
                        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                            <span>📍</span>
                            Active Delivery Status
                        </h2>

                        {activeDelivery ? (
                            <>
                                {/* Current Parcel Card */}
                                <div className="bg-[#1e293b] rounded-xl p-3 mb-5 flex items-center gap-3 border border-slate-600/30">
                                    <div className="w-10 h-10 bg-slate-600/50 rounded-lg flex items-center justify-center text-lg shrink-0">
                                        📦
                                    </div>
                                    <div>
                                        <p className="text-xs font-mono text-slate-400">{activeDelivery.trackingId}</p>
                                        <p className="text-sm font-semibold text-white">{activeDelivery.name}</p>
                                    </div>
                                </div>

                                {/* Timeline */}
                                <div className="relative pl-2">
                                    {timeline.map((item, idx) => (
                                        <div key={idx} className="relative pb-6 last:pb-0">
                                            {idx < timeline.length - 1 && (
                                                <div className={`absolute left-[11px] top-6 w-0.5 h-full ${item.completed ? 'bg-emerald-500/30' : 'bg-slate-700'}`}></div>
                                            )}
                                            <div className="flex items-start gap-4">
                                                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 border-2 ${
                                                    item.completed
                                                        ? item.current
                                                            ? 'bg-blue-500 border-blue-500'
                                                            : 'bg-emerald-500 border-emerald-500'
                                                        : 'bg-transparent border-slate-600'
                                                }`}>
                                                    {item.completed && !item.current && (
                                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                    {item.current && (
                                                        <div className="w-2 h-2 bg-white rounded-full"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className={`text-sm font-semibold ${item.completed ? 'text-white' : 'text-slate-500'}`}>
                                                        {item.label}
                                                    </p>
                                                    <p className={`text-xs mt-0.5 ${item.current ? 'text-blue-400' : item.completed ? 'text-slate-400' : 'text-slate-600'}`}>
                                                        {item.time}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-8 text-slate-500">
                                <div className="text-4xl mb-3">🛵</div>
                                <p className="font-semibold text-slate-400">No Active Delivery</p>
                                <p className="text-xs mt-1">Pick up a delivery to see status here.</p>
                            </div>
                        )}
                    </div>

                    {/* Route Preview */}
                    <div className="bg-[#1e293b]/50 rounded-2xl border border-slate-700/50 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                            <h2 className="text-base font-bold text-white flex items-center gap-2">
                                <span>🗺️</span>
                                Route Preview
                            </h2>
                            {activeDelivery && (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    LIVE
                                </span>
                            )}
                        </div>
                        <div className="p-4">
                            <div className="h-64 rounded-xl overflow-hidden bg-slate-900">
                                <MapContainer
                                    center={routeCoordinates[0] || [23.8103, 90.4125]}
                                    zoom={12}
                                    zoomControl={false}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                                    />
                                    <Polyline positions={routeCoordinates} color="#06b6d4" weight={3} opacity={0.8} />
                                    {routeCoordinates[0] && (
                                        <Marker position={routeCoordinates[0]} icon={createCustomIcon('#10b981')}>
                                            <Popup>You</Popup>
                                        </Marker>
                                    )}
                                    {routeCoordinates[1] && (
                                        <Marker position={routeCoordinates[1]} icon={createCustomIcon('#f59e0b')}>
                                            <Popup>Pickup</Popup>
                                        </Marker>
                                    )}
                                    {routeCoordinates[2] && (
                                        <Marker position={routeCoordinates[routeCoordinates.length - 1]} icon={createCustomIcon('#ef4444')}>
                                            <Popup>Drop</Popup>
                                        </Marker>
                                    )}
                                </MapContainer>
                            </div>
                            {/* Legend */}
                            <div className="flex items-center gap-4 mt-3 px-1">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-xs text-slate-400">You</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                    <span className="text-xs text-slate-400">Pickup</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                    <span className="text-xs text-slate-400">Drop</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-0.5 bg-cyan-400"></div>
                                    <span className="text-xs text-slate-400">Route</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Build timeline from raw delivery status
function buildTimeline(statusRaw) {
    const steps = [
        { label: 'Assigned', time: 'Accepted by rider', color: 'emerald' },
        { label: 'Picked Up', time: 'Awaiting pickup', color: 'emerald' },
        { label: 'On The Way', time: 'In progress', color: 'blue' },
        { label: 'Delivered', time: 'Estimated soon', color: 'slate' }
    ];

    const statusOrder = ['driver_accepted', 'picked_up', 'on_the_way', 'delivered'];
    const currentIndex = statusOrder.indexOf(statusRaw);

    return steps.map((step, idx) => {
        const isCompleted = idx <= currentIndex;
        const isCurrent = idx === currentIndex;
        return {
            ...step,
            completed: isCompleted,
            current: isCurrent
        };
    });
}

export default RiderDashboard;
