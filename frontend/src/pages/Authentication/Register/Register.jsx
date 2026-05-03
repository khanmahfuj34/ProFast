import React, { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { auth } from '../../../firebase/firebase.init';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useImageUpload from '../../../hooks/useImageUpload';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ProFastLogo from '../../Home/shared/ProFastLogo/ProFastLogo';

const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { createUser } = useAuth();
    const navigation = useNavigate();
    const axiosSecure = useAxiosSecure();
    const { uploadImage, uploading: isUploading } = useImageUpload();
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

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

    useEffect(() => {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 50,
        });
    }, []);
    
    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-yellow-100 to-yellow-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Main Container - 2 Column Layout */}
            <div className="w-full max-w-6xl">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
                    
                    {/* LEFT COLUMN - FORM */}
                    <div className="w-full lg:w-5/12 flex flex-col justify-center" data-aos="fade-right">
                        {/* Logo */}
                        <div className="mb-8">
                            {/* <h2 className="text-3xl font-bold text-gray-900 font-syne">ProFast</h2> */}
                            <ProFastLogo className="w-32 h-32 text-3xl font-bold text-gray-900 font-syne"></ProFastLogo>
                        </div>

                        {/* Heading */}
                        <div className="mb-8">
                            <h1 className="text-5xl font-bold text-gray-900 mb-3 font-syne">Create Account</h1>
                            <p className="text-gray-600 text-sm font-dm-sans">Join ProFast today</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                        
                            {/* Name Field */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-900 font-dm-sans">Name</label>
                                <input 
                                    type="text" 
                                    placeholder='John Doe' 
                                    {...register('name', { required: "Name is required", pattern: { value: /^[a-zA-Z\s]+$/, message: "Name must contain only alphabetical characters" } })}
                                    aria-invalid={errors.name ? "true" : "false"}
                                    className={`w-full px-4 py-2.5 rounded-lg bg-white border-2 transition-all duration-300 focus:outline-none font-dm-sans text-gray-900 placeholder-gray-400 ${
                                        errors.name 
                                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 focus:border-lime-400 focus:ring-2 focus:ring-lime-100'
                                    }`}
                                />
                                {errors.name && (
                                    <p role="alert" className='text-red-500 text-xs font-medium flex items-center gap-1 font-dm-sans'>
                                        <span>⚠</span> {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Email Field */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-900 font-dm-sans">Email</label>
                                <input 
                                    type="email" 
                                    placeholder='your.email@gmail.com' 
                                    {...register('email', { required: "Email is required", pattern: { value: /^[^\s@]+@gmail\.com$/, message: "Email must be a valid Gmail address (@gmail.com)" } })}
                                    aria-invalid={errors.email ? "true" : "false"}
                                    className={`w-full px-4 py-2.5 rounded-lg bg-white border-2 transition-all duration-300 focus:outline-none font-dm-sans text-gray-900 placeholder-gray-400 ${
                                        errors.email 
                                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 focus:border-lime-400 focus:ring-2 focus:ring-lime-100'
                                    }`}
                                />
                                {errors.email && (
                                    <p role="alert" className='text-red-500 text-xs font-medium flex items-center gap-1 font-dm-sans'>
                                        <span>⚠</span> {errors.email.message}
                                    </p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-900 font-dm-sans">Password</label>
                                <input 
                                    type="password" 
                                    placeholder='Create a strong password' 
                                    {...register('password', { required: "Password is required", minLength: 6, maxLength: 32 })}
                                    aria-invalid={errors.password ? "true" : "false"}
                                    className={`w-full px-4 py-2.5 rounded-lg bg-white border-2 transition-all duration-300 focus:outline-none font-dm-sans text-gray-900 placeholder-gray-400 ${
                                        errors.password 
                                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                                        : 'border-gray-200 focus:border-lime-400 focus:ring-2 focus:ring-lime-100'
                                    }`}
                                />
                                {errors.password?.type === "required" && (
                                    <p role="alert" className='text-red-500 text-xs font-medium flex items-center gap-1 font-dm-sans'>
                                        <span>⚠</span> Password is required
                                    </p>
                                )}
                                {errors.password?.type === "minLength" && (
                                    <p role="alert" className='text-red-500 text-xs font-medium flex items-center gap-1 font-dm-sans'>
                                        <span>⚠</span> Minimum 6 characters required
                                    </p>
                                )}
                                {errors.password?.type === "maxLength" && (
                                    <p role="alert" className='text-red-500 text-xs font-medium flex items-center gap-1 font-dm-sans'>
                                        <span>⚠</span> Maximum 32 characters allowed
                                    </p>
                                )}
                            </div>

                            {/* Photo Upload Field */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-900 font-dm-sans">Profile Photo (Optional)</label>
                                <div className="relative">
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
                                        className={`w-full px-4 py-2.5 rounded-lg bg-white border-2 transition-all duration-300 cursor-pointer flex items-center gap-2 font-dm-sans text-gray-600 ${
                                            isUploading
                                            ? 'border-blue-400 bg-blue-50' 
                                            : photoFile
                                            ? 'border-lime-400 bg-lime-50'
                                            : 'border-gray-200 hover:border-lime-300'
                                        }`}
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                        {isUploading ? '📸 Uploading...' : photoFile ? `✅ ${photoFile.name}` : 'Click to upload photo'}
                                    </label>
                                </div>
                                {photoPreview && (
                                    <div className="mt-2 flex items-center gap-3">
                                        <img 
                                            src={photoPreview} 
                                            alt="Preview" 
                                            className="w-12 h-12 rounded-lg object-cover border-2 border-lime-300"
                                        />
                                        <div className="text-xs text-gray-600">
                                            <p className="font-medium">Preview</p>
                                            <p className="text-gray-500">{(photoFile?.size / 1024).toFixed(2)} KB</p>
                                        </div>
                                    </div>
                                )}
                                <p className="text-xs text-gray-500 font-dm-sans">Supported: JPG, PNG, WebP (Max 2MB)</p>
                            </div>

                            {/* Terms & Conditions */}
                            <label className="flex items-center gap-2 cursor-pointer pt-1">
                                <input 
                                    type="checkbox" 
                                    required
                                    className="w-4 h-4 rounded bg-white border-2 border-gray-300 text-lime-500 focus:ring-2 focus:ring-lime-200 cursor-pointer" 
                                />
                                <span className="text-md text-gray-700 font-dm-sans">
                                    I agree to the terms and conditions
                                </span>
                            </label>

                            {/* Register Button */}
                            <button 
                                type="submit"
                                className="w-full mt-6 px-6 py-3 bg-lime-400 hover:bg-lime-500 active:bg-lime-600 text-gray-900 font-bold rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95 font-syne uppercase tracking-wider text-sm"
                            >
                                Register
                            </button>

                            {/* Divider */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xl">
                                    <span className="px-2 bg-yellow-50 text-gray-500">or</span>
                                </div>
                            </div>

                            {/* Google Register Button */}
                            <button 
                                type="button"
                                onClick={handleGoogleRegister}
                                className="w-full px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-200 font-dm-sans text-md flex items-center justify-center gap-2 active:scale-95"
                            >
                                {/* Official Google Logo */}
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Register with Google
                            </button>

                            {/* Sign In Link */}
                            <div className="text-center pt-2">
                                <p className="text-gray-600 text-xl font-dm-sans">
                                    Already have an account?{' '}
                                    <a href="/auth/login" className="text-lime-600 hover:text-lime-700 transition-colors font-bold cursor-pointer">
                                        Login
                                    </a>
                                </p>
                            </div>
                        </form>
                    </div>

                    {/* RIGHT COLUMN - ILLUSTRATION */}
                    <div className="hidden lg:flex w-full lg:w-5/12 items-center justify-center" data-aos="fade-left">
                        <div className="w-full flex items-center justify-center">
                            {/* Illustration SVG */}
                            <svg className="w-full max-w-sm h-auto" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Background Circle */}
                                <circle cx="200" cy="200" r="180" fill="#F3E8FF" opacity="0.3"/>
                                <circle cx="200" cy="200" r="150" fill="#E9D5FF" opacity="0.2"/>
                                
                                {/* Package Box */}
                                <rect x="120" y="180" width="80" height="80" fill="#FBBF24" rx="4"/>
                                <rect x="120" y="180" width="80" height="20" fill="#F59E0B" rx="4"/>
                                <line x1="160" y1="180" x2="160" y2="260" stroke="#F59E0B" strokeWidth="2"/>
                                
                                {/* Delivery Person - Left */}
                                <circle cx="100" cy="120" r="18" fill="#D2691E"/>
                                <rect x="88" y="145" width="24" height="45" fill="#3B82F6" rx="3"/>
                                <ellipse cx="75" cy="160" rx="12" ry="8" fill="#D2691E"/>
                                <ellipse cx="125" cy="160" rx="12" ry="8" fill="#D2691E"/>
                                <rect x="92" y="190" width="6" height="35" fill="#1F2937"/>
                                <rect x="104" y="190" width="6" height="35" fill="#1F2937"/>
                                <ellipse cx="95" cy="228" rx="6" ry="4" fill="#000"/>
                                <ellipse cx="107" cy="228" rx="6" ry="4" fill="#000"/>
                                
                                {/* Customer - Right */}
                                <circle cx="300" cy="125" r="18" fill="#D2691E"/>
                                <rect x="288" y="150" width="24" height="45" fill="#8B5CF6" rx="3"/>
                                <ellipse cx="275" cy="165" rx="12" ry="8" fill="#D2691E"/>
                                <ellipse cx="325" cy="165" rx="12" ry="8" fill="#D2691E"/>
                                <rect x="292" y="195" width="6" height="35" fill="#1F2937"/>
                                <rect x="304" y="195" width="6" height="35" fill="#1F2937"/>
                                <ellipse cx="295" cy="233" rx="6" ry="4" fill="#000"/>
                                <ellipse cx="307" cy="233" rx="6" ry="4" fill="#000"/>
                                
                                {/* Handshake Connection */}
                                <line x1="125" y1="160" x2="275" y2="165" stroke="#34A853" strokeWidth="3" strokeLinecap="round"/>
                                
                                {/* Checkmark Above */}
                                <circle cx="200" cy="100" r="20" fill="#34A853"/>
                                <path d="M 192 100 L 198 106 L 212 94" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                                
                                {/* Delivery Status Text */}
                                <text x="200" y="300" textAnchor="middle" fontSize="18" fontFamily="Arial" fontWeight="bold" fill="#1F2937">
                                    Fast & Reliable
                                </text>
                                <text x="200" y="330" textAnchor="middle" fontSize="14" fontFamily="Arial" fill="#6B7280">
                                    Seamless Experience
                                </text>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;