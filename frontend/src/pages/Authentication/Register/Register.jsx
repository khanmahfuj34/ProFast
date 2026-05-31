import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '../../../firebase/firebase.init';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useImageUpload from '../../../hooks/useImageUpload';
import { toast } from 'react-toastify';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiMapPin, FiTruck, FiBox, FiCheckCircle, FiSun, FiMoon, FiArrowRight, FiActivity, FiImage, FiTrendingUp, FiShield, FiGlobe } from 'react-icons/fi';
import ProFastLogo from '../../Home/shared/ProFastLogo/ProFastLogo';

const Register = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm();
    const { createUser } = useAuth();
    const navigation = useNavigate();
    const axiosSecure = useAxiosSecure();
    const { uploadImage, uploading: isUploading } = useImageUpload();
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    
    // UI States
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);

    const passwordValue = watch("password", "");

    // Handle photo file selection
    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setPhotoPreview(previewUrl);
        }
    };
    
    const onSubmit = async (data) => {
        try {
            let uploadedPhotoURL = null;

            // Upload photo if selected
            if (photoFile) {
                try {
                    toast.info('📸 Uploading photo...', { autoClose: 3000 });
                    uploadedPhotoURL = await uploadImage(photoFile);
                    console.log('✅ Photo uploaded:', uploadedPhotoURL);
                    toast.success('✅ Photo uploaded successfully!', { autoClose: 2000 });
                } catch (photoError) {
                    console.warn('⚠️  Photo upload failed (non-critical):', photoError.message);
                    toast.warn('⚠️  Photo upload failed. Continuing with registration...', { autoClose: 3000 });
                    // Continue registration even if photo upload fails
                }
            }

            // Create user in Firebase
            const result = await createUser(data.email, data.password, data.name);
            
            // ✅ Get Firebase ID token for API authentication
            const firebaseToken = await result.user.getIdToken();
            localStorage.setItem('authToken', firebaseToken);
            console.log('✅ Firebase token stored for API requests');
            
            // Prepare user data for database
            const userInfo = {
                email: data.email,
                displayName: data.name,
                photoURL: uploadedPhotoURL || result.user?.photoURL || null
            };

            try {
                // Save user to database with explicit Authorization header
                const dbResponse = await axiosSecure.post('/user', userInfo, {
                    headers: {
                        'Authorization': `Bearer ${firebaseToken}`
                    }
                });
                console.log('✅ User saved to database:', dbResponse.data);
            } catch (dbError) {
                console.warn('⚠️  Database save warning (non-critical):', dbError?.response?.data?.message || dbError.message);
            }

            // Update Firebase user profile with photo
            try {
                await updateProfile(result.user, {
                    displayName: data.name,
                    photoURL: uploadedPhotoURL || result.user?.photoURL || null
                });
                console.log('✅ Firebase profile updated with photo');
            } catch (profileError) {
                console.warn('⚠️  Profile update warning:', profileError.message);
            }

            toast.success('✅ Account created successfully! Redirecting to home...', {
                position: 'top-right',
                autoClose: 5000,
            });

            // Cleanup preview
            if (photoPreview) {
                URL.revokeObjectURL(photoPreview);
            }

            // Redirect to home page
            setTimeout(() => navigation('/', { replace: true }), 1500);

        } catch (error) {
            console.error('❌ Registration Error:', error);
            let errorMessage = 'Registration failed. Please try again.';

            // Firebase specific error messages
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = '📧 This email is already registered.';
                    break;
                case 'auth/weak-password':
                    errorMessage = '🔐 Password must be at least 6 characters.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = '❌ Invalid email format.';
                    break;
                case 'auth/operation-not-allowed':
                    errorMessage = '⚠️  Email/Password sign-up is not enabled.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = '🔒 Too many attempts. Please try again later.';
                    break;
                default:
                    errorMessage = error.message || 'An unexpected error occurred.';
            }

            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 5000,
            });
        }
    };

    const handleGoogleRegister = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            // ✅ Get Firebase ID token for API authentication
            const firebaseToken = await result.user.getIdToken();
            localStorage.setItem('authToken', firebaseToken);
            console.log('✅ Firebase token stored for API requests');
            
            // Prepare user data for database
            const userInfo = {
                email: result.user.email,
                displayName: result.user.displayName || 'Google User',
                photoURL: result.user.photoURL || null
            };

            try {
                // Save user to database with explicit Authorization header
                const dbResponse = await axiosSecure.post('/user', userInfo, {
                    headers: {
                        'Authorization': `Bearer ${firebaseToken}`
                    }
                });
                console.log('✅ Google user saved to database:', dbResponse.data);
            } catch (dbError) {
                console.warn('⚠️  Database save skipped (user may already exist):', dbError?.response?.data?.message);
                // Don't fail if user already exists in database
            }

            toast.success(`👋 Welcome ${result.user.displayName}!`, {
                position: 'top-right',
                autoClose: 4000,
            });

            console.log('✅ Google Registration successful:', result.user.email);
            
            // Redirect to home page
            setTimeout(() => navigation('/', { replace: true }), 1000);

        } catch (error) {
            console.error('❌ Google Registration Error:', error.code, error.message);
            
            let errorMessage = 'Google sign-up failed. Please try again.';
            
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Sign-up cancelled. Please try again.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = '🔒 Pop-up blocked. Please enable pop-ups and try again.';
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = '⚠️  Account exists with different sign-in method.';
            }
            
            toast.error(errorMessage, {
                position: 'top-right',
                autoClose: 5000,
            });
        }
    };

    return (
        <div className={`min-h-screen w-full relative overflow-hidden transition-colors duration-700 font-sans ${isDarkMode ? 'bg-[#060a14]' : 'bg-[#f4f7fc]'}`}>
            
            {/* Theme Toggle */}
            <div className="absolute top-6 right-6 z-50">
                <button 
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 backdrop-blur-md border ${
                        isDarkMode 
                        ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                        : 'bg-white/80 border-gray-200 text-gray-800 hover:bg-white shadow-sm'
                    }`}
                >
                    {isDarkMode ? <FiSun size={16} /> : <FiMoon size={16} />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
            </div>

            {/* Futuristic Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CgkJPHBhdGggZD0iTTAgMGg0MHY0MEgwem00MCA0MGMwLTEuMS0uOS0yLTItMmgtOGMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTJoOGMxLjEtMi0uOS0yLTIgMnYuMDlsLTIgMmgtMmMtMS4xIDAtMiAuOS0yIDJ2OGMwIDEuMS0uOSAyLTIgMnMtMi0uOS0yLTJ2LThjMC0xLjEtLjktMi0yLTJoLThjLTEuMSAwLTIgLjktMiAyczIuOS0yLTIgMmg4Yy0xLjEtMi0uOS0yLTIgMnoiIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iMC4wNSIgZmlsbC1ydWxlPSJldmVub2RkIi8+Cjwvc3ZnPg==')] opacity-30`}></div>
                
                <motion.div 
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1] }} 
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute top-[10%] -left-[5%] w-[40%] h-[40%] rounded-full blur-[120px] ${isDarkMode ? 'bg-[#FF6A13]/20' : 'bg-[#FF6A13]/10'}`} 
                />
                <motion.div 
                    animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }} 
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className={`absolute bottom-[10%] -right-[5%] w-[50%] h-[50%] rounded-full blur-[140px] ${isDarkMode ? 'bg-[#1E40AF]/20' : 'bg-[#3B82F6]/10'}`} 
                />

                <svg className="absolute inset-0 w-full h-full opacity-40">
                    <motion.path 
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0.2, 0.8, 0.2] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        d="M -100 200 C 300 400 600 100 1000 600 S 1400 200 1800 400" 
                        fill="transparent" 
                        stroke={isDarkMode ? "#FF6A13" : "#F97316"} 
                        strokeWidth="2" 
                        strokeDasharray="4 8"
                    />
                    <motion.path 
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0.1, 0.5, 0.1] }}
                        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                        d="M 1800 100 C 1400 300 1000 100 600 500 S 200 800 -100 400" 
                        fill="transparent" 
                        stroke={isDarkMode ? "#3B82F6" : "#60A5FA"} 
                        strokeWidth="1.5"
                        strokeDasharray="6 6"
                    />
                </svg>
            </div>

            {/* Main Content Layout */}
            <div className="relative z-10 w-full min-h-screen flex items-center justify-center p-4 py-12">
                
                {/* Left Side: Floating Widgets */}
                <div className="hidden xl:flex flex-col justify-center h-full gap-6 w-1/4 max-w-[320px] absolute left-12">
                    
                    {/* Live Tracking Widget */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className={`p-5 rounded-2xl border backdrop-blur-xl ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/70 border-white shadow-xl text-gray-800'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#FF6A13]/10 flex items-center justify-center text-[#FF6A13]">
                                <FiMapPin size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-[15px]">Real-time Tracking</p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track every move in real time</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* AI Smart Logistics Widget */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                        className={`p-5 rounded-2xl border backdrop-blur-xl ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/70 border-white shadow-xl text-gray-800'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                                <FiTruck size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-[15px]">Smart Logistics</p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>AI powered route optimization</p>
                            </div>
                        </div>
                    </motion.div>

                </div>

                {/* Center: Register Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring" }}
                    className={`w-full max-w-[460px] p-8 sm:p-10 rounded-3xl border backdrop-blur-2xl relative my-8 ${
                        isDarkMode 
                        ? 'bg-[#111827]/60 border-[#1F2937]/80 shadow-[0_0_50px_rgba(255,106,19,0.05)]' 
                        : 'bg-white border-white/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
                    }`}
                >
                    {isDarkMode && (
                        <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-br from-[#FF6A13]/30 via-transparent to-blue-500/30 opacity-50 -z-10 blur-[2px]"></div>
                    )}

                    {/* Logo & Header */}
                    <div className="flex justify-center mb-6">
                        <ProFastLogo />
                    </div>

                    <div className="text-center mb-8">
                        <h1 className={`text-3xl font-bold font-syne mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Create your <span className="text-[#FF6A13]">account</span>
                        </h1>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Join Profast and simplify your logistics.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        
                        {/* Name */}
                        <div className="space-y-1.5">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiUser size={18} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    {...register('name', { required: "Name is required", pattern: { value: /^[a-zA-Z\s]+$/, message: "Name must contain only alphabetical characters" } })}
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                                        isDarkMode ? 'bg-[#1F2937]/50 border-gray-700 text-white placeholder-gray-500 focus:bg-[#1F2937] focus:border-[#FF6A13]/50 focus:ring-1 focus:ring-[#FF6A13]/50' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#FF6A13] focus:ring-2 focus:ring-[#FF6A13]/20'
                                    }`}
                                />
                            </div>
                            {errors.name && <p className="text-red-500 text-xs pl-2">{errors.name.message}</p>}
                        </div>

                        {/* Email */}
                        <div className="space-y-1.5">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiMail size={18} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    {...register('email', { required: "Email is required", pattern: { value: /^[^\s@]+@gmail\.com$/, message: "Must be a valid Gmail address (@gmail.com)" } })}
                                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm transition-all outline-none ${
                                        isDarkMode ? 'bg-[#1F2937]/50 border-gray-700 text-white placeholder-gray-500 focus:bg-[#1F2937] focus:border-[#FF6A13]/50 focus:ring-1 focus:ring-[#FF6A13]/50' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#FF6A13] focus:ring-2 focus:ring-[#FF6A13]/20'
                                    }`}
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs pl-2">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiLock size={18} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    {...register('password', { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" }, maxLength: { value: 32, message: "Maximum 32 characters" } })}
                                    className={`w-full pl-11 pr-12 py-3 rounded-xl border text-sm transition-all outline-none ${
                                        isDarkMode ? 'bg-[#1F2937]/50 border-gray-700 text-white placeholder-gray-500 focus:bg-[#1F2937] focus:border-[#FF6A13]/50 focus:ring-1 focus:ring-[#FF6A13]/50' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#FF6A13] focus:ring-2 focus:ring-[#FF6A13]/20'
                                    }`}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute inset-y-0 right-0 pr-4 flex items-center ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs pl-2">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiLock size={18} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                                </div>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm Password"
                                    {...register('confirmPassword', { 
                                        required: "Please confirm your password",
                                        validate: value => value === passwordValue || "Passwords do not match"
                                    })}
                                    className={`w-full pl-11 pr-12 py-3 rounded-xl border text-sm transition-all outline-none ${
                                        isDarkMode ? 'bg-[#1F2937]/50 border-gray-700 text-white placeholder-gray-500 focus:bg-[#1F2937] focus:border-[#FF6A13]/50 focus:ring-1 focus:ring-[#FF6A13]/50' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#FF6A13] focus:ring-2 focus:ring-[#FF6A13]/20'
                                    }`}
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className={`absolute inset-y-0 right-0 pr-4 flex items-center ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-red-500 text-xs pl-2">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* Profile Photo - Integrated beautifully */}
                        <div className="pt-1">
                            <input 
                                type="file" 
                                accept="image/jpeg,image/jpg,image/png,image/webp" 
                                onChange={handlePhotoChange}
                                disabled={isUploading}
                                className="hidden"
                                id="photo-input"
                            />
                            <label 
                                htmlFor="photo-input"
                                className={`w-full py-2.5 px-4 rounded-xl border border-dashed flex items-center gap-3 text-sm transition-all cursor-pointer ${
                                    isDarkMode 
                                    ? 'bg-[#1F2937]/30 border-gray-600 hover:border-[#FF6A13]/50 text-gray-400 hover:text-gray-300' 
                                    : 'bg-gray-50 border-gray-300 hover:border-[#FF6A13] text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                {photoPreview ? (
                                    <div className="w-8 h-8 rounded-lg overflow-hidden border border-[#FF6A13]/50 flex-shrink-0">
                                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                        <FiImage size={14} />
                                    </div>
                                )}
                                <span className="flex-1 truncate">
                                    {isUploading ? 'Uploading...' : photoFile ? photoFile.name : 'Upload Profile Photo (Optional)'}
                                </span>
                            </label>
                        </div>

                        {/* Terms and conditions */}
                        <div className="flex items-center text-sm py-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" required className={`peer w-4 h-4 rounded border appearance-none checked:bg-[#FF6A13] checked:border-transparent transition-all cursor-pointer ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`} />
                                    <FiCheckCircle size={10} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                                </div>
                                <span className={`transition-colors text-xs ${isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-900'}`}>
                                    I agree to the <span className="text-[#FF6A13] hover:underline">Terms of Service</span> and <span className="text-[#FF6A13] hover:underline">Privacy Policy</span>
                                </span>
                            </label>
                        </div>

                        {/* Submit */}
                        <button type="submit" disabled={isUploading} className={`relative group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6A13] to-[#FF8C42] text-white py-3.5 px-4 rounded-xl font-semibold transition-all shadow-md active:scale-[0.98] overflow-hidden ${isUploading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(255,106,19,0.4)]'}`}>
                            <span className="relative z-10">{isUploading ? 'Registering...' : 'Create Account'}</span>
                            {!isUploading && (
                                <>
                                    <FiArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                                </>
                            )}
                        </button>

                        <div className="relative py-3 flex items-center justify-center">
                            <div className={`absolute w-full h-[1px] ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                            <span className={`relative px-4 text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'bg-[#111827] text-gray-500' : 'bg-white text-gray-400'}`}>OR</span>
                        </div>

                        {/* Google Auth */}
                        <button type="button" onClick={handleGoogleRegister} className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border font-medium transition-all active:scale-[0.98] ${
                            isDarkMode 
                            ? 'bg-transparent border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-gray-600' 
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                        }`}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continue with Google
                        </button>

                        <div className="text-center pt-2">
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Already have an account?{' '}
                                <Link to="/auth/login" className="text-[#FF6A13] font-semibold hover:underline">
                                    Log in
                                </Link>
                            </p>
                        </div>
                    </form>
                </motion.div>

                {/* Right Side: Floating Widgets */}
                <div className="hidden xl:flex flex-col justify-center h-full gap-6 w-1/4 max-w-[320px] absolute right-12 pt-[120px]">
                    
                    {/* Secure Delivery Widget */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                        className={`p-5 rounded-2xl border backdrop-blur-xl ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/70 border-white shadow-xl text-gray-800'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <FiShield size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-[15px]">Secure Delivery</p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Safe, reliable & on-time</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Global Network Widget */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
                        className={`p-5 rounded-2xl border backdrop-blur-xl ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/70 border-white shadow-xl text-gray-800'}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                <FiGlobe size={24} />
                            </div>
                            <div>
                                <p className="font-semibold text-[15px]">Global Network</p>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Delivering across 100+ countries</p>
                            </div>
                        </div>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default Register;