import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ParcelOversight = () => {
    const { isAdmin } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [parcels, setParcels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');
    const [searchEmail, setSearchEmail] = useState('');

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50 });
        if (!isAdmin) {
            navigate('/');
        } else {
            fetchParcels();
        }
    }, [isAdmin, navigate]);

    const fetchParcels = async () => {
        try {
            setLoading(true);
            const response = await axiosSecure.get('/admin/parcels');
            if (response.data.success) {
                setParcels(response.data.parcels);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching parcels:', err);
            setError('Failed to load parcels');
            setParcels([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'in transit':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'delivered':
                return 'bg-green-100 text-green-800 border-green-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const filteredParcels = parcels.filter(parcel => {
        const statusMatch = filterStatus === 'all' || 
            parcel.status?.toLowerCase() === filterStatus.toLowerCase();
        const emailMatch = searchEmail === '' || 
            parcel.senderEmail?.toLowerCase().includes(searchEmail.toLowerCase()) ||
            parcel.receiverEmail?.toLowerCase().includes(searchEmail.toLowerCase());
        return statusMatch && emailMatch;
    });

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div data-aos="fade-down" className="mb-12">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600 mb-2">
                        📦 Parcel Oversight
                    </h1>
                    <p className="text-lg text-gray-600">Monitor all parcels in the system</p>
                </div>

                {/* Filters and Search */}
                <div data-aos="fade-up" className="mb-8 bg-white rounded-xl shadow-md p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Filter by Status</label>
                            <div className="flex gap-2 flex-wrap">
                                {['all', 'pending', 'in transit', 'delivered'].map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`btn btn-sm ${
                                            filterStatus === status
                                                ? 'btn-primary'
                                                : 'btn-outline'
                                        }`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Email Search */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Search by Email</label>
                            <input
                                type="text"
                                placeholder="Search sender or receiver email..."
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                className="input input-bordered input-md w-full"
                            />
                        </div>
                    </div>
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <span className="loading loading-spinner loading-lg text-green-600"></span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error shadow-lg mb-8" data-aos="fade-up">
                        <div>
                            <span>⚠️ {error}</span>
                        </div>
                    </div>
                )}

                {!loading && filteredParcels.length > 0 && (
                    <>
                        <div data-aos="fade-up" className="mb-6 p-4 bg-green-100 rounded-lg border-l-4 border-green-500">
                            <p className="font-bold text-green-800">
                                Showing {filteredParcels.length} of {parcels.length} parcels
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredParcels.map((parcel) => (
                                <div
                                    key={parcel._id}
                                    data-aos="fade-up"
                                    className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-2xl transition-all duration-300"
                                >
                                    {/* Status Badge */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900">📍 Parcel #{parcel._id.toString().slice(-6)}</h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Created: {new Date(parcel.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full font-bold text-sm border-2 ${getStatusColor(parcel.status)}`}>
                                            {parcel.status || 'Pending'}
                                        </span>
                                    </div>

                                    {/* Sender Info */}
                                    <div className="bg-blue-50 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                                        <p className="text-xs font-bold text-blue-900 mb-2">📤 FROM (SENDER)</p>
                                        <p className="font-semibold text-gray-900">{parcel.senderName || 'N/A'}</p>
                                        <p className="text-sm text-gray-700">{parcel.senderEmail || 'N/A'}</p>
                                        <p className="text-sm text-gray-700">{parcel.senderPhone || 'N/A'}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            📍 {parcel.senderAddress || 'No address'}
                                        </p>
                                    </div>

                                    {/* Receiver Info */}
                                    <div className="bg-green-50 p-4 rounded-lg mb-4 border-l-4 border-green-500">
                                        <p className="text-xs font-bold text-green-900 mb-2">📥 TO (RECEIVER)</p>
                                        <p className="font-semibold text-gray-900">{parcel.receiverName || 'N/A'}</p>
                                        <p className="text-sm text-gray-700">{parcel.receiverEmail || 'N/A'}</p>
                                        <p className="text-sm text-gray-700">{parcel.receiverPhone || 'N/A'}</p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            📍 {parcel.receiverAddress || 'No address'}
                                        </p>
                                    </div>

                                    {/* Parcel Details */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-gray-100 p-3 rounded-lg">
                                            <p className="text-xs font-bold text-gray-600">Weight</p>
                                            <p className="text-sm font-bold text-gray-900">{parcel.weight || 'N/A'} kg</p>
                                        </div>
                                        <div className="bg-gray-100 p-3 rounded-lg">
                                            <p className="text-xs font-bold text-gray-600">Type</p>
                                            <p className="text-sm font-bold text-gray-900">{parcel.type || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-100 p-3 rounded-lg col-span-2">
                                            <p className="text-xs font-bold text-gray-600">Price</p>
                                            <p className="text-lg font-bold text-green-600">৳ {parcel.price || 'N/A'}</p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {parcel.description && (
                                        <div className="bg-purple-50 p-3 rounded-lg border-l-2 border-purple-500">
                                            <p className="text-xs font-bold text-purple-900">Description</p>
                                            <p className="text-sm text-gray-800 mt-1">{parcel.description}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {!loading && filteredParcels.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600">
                            {parcels.length === 0 ? 'No parcels found' : 'No parcels match your search'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParcelOversight;
