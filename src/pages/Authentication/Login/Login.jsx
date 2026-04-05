import React, { useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate, Navigate } from 'react-router-dom';
import { auth } from '../../../firebase/firebase.init';
import { useForm } from 'react-hook-form';
import useAuth from '../../../hooks/useAuth';
import { toast } from 'react-toastify';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ProFastLogo from '../../Home/shared/ProFastLogo/ProFastLogo';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signIn, user, loading } = useAuth();
    const navigate = useNavigate();
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState('');


    const onSubmit = data => {
        // AuthProvider.signIn handles reload() + emailVerified check internally.
        // .then() is ONLY reached when the user is verified → safe to navigate.
        // .catch() handles all error cases including 'auth/email-not-verified'.
        signIn(data.email, data.password)
            .then(() => {
                // ✅ Verified user — navigate immediately, no toast needed
                navigate('/', { replace: true });
            })
            .catch(error => {
                // Handle all authentication errors — no navigation occurs here
                console.error('❌ Auth Error Code:', error.code);
                console.error('❌ Auth Error Message:', error.message);

                if (error.code === 'auth/api-key-not-valid') {
                    toast.error('Firebase Configuration Issue. Contact admin.', { position: 'top-right', autoClose: 4000 });
                } else if (error.code === 'auth/user-not-found') {
                    toast.error('User not found. Please register first.', { position: 'top-right', autoClose: 4000 });
                } else if (error.code === 'auth/wrong-password') {
                    toast.error('Incorrect password.', { position: 'top-right', autoClose: 4000 });
                } else if (error.code === 'auth/email-not-verified') {
                    // ❌ Unverified — show error only, no redirect
                    toast.error('⚠️ Verify your email first. Check your inbox for verification link.', { position: 'top-right', autoClose: 5000 });
                } else {
                    toast.error(`Error: ${error.message}`, { position: 'top-right', autoClose: 4000 });
                }
            });
    };

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            
            // ✅ Reload user data to ensure fresh email verification status
            await result.user.reload();
            
            // ❌ Check if email is verified - BLOCK here if not verified
            if (!result.user.emailVerified) {
                toast.error('⚠️ Verify your email first. Check your inbox for verification link.', { position: 'top-right', autoClose: 5000 });
                console.log('❌ Email not verified - Google user:', result.user.email);
                return; // STOP execution - don't navigate
            }
            
            // ✅ Email verified - ONLY proceed from here
            toast.success(`Welcome back ${result.user.displayName}!`, { position: 'top-right', autoClose: 2000 });
            console.log('✅ Google Login successful - Email verified:', result.user.email);
            
            // Navigate to home after 2 seconds
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 2000);
            
        } catch (error) {
            console.error('❌ Google Login Error:', error.message);
            toast.error(`Login failed: ${error.message}`, { position: 'top-right', autoClose: 4000 });
        }
    };

    // 🔐 Handle Forgot Password
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        
        // ✅ Validation
        if (!resetEmail.trim()) {
            setResetError('Please enter your email address');
            return;
        }
        
        if (!/^[^\s@]+@gmail\.com$/.test(resetEmail)) {
            setResetError('Please enter a valid Gmail address');
            return;
        }

        setResetLoading(true);
        setResetError('');

        try {
            // 📧 Send password reset email via Firebase
            await sendPasswordResetEmail(auth, resetEmail);
            
            toast.success('✅ Password reset email sent!', { 
                position: 'top-right', 
                autoClose: 5000 
            });
            
            console.log('📧 Password reset email sent to:', resetEmail);
            
            // Clear form & close modal
            setResetEmail('');
            setShowForgotPassword(false);
            
        } catch (error) {
            console.error('❌ Forgot Password Error:', error.code);
            
            // Handle specific Firebase errors
            if (error.code === 'auth/user-not-found') {
                setResetError('No account found with this email address.');
            } else if (error.code === 'auth/invalid-email') {
                setResetError('Invalid email address format.');
            } else if (error.code === 'auth/too-many-requests') {
                setResetError('Too many reset requests. Please try again later.');
            } else {
                setResetError(`Error: ${error.message}`);
            }
            
            toast.error('Failed to send reset email. Please try again.', { 
                position: 'top-right', 
                autoClose: 4000 
            });
        } finally {
            setResetLoading(false);
        }
    };

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 30 });
    }, []);

    // 🔒 All hooks called above — safe to do early return now
    if (!loading && user) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-b from-yellow-100 to-yellow-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
            {/* Main Container - 2 Column Layout */}
            <div className="w-full max-w-6xl">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
                    
                    {/* LEFT COLUMN - FORM */}
                    <div className="w-full lg:w-5/12 flex flex-col justify-center" data-aos="fade-right">
                        {/* Logo */}
                        <div className="mb-8 ">
                            <ProFastLogo></ProFastLogo>
                        </div>

                        {/* Heading */}
                        <div className="mb-8">
                            <h1 className="text-5xl font-bold text-gray-900 mb-3 font-syne">Welcome Back</h1>
                            <p className="text-gray-600 text-sm font-dm-sans">Login with your credentials</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
                    
                            {/* Email Field */}
                            <div className="space-y-1.5">
                                <label className="block text-sm font-medium text-gray-900 font-dm-sans">Email</label>
                                <input
                                    type="email"
                                    placeholder="your.email@gmail.com"
                                    {...register('email', {
                                        required: "Email is required",
                                        pattern: { value: /^[^\s@]+@gmail\.com$/, message: "Email must be a valid Gmail address (@gmail.com)" }
                                    })}
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
                                    placeholder="••••••••"
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

                            {/* Remember & Forgot */}
                            <div className="flex items-center justify-between pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded bg-white border-2 border-gray-300 text-lime-500 focus:ring-2 focus:ring-lime-200 cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-700 font-dm-sans">Remember me</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowForgotPassword(true)}
                                    className="text-md text-lime-600 hover:text-lime-700 transition-colors font-dm-sans font-semibold"
                                >
                                    Forgot password?
                                </button>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                className="w-full mt-6 px-6 py-3 bg-lime-400 hover:bg-lime-500 active:bg-lime-600 text-gray-900 font-bold rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95 font-syne uppercase tracking-wider text-sm"
                            >
                                Login
                            </button>

                            {/* Divider */}
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-yellow-50 text-gray-500">or</span>
                                </div>
                            </div>

                            {/* Google Login Button */}
                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full px-6 py-2.5 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium rounded-lg transition-all duration-200 font-dm-sans text-sm flex items-center justify-center gap-2 active:scale-95"
                            >
                                {/* Official Google Logo */}
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Login with Google
                            </button>

                            {/* Sign Up Link */}
                            <div className="text-center pt-2">
                                <p className="text-gray-600 text-xs font-dm-sans">
                                    Don't have an account?{' '}
                                    <a href="/auth/register" className="text-lime-600 hover:text-lime-700 transition-colors font-bold cursor-pointer">
                                        Register
                                    </a>
                                </p>
                            </div>
                        </form>

                        {/* 🔐 Forgot Password Modal */}
                        {showForgotPassword && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                                <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 transform transition-all animate-in ease-out">
                                    {/* Modal Header */}
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900 font-syne mb-2">Reset Password</h2>
                                        <p className="text-sm text-gray-600 font-dm-sans">
                                            Enter your email address and we'll send you a link to reset your password.
                                        </p>
                                    </div>

                                    {/* Reset Form */}
                                    <form onSubmit={handleForgotPassword} className="space-y-4">
                                        {/* Email Input */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-900 font-dm-sans">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={resetEmail}
                                                onChange={(e) => {
                                                    setResetEmail(e.target.value);
                                                    setResetError('');
                                                }}
                                                placeholder="your.email@gmail.com"
                                                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-dm-sans text-gray-900 bg-gray-50"
                                            />
                                        </div>

                                        {/* Error Message */}
                                        {resetError && (
                                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-red-700 text-sm font-medium font-dm-sans">
                                                    ⚠️ {resetError}
                                                </p>
                                            </div>
                                        )}

                                        {/* Success Message */}
                                        {resetEmail && !resetError && (
                                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                                <p className="text-green-700 text-sm font-dm-sans">
                                                    ✓ We'll send a reset link to this email
                                                </p>
                                            </div>
                                        )}

                                        {/* Buttons */}
                                        <div className="flex gap-3 pt-4">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowForgotPassword(false);
                                                    setResetEmail('');
                                                    setResetError('');
                                                }}
                                                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors font-dm-sans"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={resetLoading}
                                                className={`flex-1 px-4 py-2.5 bg-blue-500 text-white font-semibold rounded-lg transition-all font-dm-sans ${
                                                    resetLoading
                                                        ? 'opacity-50 cursor-not-allowed'
                                                        : 'hover:bg-blue-600 active:scale-95'
                                                }`}
                                            >
                                                {resetLoading ? '⏳ Sending...' : '📧 Send Reset Link'}
                                            </button>
                                        </div>

                                        {/* Info Text */}
                                        <p className="text-center text-xs text-gray-500 font-dm-sans pt-2">
                                            Check your email (including spam folder) for the reset link. Valid for 1 hour.
                                        </p>
                                    </form>
                                </div>
                            </div>
                        )}
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

export default Login;