import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ManageRiders = () => {
    const { isAdmin } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50 });
        if (!isAdmin) {
            navigate('/');
        } else {
            fetchRiders();
        }
    }, [isAdmin, navigate]);

    const fetchRiders = async () => {
        try {
            setLoading(true);
            const response = await axiosSecure.get('/riders');
            if (response.data.success) {
                setRiders(response.data.riders);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching riders:', err);
            setError('Failed to load rider applications');
            setRiders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (riderId, riderEmail) => {
        Swal.fire({
            title: 'Approve Rider?',
            text: `Approve application from ${riderEmail}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, approve!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axiosSecure.patch(`/riders/${riderId}`, {
                        status: 'Approved'
                    });

                    if (response.data.success) {
                        setRiders(riders.map(r =>
                            r._id === riderId ? { ...r, status: 'Approved' } : r
                        ));
                        Swal.fire('Success!', 'Rider approved successfully', 'success');
                    }
                } catch (error) {
                    Swal.fire('Error!', error.response?.data?.message || 'Failed to approve rider', 'error');
                }
            }
        });
    };

    const handleReject = async (riderId, riderEmail) => {
        Swal.fire({
            title: 'Reject Rider?',
            text: `Reject application from ${riderEmail}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, reject!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axiosSecure.patch(`/riders/${riderId}`, {
                        status: 'Rejected'
                    });

                    if (response.data.success) {
                        setRiders(riders.map(r =>
                            r._id === riderId ? { ...r, status: 'Rejected' } : r
                        ));
                        Swal.fire('Success!', 'Rider application rejected', 'success');
                    }
                } catch (error) {
                    Swal.fire('Error!', error.response?.data?.message || 'Failed to reject rider', 'error');
                }
            }
        });
    };

    const filteredRiders = filterStatus === 'all'
        ? riders
        : riders.filter(r => r.status?.toLowerCase() === filterStatus.toLowerCase());

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div data-aos="fade-down" className="mb-12">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-yellow-600 mb-2">
                        🏍️ Rider Management
                    </h1>
                    <p className="text-lg text-gray-600">Review and manage rider applications</p>
                </div>

                {/* Filter Buttons */}
                <div data-aos="fade-up" className="mb-8 flex gap-3 flex-wrap">
                    {['all', 'pending', 'approved', 'rejected'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`btn ${
                                filterStatus === status
                                    ? 'btn-primary'
                                    : 'btn-outline'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <span className="loading loading-spinner loading-lg text-orange-600"></span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error shadow-lg mb-8" data-aos="fade-up">
                        <div>
                            <span>⚠️ {error}</span>
                        </div>
                    </div>
                )}

                {!loading && filteredRiders.length > 0 && (
                    <div className="grid grid-cols-1 gap-6">
                        {filteredRiders.map((rider) => (
                            <div
                                key={rider._id}
                                data-aos="fade-up"
                                className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-orange-500 hover:shadow-2xl transition-all duration-300"
                            >
                                {/* Rider Header */}
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-4">
                                        {rider.photoURL && (
                                            <img
                                                src={rider.photoURL}
                                                alt={rider.name}
                                                className="w-20 h-20 rounded-full object-cover"
                                            />
                                        )}
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900">{rider.name}</h3>
                                            <p className="text-gray-600">{rider.email}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Applied: {new Date(rider.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-2 rounded-full font-bold text-sm border-2 ${getStatusColor(rider.status)}`}>
                                        {rider.status}
                                    </span>
                                </div>

                                {/* Rider Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 font-semibold">Phone</p>
                                        <p className="text-lg font-bold text-gray-900">{rider.phoneNumber || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 font-semibold">Region</p>
                                        <p className="text-lg font-bold text-gray-900">{rider.region || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 font-semibold">Bike Brand</p>
                                        <p className="text-lg font-bold text-gray-900">{rider.bikeBrand || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 font-semibold">NID No</p>
                                        <p className="text-lg font-bold text-gray-900">{rider.nidNo || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* Additional Details */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 font-semibold">License</p>
                                        <p className="text-base font-bold text-gray-900">{rider.drivingLicense || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 font-semibold">Registration</p>
                                        <p className="text-base font-bold text-gray-900">{rider.bikeRegistration || 'N/A'}</p>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <p className="text-sm text-gray-600 font-semibold">District</p>
                                        <p className="text-base font-bold text-gray-900">{rider.district || 'N/A'}</p>
                                    </div>
                                </div>

                                {/* About Section */}
                                {rider.aboutYourself && (
                                    <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
                                        <p className="text-sm text-blue-900 font-semibold">About</p>
                                        <p className="text-gray-800 mt-1">{rider.aboutYourself}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {rider.status?.toLowerCase() === 'pending' && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleApprove(rider._id, rider.email)}
                                            className="flex-1 btn bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none font-bold"
                                        >
                                            ✅ Approve Rider
                                        </button>
                                        <button
                                            onClick={() => handleReject(rider._id, rider.email)}
                                            className="flex-1 btn btn-error text-white font-bold"
                                        >
                                            ❌ Reject Application
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {!loading && filteredRiders.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600">No riders found for this filter</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageRiders;
