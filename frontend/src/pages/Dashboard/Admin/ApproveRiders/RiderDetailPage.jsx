import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import AOS from 'aos';
import 'aos/dist/aos.css';

const RiderDetailPage = () => {
    const { riderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const axiosSecure = useAxiosSecure();
    const [rider, setRider] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50 });
        fetchRiderDetails();
    }, [riderId]);

    const fetchRiderDetails = async () => {
        try {
            setLoading(true);
            // Try to find rider from the passed riders array via location state
            const riders = location.state?.riders;
            const foundRider = riders?.find(r => r._id === riderId);
            if (foundRider) {
                setRider(foundRider);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Rider Not Found',
                    text: 'The requested rider could not be found',
                    confirmButtonColor: '#ef4444'
                }).then(() => navigate('/dashboard/ApproveRiders'));
            }
        } catch (error) {
            console.error('❌ Error fetching rider:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        const result = await Swal.fire({
            icon: 'question',
            title: 'Approve Rider?',
            html: `<p class="text-gray-700">Are you sure you want to approve <strong>${rider.name}</strong> as a rider?</p>`,
            showCancelButton: true,
            confirmButtonText: 'Yes, Approve',
            confirmButtonColor: '#10b981',
            cancelButtonText: 'Cancel',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed) {
            try {
                setIsProcessing(true);
                const response = await axiosSecure.patch(`/riders/${rider._id}`, { status: 'Approved' });
                
                if (response.data.success || response.data.modifiedCount > 0) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Approved!',
                        html: `<p class="text-gray-700"><strong>${rider.name}</strong> has been approved as a rider</p>`,
                        confirmButtonColor: '#10b981'
                    });
                    
                    navigate('/dashboard/ApproveRiders');
                }
            } catch (error) {
                console.error('❌ Error approving rider:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to approve rider',
                    confirmButtonColor: '#ef4444'
                });
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleReject = async () => {
        const result = await Swal.fire({
            icon: 'question',
            title: 'Reject Rider?',
            html: `<p class="text-gray-700">Are you sure you want to reject <strong>${rider.name}</strong>'s application?</p>`,
            showCancelButton: true,
            confirmButtonText: 'Yes, Reject',
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Cancel',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed) {
            try {
                setIsProcessing(true);
                const response = await axiosSecure.patch(`/riders/${rider._id}`, { status: 'Rejected' });
                
                if (response.data.success || response.data.modifiedCount > 0) {
                    await Swal.fire({
                        icon: 'success',
                        title: 'Rejected!',
                        html: `<p class="text-gray-700"><strong>${rider.name}</strong>'s application has been rejected</p>`,
                        confirmButtonColor: '#10b981'
                    });
                    
                    navigate('/dashboard/ApproveRiders');
                }
            } catch (error) {
                console.error('❌ Error rejecting rider:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to reject rider',
                    confirmButtonColor: '#ef4444'
                });
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Approved':
                return <span className="badge badge-success badge-lg gap-2">✅ Approved</span>;
            case 'Rejected':
                return <span className="badge badge-error badge-lg gap-2">❌ Rejected</span>;
            default:
                return <span className="badge badge-warning badge-lg gap-2">⏳ Pending</span>;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                <div className="text-center">
                    <div className="inline-block animate-spin">
                        <svg className="w-12 h-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                    <p className="text-gray-600 mt-4">Loading rider details...</p>
                </div>
            </div>
        );
    }

    if (!rider) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                <p className="text-gray-600 text-lg">Rider not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
            {/* Back Button */}
            <div className="mb-6" data-aos="fade-down">
                <button
                    onClick={() => navigate('/dashboard/ApproveRiders')}
                    className="btn btn-outline btn-primary gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to List
                </button>
            </div>

            {/* Header */}
            <div className="mb-8" data-aos="fade-down">
                <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    🏍️ Rider Application Details
                </h1>
                <p className="text-gray-600 text-lg">Review and approve/reject this rider's application</p>
            </div>

            {/* Main Form Card */}
            <div data-aos="fade-up" className="bg-white rounded-lg shadow-lg p-8 mb-8">
                {/* Status Section */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-semibold mb-2">Current Status</p>
                            {getStatusBadge(rider.status)}
                        </div>
                        <div className="text-right">
                            <p className="text-gray-600 text-sm font-semibold mb-2">Application Date</p>
                            <p className="text-gray-900 font-semibold">{new Date(rider.createdAt).toLocaleDateString()}</p>
                        </div>
                    </div>
                </div>

                {/* Profile Photo Section */}
                <div className="mb-8 pb-8 border-b border-gray-200">
                    <p className="text-gray-600 text-sm font-semibold mb-4">Profile Photo</p>
                    <div className="flex items-center gap-6">
                        {rider.photo ? (
                            <>
                                <img 
                                    src={rider.photo} 
                                    alt={rider.name}
                                    className="w-32 h-32 rounded-lg object-cover border-4 border-blue-300 shadow-lg"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-green-700">✅ Photo provided</p>
                                    <p className="text-xs text-gray-500 mt-1">Profile photo uploaded by applicant</p>
                                </div>
                            </>
                        ) : (
                            <div className="w-32 h-32 rounded-lg bg-gray-200 border-4 border-gray-300 flex items-center justify-center">
                                <span className="text-4xl">📸</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Personal Information */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="text-gray-700 font-semibold mb-2 block">👤 Full Name</label>
                            <input type="text" value={rider.name} disabled className="input input-bordered w-full bg-gray-50 text-gray-900" />
                        </div>
                        <div className="form-group">
                            <label className="text-gray-700 font-semibold mb-2 block">📧 Email Address</label>
                            <input type="email" value={rider.email} disabled className="input input-bordered w-full bg-gray-50 text-gray-900" />
                        </div>
                        <div className="form-group">
                            <label className="text-gray-700 font-semibold mb-2 block">📱 Phone Number</label>
                            <input type="tel" value={rider.phoneNumber} disabled className="input input-bordered w-full bg-gray-50 text-gray-900" />
                        </div>
                        <div className="form-group">
                            <label className="text-gray-700 font-semibold mb-2 block">🆔 NID Number</label>
                            <input type="text" value={rider.nidNo} disabled className="input input-bordered w-full bg-gray-50 text-gray-900" />
                        </div>
                    </div>
                </div>

                {/* License & Documents */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        License & Documents
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="text-gray-700 font-semibold mb-2 block">🎫 Driving License Number</label>
                            <input type="text" value={rider.drivingLicense} disabled className="input input-bordered w-full bg-gray-50 text-gray-900" />
                        </div>
                    </div>
                </div>

                {/* Region & Location */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Region & Location
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="text-gray-700 font-semibold mb-2 block">🗺️ Region</label>
                            <input type="text" value={rider.region} disabled className="input input-bordered w-full bg-gray-50 text-gray-900" />
                        </div>
                        <div className="form-group">
                            <label className="text-gray-700 font-semibold mb-2 block">📍 District</label>
                            <input type="text" value={rider.district} disabled className="input input-bordered w-full bg-gray-50 text-gray-900" />
                        </div>
                    </div>
                </div>

                {/* Bike Information */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Bike Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="text-gray-700 font-semibold mb-2 block">🏍️ Bike Brand, Model & Year</label>
                            <input type="text" value={rider.bikeBrand} disabled className="input input-bordered w-full bg-gray-50 text-gray-900" />
                        </div>
                        <div className="form-group">
                            <label className="text-gray-700 font-semibold mb-2 block">📋 Bike Registration Number</label>
                            <input type="text" value={rider.bikeRegistration} disabled className="input input-bordered w-full bg-gray-50 text-gray-900" />
                        </div>
                    </div>
                </div>

                {/* About Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        About Yourself
                    </h2>
                    <div className="form-group">
                        <label className="text-gray-700 font-semibold mb-2 block">💬 Tell us about yourself</label>
                        <textarea disabled value={rider.aboutYourself} className="textarea textarea-bordered w-full bg-gray-50 text-gray-900 h-32" />
                    </div>
                </div>

                {/* Action Buttons */}
                {rider.status === 'Pending' && (
                    <div className="border-t pt-8 mt-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-6">Take Action</h3>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleApprove}
                                disabled={isProcessing}
                                className="btn btn-success btn-lg text-white gap-2 flex-1"
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Approve Rider
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleReject}
                                disabled={isProcessing}
                                className="btn btn-error btn-lg text-white gap-2 flex-1"
                            >
                                {isProcessing ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                        Reject Rider
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {rider.status !== 'Pending' && (
                    <div className="border-t pt-8 mt-8 bg-gray-50 rounded-lg p-6">
                        <p className="text-center text-gray-700">
                            <strong>This application has already been {rider.status.toLowerCase()}.</strong>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RiderDetailPage;
