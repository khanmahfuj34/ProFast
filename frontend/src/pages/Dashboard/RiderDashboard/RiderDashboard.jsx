import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import useAuth from '../../../hooks/useAuth';

// Fix for leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Stat Card Component - Declared Outside
const StatCard = ({ icon, label, value, color }) => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-xl`}>
                {icon}
            </div>
        </div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
    </div>
);

const RiderDashboard = () => {
    const { user, userProfile } = useAuth();
    const [isOnline, setIsOnline] = useState(true);

    // Sample data
    const assignedDeliveries = 3;
    const pendingPickups = 1;
    const completedToday = 2;
    const todayEarnings = 560;

    const assignedParcels = [
        {
            id: 1,
            name: 'Notice from govt',
            trackingId: 'TRK-1778158462827',
            pickup: 'Motijheel, Dhaka',
            dropoff: 'Dhanmondi, Dhaka',
            status: 'Pending Pickup'
        },
        {
            id: 2,
            name: 'Nuts',
            trackingId: 'TRK-1778158321993',
            pickup: 'Mirpur 10, Dhaka',
            dropoff: 'Uttara, Dhaka',
            status: 'Pending Pickup'
        },
        {
            id: 3,
            name: 'Mobile',
            trackingId: 'TRK-1778083419162',
            pickup: 'Gulshan 1, Dhaka',
            dropoff: 'Banani, Dhaka',
            status: 'On The Way'
        }
    ];

    const routeCoordinates = [
        [23.8103, 90.4125], // Motijheel
        [23.7961, 90.3671], // Dhanmondi
        [23.8232, 90.3647], // Mirpur
        [23.8533, 90.4167]  // Uttara
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending Pickup':
                return 'bg-amber-100 text-amber-700';
            case 'On The Way':
                return 'bg-blue-100 text-blue-700';
            case 'Completed':
                return 'bg-emerald-100 text-emerald-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 pb-12">
            {/* Welcome Section */}
            <div className="bg-linear-to-r from-lime-500 to-emerald-500 text-white rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-base md:text-lg opacity-90 flex items-center gap-1">
                            <span>👋</span> Welcome back, {userProfile?.displayName || user?.displayName || 'Rider'}!
                        </p>
                        <p className="text-sm md:text-base opacity-80 mt-1">Ready to deliver? You have {assignedDeliveries} assigned deliveries today.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-white bg-opacity-20 rounded-full px-4 py-2 hover:bg-opacity-30 transition">
                            <input
                                type="checkbox"
                                checked={isOnline}
                                onChange={() => setIsOnline(!isOnline)}
                                className="w-4 h-4 rounded cursor-pointer"
                            />
                            <span className="text-sm font-medium">{isOnline ? 'Go Online' : 'Go Offline'}</span>
                        </label>
                        <div className="relative">
                            <button className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center hover:bg-opacity-30 transition">
                                🔔
                            </button>
                            <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                    icon="📦"
                    label="Assigned Deliveries"
                    value={assignedDeliveries}
                    color="bg-lime-100"
                />
                <StatCard
                    icon="📍"
                    label="Pending Pickups"
                    value={pendingPickups}
                    color="bg-blue-100"
                />
                <StatCard
                    icon="✅"
                    label="Completed Today"
                    value={completedToday}
                    color="bg-emerald-100"
                />
                <StatCard
                    icon="💰"
                    label="Today's Earnings"
                    value={`৳${todayEarnings}`}
                    color="bg-amber-100"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Assigned Deliveries */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-linear-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800">Assigned Deliveries</h2>
                            <a href="#" className="text-lime-600 hover:text-lime-700 font-semibold text-sm">View All →</a>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {assignedParcels.map((parcel) => (
                                <div key={parcel.id} className="p-6 hover:bg-slate-50 transition">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-xl shrink-0">
                                            📦
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-slate-800">
                                                        #{parcel.id} {parcel.name}
                                                    </h3>
                                                    <p className="text-xs font-mono text-slate-500 mt-1">
                                                        {parcel.trackingId}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(parcel.status)}`}>
                                                    {parcel.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-600 mt-3 mb-4">
                                                <div className="flex items-center gap-1">
                                                    <span>📍</span> Pickup: {parcel.pickup}
                                                </div>
                                                <span className="text-slate-300">•</span>
                                                <div className="flex items-center gap-1">
                                                    <span>📍</span> Drop-off: {parcel.dropoff}
                                                </div>
                                            </div>
                                            {parcel.status === 'Pending Pickup' && (
                                                <div className="flex gap-2 mt-4">
                                                    <button className="px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg text-sm font-semibold transition">
                                                        Accept
                                                    </button>
                                                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition">
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Progress */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Delivery Progress</h2>
                        <div className="flex items-center justify-between">
                            {[
                                { label: 'Assigned', icon: '📦', active: true },
                                { label: 'Pickup', icon: '🚚', active: false },
                                { label: 'On The Way', icon: '🛣️', active: false },
                                { label: 'Delivered', icon: '✅', active: false }
                            ].map((step, idx, arr) => (
                                <div key={idx} className="flex flex-col items-center flex-1">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg mb-2 ${
                                        step.active ? 'bg-lime-500 text-white' : 'bg-slate-200 text-slate-600'
                                    }`}>
                                        {step.icon}
                                    </div>
                                    <p className="text-xs font-semibold text-slate-600 text-center">{step.label}</p>
                                    {idx < arr.length - 1 && (
                                        <div className={`absolute w-12 h-1 mt-6 ${step.active ? 'bg-lime-500' : 'bg-slate-200'}`}></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Today's Route */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="bg-linear-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800">Today's Route</h2>
                            <a href="#" className="text-lime-600 hover:text-lime-700 font-semibold text-sm">View Map →</a>
                        </div>
                        <div className="p-4" style={{ height: '300px' }}>
                            <MapContainer center={[23.8103, 90.4125]} zoom={12} style={{ height: '100%', borderRadius: '12px' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; OpenStreetMap contributors'
                                />
                                <Polyline positions={routeCoordinates} color="lime" weight={3} />
                                {routeCoordinates.map((coord, idx) => (
                                    <Marker key={idx} position={coord}>
                                        <Popup>{idx === 0 ? 'Start' : idx === routeCoordinates.length - 1 ? 'End' : `Stop ${idx}`}</Popup>
                                    </Marker>
                                ))}
                            </MapContainer>
                        </div>
                    </div>

                    {/* Earnings Overview */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Earnings Overview</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                                <div>
                                    <p className="text-xs font-semibold text-emerald-600 uppercase">Today's Earnings</p>
                                    <p className="text-2xl font-bold text-emerald-700 mt-1">৳{todayEarnings}</p>
                                </div>
                                <div className="text-3xl">💰</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-600">This Week</p>
                                    <p className="text-lg font-bold text-slate-800">৳2,450</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-600">This Month</p>
                                    <p className="text-lg font-bold text-slate-800">৳8,760</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Safety Notice */}
            <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <span className="text-xl">🛡️</span>
                <p className="text-sm text-emerald-800">
                    <span className="font-semibold">Stay safe while riding.</span> Always follow traffic rules and wear your helmet.
                </p>
            </div>
        </div>
    );
};

export default RiderDashboard;
