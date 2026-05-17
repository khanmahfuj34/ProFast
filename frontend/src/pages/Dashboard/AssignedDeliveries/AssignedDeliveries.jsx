import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import toast from 'react-hot-toast';
import { 
  FiPackage as Package, 
  FiMapPin as MapPin, 
  FiClock as Clock, 
  FiNavigation as Navigation,
  FiChevronLeft as ChevronLeft,
  FiChevronDown as ChevronDown,
  FiChevronUp as ChevronUp,
  FiCheckCircle as CheckCircle,
  FiAlertCircle as AlertCircle,
  FiTruck as Truck,
  FiUser as User,
  FiPhone as Phone,
  FiDollarSign as DollarSign,
  FiActivity as Activity,
  FiHash as Hash,
  FiArrowRight as ArrowRight,
  FiRefreshCw as RefreshCw,
  FiInfo as Info
} from 'react-icons/fi';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useNotifications } from '../../../contexts/NotificationContext';

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

const AssignedDeliveries = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const { socket } = useNotifications();

    const { data: parcels = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['assigned-deliveries', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get('/parcels/assigned');
            return res.data || [];
        },
        enabled: !!user?.email
    });

    // Real-time socket listeners
    useEffect(() => {
        if (!socket) return;

        const handleUpdate = () => {
            queryClient.invalidateQueries({ queryKey: ['assigned-deliveries', user?.email] });
        };

        const handleNewAssignment = (data) => {
            if (data.assignedTo === user?.email) {
                handleUpdate();
                toast.success('New assignment received!', { icon: '📦' });
            }
        };

        socket.on('admin_matching_update', handleNewAssignment);
        socket.on('delivery_accepted', (data) => {
             // Local update for the rider who accepted
             handleUpdate();
        });
        socket.on('parcel_status_updated', handleUpdate);

        return () => {
            socket.off('admin_matching_update', handleNewAssignment);
            socket.off('delivery_accepted');
            socket.off('parcel_status_updated', handleUpdate);
        };
    }, [socket, user?.email, queryClient]);

    const updateStatusMutation = useMutation({
        mutationFn: async ({ parcelId, status }) => {
            return axiosSecure.patch(`/rider/delivery/${parcelId}/status`, { deliveryStatus: status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['assigned-deliveries']);
            queryClient.invalidateQueries(['rider-dashboard-stats']);
            toast.success('Status updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    });

    return (
        <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <Link 
                            to="/dashboard/rider-dashboard" 
                            className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100 text-slate-400 hover:text-blue-600 transition-all hover:shadow-md"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                            Assigned Deliveries
                        </h1>
                    </div>
                    <p className="text-slate-500 font-medium text-lg ml-16">
                        Manage your active delivery journey
                    </p>
                </div>

                <div className="flex items-center gap-3 bg-white p-2 rounded-[2rem] shadow-sm border border-slate-100 ml-16 xl:ml-0">
                    <div className="px-6 py-3 bg-blue-50 rounded-[1.5rem] flex items-center gap-3">
                        <Truck className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-black text-blue-700 uppercase tracking-tighter">
                            {parcels.length} Active Orders
                        </span>
                    </div>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="space-y-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-[2.5rem]"></div>)}
                </div>
            ) : parcels.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-20 text-center shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col items-center">
                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
                        <Activity className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900 mb-3">No Active Deliveries</h3>
                    <p className="text-slate-500 max-w-sm text-lg leading-relaxed mb-10">
                        You don't have any parcels to deliver right now. Accept new requests from the dispatch center.
                    </p>
                    <Link 
                        to="/dashboard/rider/parcel-requests"
                        className="bg-slate-900 text-white font-bold px-10 py-5 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-300 flex items-center gap-3"
                    >
                        Go to Dispatch Center
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8">
                    {parcels.map((parcel, index) => (
                        <DetailedDeliveryCard 
                            key={parcel._id} 
                            parcel={parcel} 
                            index={index}
                            onUpdate={(status) => updateStatusMutation.mutate({ parcelId: parcel._id, status })}
                            isUpdating={updateStatusMutation.isPending && updateStatusMutation.variables?.parcelId === parcel._id}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const DetailedDeliveryCard = ({ parcel, index, onUpdate, isUpdating }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const riderEarning = Math.round((parcel.totalPrice || 0) * 0.7);
    
    // Status mapping for labels
    const getStatusInfo = (status) => {
        const config = {
            'driver_accepted': { label: 'Pending Pickup', color: 'blue', icon: <Clock /> },
            'picked_up': { label: 'In Transit', color: 'indigo', icon: <Navigation /> },
            'on_the_way': { label: 'Near Delivery', color: 'emerald', icon: <Truck /> },
            'delivered': { label: 'Delivered', color: 'green', icon: <CheckCircle /> },
            'delivery_failed': { label: 'Failed', color: 'red', icon: <AlertCircle /> }
        };
        return config[status] || { label: status, color: 'slate', icon: <Info /> };
    };

    const statusInfo = getStatusInfo(parcel.deliveryStatus);
    const pickupCoords = getCoords(parcel.senderDistrict);
    const dropCoords = getCoords(parcel.receiverDistrict);
    const midPoint = [(pickupCoords[0] + dropCoords[0]) / 2, (pickupCoords[1] + dropCoords[1]) / 2];

    return (
        <div 
            className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden hover:border-blue-200 transition-all duration-500 animate-in slide-in-from-bottom-8"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Top Info Bar */}
            <div className="p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center gap-8 justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center flex-shrink-0 text-white shadow-xl shadow-slate-200">
                        <Package className="w-10 h-10" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-black text-slate-900 truncate">{parcel.parcelName || 'Unnamed Parcel'}</h3>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-${statusInfo.color}-50 text-${statusInfo.color}-600 border border-${statusInfo.color}-100 flex items-center gap-1.5`}>
                                <span className={`w-1.5 h-1.5 rounded-full bg-${statusInfo.color}-500 animate-pulse`}></span>
                                {statusInfo.label}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 font-bold text-xs">
                            <span className="flex items-center gap-1"><Hash className="w-3.5 h-3.5" /> {parcel.trackingId}</span>
                            <span>•</span>
                            <span>{parcel.parcelType}</span>
                            <span>•</span>
                            <span>{parcel.parcelWeight}kg</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 lg:gap-10">
                    <div className="flex items-center gap-6 border-x border-slate-50 px-8">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Earnings</p>
                            <p className="text-2xl font-black text-green-600 leading-none">৳{riderEarning}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-100"></div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Fee Status</p>
                            <p className={`text-sm font-black uppercase tracking-tighter ${parcel.paymentStatus === 'paid' ? 'text-blue-600' : 'text-orange-600'}`}>
                                {parcel.paymentStatus === 'paid' ? 'Prepaid' : 'COD'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="px-6 py-4 rounded-2xl bg-slate-50 text-slate-600 font-bold hover:bg-slate-100 transition-all flex items-center gap-2"
                        >
                            View Details
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                        
                        {parcel.deliveryStatus === 'driver_accepted' && (
                            <button 
                                onClick={() => onUpdate('picked_up')}
                                disabled={isUpdating}
                                className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black transition-all shadow-lg shadow-blue-200 flex items-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isUpdating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Package className="w-5 h-5" />}
                                Start Pickup
                            </button>
                        )}

                        {parcel.deliveryStatus === 'picked_up' && (
                            <button 
                                onClick={() => onUpdate('on_the_way')}
                                disabled={isUpdating}
                                className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black transition-all shadow-lg shadow-indigo-200 flex items-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isUpdating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                                Start Delivery
                            </button>
                        )}

                        {parcel.deliveryStatus === 'on_the_way' && (
                            <button 
                                onClick={() => onUpdate('delivered')}
                                disabled={isUpdating}
                                className="px-8 py-4 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-black transition-all shadow-lg shadow-green-200 flex items-center gap-3 active:scale-95 disabled:opacity-50"
                            >
                                {isUpdating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                                Confirm Delivery
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Expanded Section */}
            {isExpanded && (
                <div className="border-t border-slate-50 bg-slate-50/30 animate-in slide-in-from-top-4 duration-500">
                    <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Map & Route */}
                        <div className="space-y-6">
                            <div className="h-64 rounded-3xl overflow-hidden border-4 border-white shadow-xl relative">
                                <MapContainer center={midPoint} zoom={12} scrollWheelZoom={false} className="h-full w-full">
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={pickupCoords} icon={customMarker('#3b82f6')}></Marker>
                                    <Marker position={dropCoords} icon={customMarker('#f97316')}></Marker>
                                    <Polyline positions={[pickupCoords, dropCoords]} color="#3b82f6" weight={4} opacity={0.6} dashArray="10, 10" />
                                </MapContainer>
                                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-100 z-[1000]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Route Distance</p>
                                    <p className="text-sm font-black text-slate-900 flex items-center gap-2">
                                        <Navigation className="w-4 h-4 text-blue-500" /> 8.5 km
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-50"></div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Sender</h4>
                                    </div>
                                    <p className="text-base font-bold text-slate-900 mb-1">{parcel.senderName}</p>
                                    <p className="text-sm text-slate-500 flex items-center gap-2 mb-3">
                                        <Phone className="w-3.5 h-3.5" /> {parcel.senderPhone}
                                    </p>
                                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                                        "{parcel.senderAddress}"
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-orange-50"></div>
                                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Receiver</h4>
                                    </div>
                                    <p className="text-base font-bold text-slate-900 mb-1">{parcel.receiverName}</p>
                                    <p className="text-sm text-slate-500 flex items-center gap-2 mb-3">
                                        <Phone className="w-3.5 h-3.5" /> {parcel.receiverPhone}
                                    </p>
                                    <p className="text-xs text-slate-400 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                                        "{parcel.receiverAddress}"
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Instructions & Notes */}
                        <div className="space-y-6">
                            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-8">
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-3 mb-4">
                                        <Info className="w-5 h-5 text-blue-500" />
                                        Pickup Instructions
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                        {parcel.pickupInstructions || "Please call before arrival. The parcel is fragile."}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-3 mb-4">
                                        <MapPin className="w-5 h-5 text-orange-500" />
                                        Delivery Notes
                                    </h4>
                                    <p className="text-slate-600 text-sm leading-relaxed bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                                        {parcel.deliveryInstructions || "Deliver to 3rd floor, door number 302."}
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Assigned On</p>
                                        <p className="text-sm font-bold text-slate-700">{new Date(parcel.assignedAt || parcel.updatedAt).toLocaleDateString()}</p>
                                        <p className="text-[11px] text-slate-400">{new Date(parcel.assignedAt || parcel.updatedAt).toLocaleTimeString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Last Updated</p>
                                        <p className="text-sm font-bold text-slate-700">{new Date(parcel.updatedAt).toLocaleTimeString()}</p>
                                        <p className="text-[11px] text-slate-400">Status Sync: Live</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Quick Help */}
                            <div className="bg-slate-900 rounded-[2rem] p-6 text-white flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                        <Phone className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400">Need Support?</p>
                                        <p className="text-sm font-black">Contact Dispatch Center</p>
                                    </div>
                                </div>
                                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all">
                                    Call Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AssignedDeliveries;
