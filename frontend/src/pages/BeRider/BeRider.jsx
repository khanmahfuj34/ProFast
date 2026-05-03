import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { coverageData } from '../../data/coverage-data';
import AnimatedRider from '../../components/AnimatedRider';
import AOS from 'aos';
import 'aos/dist/aos.css';

const BeRider = () => {
    const { register, handleSubmit, formState: { errors }, watch, reset } = useForm({
        defaultValues: {
            name: '',
            drivingLicense: '',
            email: '',
            region: '',
            district: '',
            nidNo: '',
            phoneNumber: '',
            bikeBrand: '',
            bikeRegistration: '',
            aboutYourself: ''
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const selectedRegion = watch('region');

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50 });
    }, []);

    // Get unique regions
    const regions = [...new Set(coverageData.map(item => item.region))];

    // Get districts for selected region
    const districts = selectedRegion 
        ? coverageData
            .filter(item => item.region === selectedRegion)
            .map(item => item.district)
        : [];

    const onSubmit = async (data) => {
        try {
            setIsSubmitting(true);
            console.log('🏍️ Rider Application Data:', data);
            
            // Here you would send data to backend
            // await axiosSecure.post('/rider-application', data);
            
            toast.success('✅ Application submitted successfully! We will review and get back to you soon.', {
                position: 'top-right',
                autoClose: 5000
            });

            reset();
        } catch (error) {
            console.error('❌ Submission Error:', error);
            toast.error('❌ Failed to submit application. Please try again.', {
                position: 'top-right',
                autoClose: 4000
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 py-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-16" data-aos="fade-up">
                <div className="text-center">
                    <h1 className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600 mb-4 animate-pulse">
                        🏍️ Become a Rider
                    </h1>
                    <p className="text-xl text-gray-700 font-semibold">Join our delivery team and start earning today</p>
                    <div className="flex justify-center gap-4 mt-6">
                        <div className="bg-yellow-200 text-yellow-800 px-4 py-2 rounded-full font-semibold">✅ Flexible Hours</div>
                        <div className="bg-orange-200 text-orange-800 px-4 py-2 rounded-full font-semibold">💰 Good Income</div>
                        <div className="bg-red-200 text-red-800 px-4 py-2 rounded-full font-semibold">🚀 Growth</div>
                    </div>
                </div>
            </div>

            {/* Main Content - Overlapping Layout */}
            <div className="max-w-7xl mx-auto">
                <div className="relative">
                    {/* Background Animation */}
                    <div className="absolute inset-0 h-[900px] lg:h-[800px]">
                        <div data-aos="fade-left" className="h-full flex items-center justify-center">
                            <div className="relative w-full h-full min-h-[500px] lg:min-h-[750px]">
                                {/* Animated background glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-yellow-300 via-orange-300 to-red-300 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
                                
                                {/* Animated Rider Component */}
                                <div className="relative h-full rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500 hover:shadow-3xl">
                                    <AnimatedRider />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Overlay */}
                    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                        {/* Left Side - Transparent Form */}
                        <div data-aos="fade-right" className="h-full pt-8 lg:pt-12">
                            <div className="bg-white/85 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 h-full border border-white/40 hover:bg-white/90 hover:shadow-3xl transition-all duration-500">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-3">
                                        Tell us about yourself
                                    </h2>
                                    <p className="text-gray-700 text-lg font-medium">Complete the form to join our rider network</p>
                                    <div className="h-1 w-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mt-4"></div>
                                </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                {/* Name */}
                                <div className="group">
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
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
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
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
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
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
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
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
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
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.drivingLicense ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    />
                                    {errors.drivingLicense && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.drivingLicense.message}</p>}
                                </div>

                                {/* Region */}
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        🗺️ Your Region <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('region', { required: 'Region is required' })}
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.region ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    >
                                        <option value="">Select Region</option>
                                        {regions.map(region => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </select>
                                    {errors.region && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.region.message}</p>}
                                </div>

                                {/* District */}
                                <div className="group">
                                    <label className="block text-sm font-bold text-gray-800 mb-2 group-hover:text-yellow-600 transition">
                                        📍 Your District <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('district', { required: 'District is required' })}
                                        disabled={!selectedRegion}
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.district ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        } ${!selectedRegion ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <option value="">
                                            {selectedRegion ? 'Select District' : 'Select Region First'}
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
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
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
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 ${
                                            errors.bikeRegistration ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    />
                                    {errors.bikeRegistration && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.bikeRegistration.message}</p>}
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
                                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all duration-300 resize-none ${
                                            errors.aboutYourself ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-yellow-300'
                                        }`}
                                    />
                                    {errors.aboutYourself && <p className="text-red-500 text-sm mt-1 font-semibold">⚠️ {errors.aboutYourself.message}</p>}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full mt-8 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-2xl"
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
                    </div>

                    {/* Right Side - Empty space for background animation visibility */}
                    <div className="hidden lg:block"></div>
                </div>
            </div>
        </div>
    );
};
