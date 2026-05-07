import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import AOS from 'aos';
import 'aos/dist/aos.css';

const RiderStatus = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [riderData, setRiderData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editData, setEditData] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50 });
        fetchRiderStatus();
    }, [user?.email]);

    const fetchRiderStatus = async () => {
        try {
            setLoading(true);
            const response = await axiosSecure.get(`/riders/${user?.email}`);
            
            if (response.data.success) {
                setRiderData(response.data.rider);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching rider status:', err);
            if (err.response?.status === 404) {
                setError('No application found. Please submit a rider application first.');
            } else if (err.response?.status === 403) {
                setError('Unauthorized access. Please contact support.');
            } else {
                setError('Error fetching rider status. Please try again.');
            }
            setRiderData(null);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: '⏳', borderColor: 'border-yellow-300' };
            case 'approved':
                return { bg: 'bg-green-100', text: 'text-green-800', icon: '✅', borderColor: 'border-green-300' };
            case 'rejected':
                return { bg: 'bg-red-100', text: 'text-red-800', icon: '❌', borderColor: 'border-red-300' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-800', icon: '❓', borderColor: 'border-gray-300' };
        }
    };

    const handleApplyAgain = () => {
        navigate('/be-rider');
    };

    const handleGoToDashboard = () => {
        navigate('/dashboard/assigned-deliveries');
    };

    const handleRefresh = () => {
        fetchRiderStatus();
    };

    const handleEditClick = () => {
        setEditData({ ...riderData });
        setShowEditModal(true);
    };

    const handleEditChange = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveEdit = async () => {
        try {
            setIsUpdating(true);

            const updateData = {
                name: editData.name,
                email: editData.email,
                nidNo: editData.nidNo,
                drivingLicense: editData.drivingLicense,
                phoneNumber: editData.phoneNumber,
                region: editData.region,
                bikeBrand: editData.bikeBrand,
                bikeRegistration: editData.bikeRegistration,
                aboutYourself: editData.aboutYourself
            };

            const response = await axiosSecure.patch(`/riders/${riderData._id}`, updateData);

            if (response.data.success) {
                setRiderData(response.data.rider || { ...riderData, ...updateData });
                setShowEditModal(false);
                
                Swal.fire({
                    icon: 'success',
                    title: 'Updated Successfully!',
                    text: 'Your application details have been updated',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error('Error updating rider data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Update Failed',
                text: error.response?.data?.message || 'Failed to update application details',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditData(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center px-4">
                <div className="text-center" data-aos="fade-up">
                    <div className="inline-block">
                        <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mx-auto mb-4"></div>
                        <p className="text-xl font-bold text-blue-900">Loading your status...</p>
                        <p className="text-gray-600 mt-2">Please wait while we fetch your application details</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 py-12 px-4">
                <div className="max-w-2xl mx-auto" data-aos="fade-up">
                    <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-red-200">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">⚠️</div>
                            <h1 className="text-3xl font-bold text-red-900 mb-2">No Application Found</h1>
                            <p className="text-gray-700 mb-4">{error}</p>
                        </div>

                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
                            <p className="text-red-800 font-semibold">💡 What's Next?</p>
                            <p className="text-red-700 text-sm mt-2">
                                Submit your rider application to start delivering with us. Once submitted, you'll be able to track your application status here.
                            </p>
                        </div>

                        <button
                            onClick={handleApplyAgain}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                        >
                            🏍️ Submit Rider Application
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!riderData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center px-4">
                <div className="text-center" data-aos="fade-up">
                    <div className="text-6xl mb-4">❌</div>
                    <p className="text-xl font-bold text-gray-900">Something went wrong</p>
                    <p className="text-gray-600 mt-2 mb-6">Could not load your rider information</p>
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
                    >
                        🔄 Try Again
                    </button>
                </div>
            </div>
        );
    }

    const statusInfo = getStatusColor(riderData.status);
    const appliedDate = riderData.createdAt ? new Date(riderData.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'N/A';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12" data-aos="fade-up">
                    <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600 mb-4">
                        🏍️ Application Status
                    </h1>
                    <p className="text-xl text-gray-700">Track your rider application in real-time</p>
                </div>

                {/* Status Card */}
                <div 
                    data-aos="zoom-in" 
                    className={`bg-white rounded-3xl shadow-2xl p-8 sm:p-12 border-2 ${statusInfo.borderColor} mb-8 hover:shadow-3xl transition-all duration-300`}
                >
                    {/* Status Badge */}
                    <div className="flex items-center justify-center mb-8">
                        <div className={`${statusInfo.bg} ${statusInfo.text} px-8 py-4 rounded-full text-center border-2 ${statusInfo.borderColor}`}>
                            <div className="text-4xl mb-2">{statusInfo.icon}</div>
                            <p className="text-2xl font-bold capitalize">{riderData.status}</p>
                            <p className="text-sm font-semibold mt-1">Approval</p>
                        </div>
                    </div>

                    {/* Status Messages */}
                    <div className="text-center mb-10">
                        {riderData.status?.toLowerCase() === 'pending' && (
                            <div className="space-y-2">
                                <p className="text-lg font-semibold text-gray-800">Your application is under review</p>
                                <p className="text-gray-600">We're reviewing your application carefully. You'll receive an email notification once it's approved or if we need more information.</p>
                                <p className="text-sm text-gray-500 mt-4">⏱️ Typical review time: 2-5 business days</p>
                            </div>
                        )}
                        {riderData.status?.toLowerCase() === 'approved' && (
                            <div className="space-y-2">
                                <p className="text-lg font-semibold text-green-800">🎉 Congratulations! Your application is approved!</p>
                                <p className="text-green-700">You're now a verified rider. Start delivering and earning with ProFast!</p>
                            </div>
                        )}
                        {riderData.status?.toLowerCase() === 'rejected' && (
                            <div className="space-y-2">
                                <p className="text-lg font-semibold text-red-800">Unfortunately, your application was not approved</p>
                                <p className="text-red-700">You can apply again after addressing the feedback. Please review your documents and try again.</p>
                            </div>
                        )}
                    </div>

                    {/* Application Details */}
                    <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-6 mb-8 border border-blue-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">📋 Application Details</h2>
                            {riderData.status?.toLowerCase() === 'pending' && (
                                <button
                                    onClick={handleEditClick}
                                    className="btn btn-sm btn-outline border-blue-500 text-blue-600 hover:bg-blue-50"
                                >
                                    ✏️ Edit Details
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Name</p>
                                <p className="text-lg text-gray-900 font-bold">{riderData.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Email</p>
                                <p className="text-lg text-gray-900 font-bold break-all">{riderData.email || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Phone Number</p>
                                <p className="text-lg text-gray-900 font-bold">{riderData.phoneNumber || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Region</p>
                                <p className="text-lg text-gray-900 font-bold">{riderData.region || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">District</p>
                                <p className="text-lg text-gray-900 font-bold">{riderData.district || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">NID No</p>
                                <p className="text-lg text-gray-900 font-bold">{riderData.nidNo || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Driving License</p>
                                <p className="text-lg text-gray-900 font-bold">{riderData.drivingLicense || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Bike Brand</p>
                                <p className="text-lg text-gray-900 font-bold">{riderData.bikeBrand || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Bike Registration</p>
                                <p className="text-lg text-gray-900 font-bold">{riderData.bikeRegistration || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600">Applied On</p>
                                <p className="text-lg text-gray-900 font-bold">{appliedDate}</p>
                            </div>
                        </div>
                        {riderData.aboutYourself && (
                            <div className="mt-6 pt-6 border-t border-blue-300">
                                <p className="text-sm font-semibold text-gray-600 mb-2">About Yourself</p>
                                <p className="text-gray-800 leading-relaxed">{riderData.aboutYourself}</p>
                            </div>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded">
                        <p className="text-blue-900 font-semibold">💡 Need Help?</p>
                        <p className="text-blue-800 text-sm mt-2">
                            If you have questions about your application, please contact our support team. We're here to help!
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        {riderData.status?.toLowerCase() === 'approved' && (
                            <button
                                onClick={handleGoToDashboard}
                                className="flex-1 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                ✅ Go to Rider Dashboard
                            </button>
                        )}
                        {riderData.status?.toLowerCase() === 'rejected' && (
                            <button
                                onClick={handleApplyAgain}
                                className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                            >
                                🔄 Apply Again
                            </button>
                        )}
                        <button
                            onClick={handleRefresh}
                            className={`flex-1 ${riderData.status?.toLowerCase() === 'pending' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600' : 'bg-gray-400 hover:bg-gray-500'} text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg`}
                        >
                            🔄 Refresh Status
                        </button>
                    </div>
                </div>

                {/* Timeline Info (for pending status) */}
                {riderData.status?.toLowerCase() === 'pending' && (
                    <div data-aos="fade-up" className="bg-white rounded-2xl shadow-lg p-8 border-l-4 border-yellow-500">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">📅 What Happens Next?</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center font-bold text-yellow-800">1</div>
                                <div>
                                    <p className="font-bold text-gray-900">Application Submitted</p>
                                    <p className="text-gray-600 text-sm">Your application has been received and is in the queue for review</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center font-bold text-yellow-800">2</div>
                                <div>
                                    <p className="font-bold text-gray-900">Document Verification</p>
                                    <p className="text-gray-600 text-sm">Our team verifies your documents, license, and background</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center font-bold text-yellow-800">3</div>
                                <div>
                                    <p className="font-bold text-gray-900">Approval Decision</p>
                                    <p className="text-gray-600 text-sm">We'll notify you via email with our decision and next steps</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center font-bold text-yellow-800">4</div>
                                <div>
                                    <p className="font-bold text-gray-900">Start Delivering</p>
                                    <p className="text-gray-600 text-sm">Once approved, access your rider dashboard and start earning!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {showEditModal && editData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto" data-aos="zoom-in">
                        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-600 p-8 border-b">
                            <h2 className="text-3xl font-bold text-white">✏️ Edit Application Details</h2>
                            <p className="text-blue-100 text-base mt-2">Update your information (while pending approval)</p>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Two Column Grid Layout */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-base font-bold text-gray-800 mb-3">Full Name</label>
                                    <input
                                        type="text"
                                        value={editData.name || ''}
                                        disabled
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-base-100 font-semibold text-lg cursor-not-allowed opacity-70"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Read-only</p>
                                </div>

                                <div>
                                    <label className="block text-base font-bold text-gray-800 mb-3">Email Address</label>
                                    <input
                                        type="email"
                                        value={editData.email || ''}
                                        disabled
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-base-100 font-semibold text-lg cursor-not-allowed opacity-70"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Read-only</p>
                                </div>

                                <div>
                                    <label className="block text-base font-bold text-gray-800 mb-3">NID Number</label>
                                    <input
                                        type="text"
                                        value={editData.nidNo || ''}
                                        onChange={(e) => handleEditChange('nidNo', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base-100 font-semibold text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-base font-bold text-gray-800 mb-3">Driving License</label>
                                    <input
                                        type="text"
                                        value={editData.drivingLicense || ''}
                                        onChange={(e) => handleEditChange('drivingLicense', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base-100 font-semibold text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-base font-bold text-gray-800 mb-3">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={editData.phoneNumber || ''}
                                        onChange={(e) => handleEditChange('phoneNumber', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base-100 font-semibold text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-base font-bold text-gray-800 mb-3">Region</label>
                                    <input
                                        type="text"
                                        value={editData.region || ''}
                                        onChange={(e) => handleEditChange('region', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base-100 font-semibold text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-base font-bold text-gray-800 mb-3">Bike Brand & Model</label>
                                    <input
                                        type="text"
                                        value={editData.bikeBrand || ''}
                                        onChange={(e) => handleEditChange('bikeBrand', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base-100 font-semibold text-lg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-base font-bold text-gray-800 mb-3">Bike Registration Number</label>
                                    <input
                                        type="text"
                                        value={editData.bikeRegistration || ''}
                                        onChange={(e) => handleEditChange('bikeRegistration', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base-100 font-semibold text-lg"
                                    />
                                </div>
                            </div>

                            {/* Full Width Textarea */}
                            <div>
                                <label className="block text-base font-bold text-gray-800 mb-3">Tell Us About Yourself</label>
                                <textarea
                                    value={editData.aboutYourself || ''}
                                    onChange={(e) => handleEditChange('aboutYourself', e.target.value)}
                                    rows="5"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base-100 font-semibold text-lg resize-none"
                                />
                            </div>

                            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded">
                                <p className="text-blue-900 text-base font-semibold">
                                    📌 <strong>Note:</strong> Your changes will be saved immediately. Make sure all information is accurate before submission.
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-8 py-6 border-t flex gap-4 justify-end sticky bottom-0">
                            <button
                                onClick={handleCancelEdit}
                                disabled={isUpdating}
                                className="btn btn-outline border-gray-400 text-gray-700 hover:bg-gray-100 disabled:opacity-50 text-base font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveEdit}
                                disabled={isUpdating}
                                className="btn bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white border-none disabled:opacity-50 text-base font-bold"
                            >
                                {isUpdating ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Saving...
                                    </>
                                ) : (
                                    '💾 Save Changes'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RiderStatus;
