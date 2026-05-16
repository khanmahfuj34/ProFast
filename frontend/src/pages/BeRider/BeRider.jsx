import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { coverageData } from '../../data/coverage-data';
import agentImage from '../../assets/agent-pending.png';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import useAuth from '../../hooks/useAuth';
import useImageUpload from '../../hooks/useImageUpload';
import AOS from 'aos';
import 'aos/dist/aos.css';

const BeRider = () => {
    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
        defaultValues: {
            name: '',
            drivingLicense: '',
            email: '',
            division: '',
            district: '',
            nidNo: '',
            phoneNumber: '',
            bikeBrand: '',
            bikeRegistration: '',
            aboutYourself: ''
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [photoURL, setPhotoURL] = useState(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const selectedDivision = watch('division');
    const axiosSecure = useAxiosSecure();
    const { user, tokenReady } = useAuth();
    const { uploadImage } = useImageUpload();
    const navigate = useNavigate();

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50 });
    }, []);

    // ✅ Only check rider application after JWT cookie is confirmed ready
    // Prevents 401 errors during initial login flow
    useEffect(() => {
        if (!tokenReady || !user?.email) return;
        checkExistingApplication();

        // Set user's profile photo if available
        if (user?.photoURL) {
            setPhotoURL(user.photoURL);
        }
    }, [tokenReady, user?.email]);

    const checkExistingApplication = async () => {
        try {
            if (!user?.email) {
                return;
            }
            
            const response = await axiosSecure.get(`/riders/${user.email}`);
            
            // If we get here, user has an existing application
            if (response.data.success && response.data.rider) {
                // Redirect to rider status page
                navigate('/be-rider-status');
            }
        } catch (error) {
            // 404 means no application found - that's okay, show form
            if (error.response?.status !== 404) {
                console.error('Error checking rider status:', error);
            }
        }
    };

    // Get unique divisions
    const divisions = [...new Set(coverageData.map(item => item.division))];

    // Get districts for selected division
    const districts = selectedDivision 
        ? coverageData
            .filter(item => item.division === selectedDivision)
            .map(item => item.district)
        : [];

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setPhotoUploading(true);
            const uploadedURL = await uploadImage(file);
            setPhotoURL(uploadedURL);
            Swal.fire({
                icon: 'success',
                title: 'Photo Uploaded!',
                text: 'Your profile photo has been uploaded successfully',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Upload Failed',
                text: error.message || 'Failed to upload photo',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setPhotoUploading(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            
            // Check if photo is required (no profile photo)
            if (!photoURL) {
                await Swal.fire({
                    icon: 'warning',
                    title: 'Photo Required',
                    text: 'Please upload a profile photo before submitting your application',
                    confirmButtonColor: '#f59e0b'
                });
                setIsSubmitting(false);
                return;
            }
            
            console.log('🏍️ Rider Application Data:', data);
            
            // Add photo to data
            const submissionData = {
                ...data,
                photo: photoURL
            };
            
            // Send rider application to backend
            const response = await axiosSecure.post('/riders', submissionData);
            
            if (response.data.success) {
                // Show success alert
                await Swal.fire({
                    icon: 'success',
                    title: 'Application Submitted!',
                    html: `<div class="text-center">
                        <p class="text-lg font-semibold text-green-600 mb-2">✅ Your application has been submitted successfully!</p>
                        <p class="text-gray-700">We will review your application and get back to you soon.</p>
                        <p class="text-sm text-gray-500 mt-3">Your status: <span class="font-bold text-yellow-600">${response.data.status}</span></p>
                    </div>`,
                    confirmButtonText: 'View Status',
                    confirmButtonColor: '#f59e0b',
                    allowOutsideClick: false,
                    didOpen: (modal) => {
                        modal.classList.add('animate-bounce');
                    }
                });

                console.log('✅ Rider application submitted:', response.data);
                reset();
                
                // Redirect to rider status page after successful submission
                setTimeout(() => {
                    navigate('/be-rider-status');
                }, 500);
            }
        } catch (error) {
            console.error('❌ Submission Error:', error);
            
            // Determine error message
            let errorMessage = 'Failed to submit application. Please try again.';
            let errorTitle = 'Submission Failed';
            
            if (error.response?.status === 409) {
                errorTitle = 'Application Already Submitted';
                errorMessage = error.response.data.message || 'You have already submitted a rider application. Please wait for our response.';
            } else if (error.response?.status === 400) {
                errorTitle = 'Validation Error';
                errorMessage = error.response.data.message || 'Please fill in all required fields correctly.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            await Swal.fire({
                icon: 'error',
                title: errorTitle,
                html: `<p class="text-gray-700">${errorMessage}</p>`,
                confirmButtonText: 'Try Again',
                confirmButtonColor: '#ef4444',
                allowOutsideClick: false
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-20" data-aos="fade-up" data-aos-duration="800">
                <div className="text-center">
                    <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-4 animate-bounce">
                        🏍️ Become a Rider
                    </h1>
                    <p className="text-xl text-gray-700 font-semibold mb-6">Join our delivery team and start earning today</p>
                    <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <div className="bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900 px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">✅ Flexible Hours</div>
                        <div className="bg-gradient-to-r from-orange-200 to-orange-300 text-orange-900 px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">💰 Good Income</div>
                        <div className="bg-gradient-to-r from-red-200 to-red-300 text-red-900 px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300">🚀 Growth</div>
                    </div>
                </div>
            </div>

            {/* Main Content - Form on Left, Animation on Right */}
            <div className="max-w-7xl mx-auto">
                <div data-aos="fade-up" data-aos-duration="800" className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
                    {/* Left Side - Form */}
                    <div data-aos="fade-right" data-aos-duration="900" className="bg-gradient-to-br from-white via-white to-yellow-50/30 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-12 border border-white/60 hover:border-yellow-300/60 hover:bg-white/95 hover:shadow-3xl transition-all duration-500 group">
                        <div className="mb-10">
                            <h2 className="text-4xl font-black bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-3 group-hover:from-yellow-700 group-hover:to-red-700 transition-all">
                                Tell us about yourself
                            </h2>
                            <p className="text-gray-600 text-lg font-semibold mb-2">Complete the form to join our rider network</p>
                            <p className="text-gray-500 text-sm">Share your details and become part of the ProFast delivery family</p>
                            <div className="h-1.5 w-24 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-full mt-6 group-hover:w-32 transition-all duration-500"></div>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                {/* Name */}
                                <div className="group" data-aos="fade-up" data-aos-delay="100">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        👤 Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your full name"
                                        {...register('name', { 
                                            required: 'Name is required',
                                            minLength: { value: 3, message: 'Name must be at least 3 characters' }
                                        })}
                                        className={`w-full text-base-100 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.name.message}</p>}
                                </div>

                                {/* Email */}
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        📧 Your Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="Enter your email address"
                                        {...register('email', { 
                                            required: 'Email is required',
                                            pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
                                        })}
                                        className={`w-full text-base-100 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.email.message}</p>}
                                </div>

                                {/* Phone Number */}
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        📱 Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="01700000000"
                                        {...register('phoneNumber', { 
                                            required: 'Phone number is required',
                                            pattern: { value: /^01[3-9]\d{8}$/, message: 'Enter a valid Bangladeshi phone number' }
                                        })}
                                        className={`w-full text-base-100 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.phoneNumber ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    />
                                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.phoneNumber.message}</p>}
                                </div>

                                {/* NID No */}
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        🆔 NID No <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your NID number"
                                        {...register('nidNo', { 
                                            required: 'NID number is required',
                                            pattern: { value: /^[0-9]{10,17}$/, message: 'NID must be 10-17 digits' }
                                        })}
                                        className={`w-full text-base-100 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.nidNo ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    />
                                    {errors.nidNo && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.nidNo.message}</p>}
                                </div>

                                {/* Driving License Number */}
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        🎫 Driving License Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your driving license number"
                                        {...register('drivingLicense', { 
                                            required: 'Driving license number is required',
                                            minLength: { value: 5, message: 'License number must be at least 5 characters' }
                                        })}
                                        className={`w-full text-base-100 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.drivingLicense ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    />
                                    {errors.drivingLicense && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.drivingLicense.message}</p>}
                                </div>

                                {/* Division */}
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        🗺️ Your Division <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('division', { required: 'Division is required' })}
                                        className={`w-full text-base-100 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.division ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    >
                                        <option value="">Select Division</option>
                                        {divisions.map(division => (
                                            <option key={division} value={division}>{division}</option>
                                        ))}
                                    </select>
                                    {errors.division && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.division.message}</p>}
                                </div>

                                {/* District */}
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        📍 Your District <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('district', { required: 'District is required' })}
                                        disabled={!selectedDivision}
                                        className={`w-full text-base-100 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.district ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        } ${!selectedDivision ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">
                                            {selectedDivision ? 'Select District' : 'Select Division First'}
                                        </option>
                                        {districts.map(district => (
                                            <option key={district} value={district}>{district}</option>
                                        ))}
                                    </select>
                                    {errors.district && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.district.message}</p>}
                                </div>

                                {/* Bike Brand, Model and Year */}
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        🏍️ Bike Brand, Model & Year <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Honda CD 70 2020"
                                        {...register('bikeBrand', { 
                                            required: 'Bike details are required',
                                            minLength: { value: 5, message: 'Please provide complete bike details' }
                                        })}
                                        className={`w-full text-base-100 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.bikeBrand ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    />
                                    {errors.bikeBrand && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.bikeBrand.message}</p>}
                                </div>

                                {/* Bike Registration Number */}
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        📋 Bike Registration Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Enter your bike registration number"
                                        {...register('bikeRegistration', { 
                                            required: 'Bike registration number is required',
                                            minLength: { value: 5, message: 'Enter a valid registration number' }
                                        })}
                                        className={`w-full text-base-100 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.bikeRegistration ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    />
                                    {errors.bikeRegistration && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.bikeRegistration.message}</p>}
                                </div>

                                {/* Profile Photo Upload */}
                                <div className="group" data-aos="fade-up" data-aos-delay="400">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        📸 Profile Photo {!photoURL && <span className="text-red-500">*</span>}
                                    </label>
                                    <div className="border-2 border-dashed border-yellow-300 rounded-lg p-6 bg-yellow-50/30 hover:bg-yellow-50/50 transition-all duration-300">
                                        {photoURL ? (
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img 
                                                        src={photoURL} 
                                                        alt="Profile" 
                                                        className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400 shadow-lg"
                                                    />
                                                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-6 h-6 border-2 border-white flex items-center justify-center text-white text-sm">✓</div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-green-700">✅ Photo uploaded successfully</p>
                                                    <p className="text-xs text-gray-600 mt-1">Click below to change photo</p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-2">
                                                <p className="text-2xl mb-2">📸</p>
                                                <p className="text-sm font-semibold text-gray-700">Upload your profile photo</p>
                                                <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP (Max 2MB)</p>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoUpload}
                                            disabled={photoUploading}
                                            className="w-full mt-3 cursor-pointer disabled:cursor-not-allowed"
                                        />
                                    </div>
                                    {photoUploading && <p className="text-yellow-600 text-sm mt-2 font-semibold">⏳ Uploading photo...</p>}
                                    {!photoURL && <p className="text-yellow-600 text-sm mt-2 font-semibold">⚠️ Photo is required to submit your application</p>}
                                </div>

                                {/* Tell us about yourself */}
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        💬 Tell us about yourself <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="Tell us about your experience, why you want to join, etc."
                                        rows="4"
                                        {...register('aboutYourself', { 
                                            required: 'Please tell us about yourself',
                                            minLength: { value: 20, message: 'Please provide at least 20 characters' }
                                        })}
                                        className={`w-full text-base-100 px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 resize-none ${
                                            errors.aboutYourself ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    />
                                    {errors.aboutYourself && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.aboutYourself.message}</p>}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    data-aos="zoom-in" data-aos-delay="600"
                                    className="w-full mt-10 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl hover:shadow-2xl"
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <span className="animate-spin">🔄</span> Submitting...
                                        </span>
                                    ) : (
                                        '✅ Submit Application'
                                    )}
                                </button>

                        <p className="text-center text-sm text-gray-600 mt-6 font-medium">
                            By submitting this form, you agree to our terms and conditions.
                        </p>
                    </form>
                    </div>

                    {/* Right Side - Image */}
                    <div data-aos="fade-left" className="hidden lg:flex items-center justify-center">
                        {/* Animated background glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-orange-300 to-red-300 rounded-3xl blur-3xl opacity-40 animate-pulse group-hover:opacity-60 transition-opacity duration-500"></div>
                        
                        <div className="relative w-full h-full min-h-[600px] flex items-center justify-center group">
                            <div className="relative w-full h-full max-h-[700px]">
                                <img 
                                    src={agentImage} 
                                    alt="ProFast Delivery Agent" 
                                    className="w-full h-full object-contain rounded-3xl shadow-2xl transform group-hover:scale-110 transition-all duration-700 group-hover:shadow-3xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BeRider;
