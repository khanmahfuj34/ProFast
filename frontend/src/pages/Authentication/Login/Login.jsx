import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signInWithRedirect, sendPasswordResetEmail } from 'firebase/auth';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { auth } from '../../../firebase/firebase.init';
import { useForm } from 'react-hook-form';
import useAuth from '../../../hooks/useAuth';
import { useTheme } from '../../../contexts/ThemeContext';
import ThemeToggle from '../../../components/ThemeToggle';
import { toast } from 'react-toastify';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiMapPin, FiTruck, FiBox, FiCheckCircle, FiSun, FiMoon, FiArrowRight, FiActivity, FiTrendingUp } from 'react-icons/fi';
import ProFastLogo from '../../Home/shared/ProFastLogo/ProFastLogo';

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signIn, user, loading, userProfile } = useAuth();
    const location = useLocation();
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const [resetError, setResetError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Theme State
    const { isDark: isDarkMode } = useTheme();

    const onSubmit = data => {
        signIn(data.email, data.password)
            .then(() => { })
            .catch(error => {
                console.error('❌ Auth Error Code:', error.code);
                if (error.code === 'auth/api-key-not-valid') {
                    toast.error('Firebase Configuration Issue. Contact admin.', { position: 'top-right', autoClose: 4000 });
                } else if (error.code === 'auth/user-not-found') {
                    toast.error('User not found. Please register first.', { position: 'top-right', autoClose: 4000 });
                } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    toast.error('Incorrect credentials.', { position: 'top-right', autoClose: 4000 });
                } else if (error.code === 'auth/email-not-verified') {
                    toast.error('⚠️ Verify your email first. Check your inbox for verification link.', { position: 'top-right', autoClose: 5000 });
                } else {
                    toast.error(`Error: ${error.message}`, { position: 'top-right', autoClose: 4000 });
                }
            });
    };

    const handleGoogleLogin = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            if (isMobile) {
                console.log('📱 Mobile detected. Using signInWithRedirect for Google Auth...');
                await signInWithRedirect(auth, provider);
            } else {
                console.log('💻 Desktop detected. Using signInWithPopup for Google Auth...');
                const result = await signInWithPopup(auth, provider);

                await result.user.reload();
                if (!result.user.emailVerified) {
                    toast.error('⚠️ Verify your email first. Check your inbox for verification link.', { position: 'top-right', autoClose: 5000 });
                    return;
                }

                toast.success(`Welcome back ${result.user.displayName}!`, { position: 'top-right', autoClose: 2000 });
            }
        } catch (error) {
            console.error('❌ Google Login Error:', error.message);
            toast.error(`Login failed: ${error.message}`, { position: 'top-right', autoClose: 4000 });
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        if (!resetEmail.trim()) return setResetError('Please enter your email address');
        if (!/^[^\s@]+@gmail\.com$/.test(resetEmail)) return setResetError('Please enter a valid Gmail address');

        setResetLoading(true);
        setResetError('');

        try {
            await sendPasswordResetEmail(auth, resetEmail);
            toast.success('✅ Password reset email sent!', { position: 'top-right', autoClose: 5000 });
            setResetEmail('');
            setShowForgotPassword(false);
        } catch (error) {
            if (error.code === 'auth/user-not-found') setResetError('No account found with this email address.');
            else if (error.code === 'auth/invalid-email') setResetError('Invalid email address format.');
            else if (error.code === 'auth/too-many-requests') setResetError('Too many reset requests. Please try again later.');
            else setResetError(`Error: ${error.message}`);
            toast.error('Failed to send reset email. Please try again.', { position: 'top-right', autoClose: 4000 });
        } finally {
            setResetLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0f1c]' : 'bg-gray-50'}`}>
                <span className="loading loading-spinner loading-lg text-[#FF6A13]"></span>
                <p className={`mt-4 font-medium font-dm-sans ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Signing you in…</p>
            </div>
        );
    }

    if (user) {
        if (!userProfile) {
            return (
                <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0f1c]' : 'bg-gray-50'}`}>
                    <span className="loading loading-spinner loading-lg text-[#FF6A13]"></span>
                    <p className={`mt-4 font-medium font-dm-sans ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading your profile…</p>
                </div>
            );
        }

        let destination = location.state?.from?.pathname;
        if (userProfile.role === 'admin') destination = '/admin';
        else if (userProfile.role === 'rider') destination = '/dashboard/rider-dashboard';
        else if (!destination || destination === '/' || destination === '/dashboard') destination = '/';
        return <Navigate to={destination} replace />;
    }

    return (
        <div className={`min-h-screen w-full relative overflow-hidden transition-colors duration-700 font-sans ${isDarkMode ? 'bg-[#060a14]' : 'bg-[#f4f7fc]'}`}>

            {/* Theme Toggle */}
            <div className="absolute top-6 right-4 sm:right-6 z-50">
                <ThemeToggle />
            </div>

            {/* Futuristic Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Global Map/Grid Pattern */}
                <div className={`absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CgkJPHBhdGggZD0iTTAgMGg0MHY0MEgwem00MCA0MGMwLTEuMS0uOS0yLTItMmgtOGMtMS4xIDAtMi0uOS0yLTJzLjktMiAyLTJoOGMxLjEtMi0uOS0yLTIgMnYuMDlsLTIgMmgtMmMtMS4xIDAtMiAuOS0yIDJ2OGMwIDEuMS0uOSAyLTIgMnMtMi0uOS0yLTJ2LThjMC0xLjEtLjktMi0yLTJoLThjLTEuMSAwLTIgLjktMiAyczIuOS0yLTIgMmg4Yy0xLjEtMi0uOS0yLTIgMnoiIGZpbGw9IiMzMzMiIGZpbGwtb3BhY2l0eT0iMC4wNSIgZmlsbC1ydWxlPSJldmVub2RkIi8+Cjwvc3ZnPg==')] opacity-30`}></div>

                {/* Glowing Nodes / Lines (Dark Mode emphasis) */}
                <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className={`absolute top-[-10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[120px] ${isDarkMode ? 'bg-[#FF6A13]/20' : 'bg-[#FF6A13]/10'}`}
                />
                <motion.div
                    animate={{ opacity: [0.2, 0.5, 0.2], scale: [1, 1.1, 1] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className={`absolute bottom-[-10%] -right-[10%] w-[60%] h-[60%] rounded-full blur-[140px] ${isDarkMode ? 'bg-[#1E40AF]/20' : 'bg-[#3B82F6]/10'}`}
                />

                {/* Animated Route Lines */}
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
            <div className="relative z-10 w-full h-screen flex items-center justify-center p-4">

                {/* Left Side: Floating Widgets */}
                <div className="hidden xl:flex flex-col justify-between h-full max-h-[800px] w-1/4 max-w-[320px] absolute left-12 py-12">
                    {/* Live Tracking Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className={`p-5 rounded-2xl border backdrop-blur-xl ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/70 border-white shadow-xl text-gray-800'}`}
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-[#FF6A13]/20 flex items-center justify-center text-[#FF6A13]">
                                <FiMapPin size={20} />
                            </div>
                            <div>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Live Tracking</p>
                                <p className="font-semibold">In Transit</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Kolkata, WB</span>
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6A13] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6A13]"></span>
                            </span>
                        </div>
                    </motion.div>

                    {/* Stats Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
                        className={`p-5 rounded-2xl border backdrop-blur-xl ${isDarkMode ? 'bg-[#0B152A]/60 border-blue-500/20 text-white' : 'bg-white/80 border-blue-100 shadow-xl text-gray-800'}`}
                    >
                        <div className="flex gap-4 items-center">
                            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                <FiActivity size={24} />
                            </div>
                            <div>
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Shipments</p>
                                <p className="text-2xl font-bold font-syne tracking-tight">24,540</p>
                                <p className="text-xs text-emerald-500 font-medium flex items-center gap-1 mt-1">
                                    <FiTrendingUp size={12} /> +18.6% this month
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Center: Login Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring" }}
                    className={`w-full max-w-[440px] p-8 sm:p-10 rounded-3xl border backdrop-blur-2xl relative ${isDarkMode
                        ? 'bg-[#111827]/60 border-[#1F2937]/80 shadow-[0_0_50px_rgba(255,106,19,0.05)]'
                        : 'bg-white border-white/40 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)]'
                        }`}
                >
                    {/* Glowing effect around the card in dark mode */}
                    {isDarkMode && (
                        <div className="absolute -inset-[1px] rounded-[24px] bg-gradient-to-br from-[#FF6A13]/30 via-transparent to-blue-500/30 opacity-50 -z-10 blur-[2px]"></div>
                    )}

                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <ProFastLogo />
                    </div>

                    <div className="text-center mb-8">
                        <h1 className={`text-3xl font-bold font-syne mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            Welcome <span className="text-[#FF6A13]">back</span>
                        </h1>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Log in to your Profast account</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Email */}
                        <div className="space-y-1.5">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiMail size={18} className={isDarkMode ? 'text-gray-500' : 'text-gray-400'} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    {...register('email', { required: "Email is required", pattern: { value: /^[^\s@]+@gmail\.com$/, message: "Must be a valid Gmail address" } })}
                                    className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-sm transition-all outline-none ${isDarkMode
                                        ? 'bg-[#1F2937]/50 border-gray-700 text-white placeholder-gray-500 focus:bg-[#1F2937] focus:border-[#FF6A13]/50 focus:ring-1 focus:ring-[#FF6A13]/50'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#FF6A13] focus:ring-2 focus:ring-[#FF6A13]/20'
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
                                    placeholder="Enter your password"
                                    {...register('password', { required: "Password is required" })}
                                    className={`w-full pl-11 pr-12 py-3.5 rounded-xl border text-sm transition-all outline-none ${isDarkMode
                                        ? 'bg-[#1F2937]/50 border-gray-700 text-white placeholder-gray-500 focus:bg-[#1F2937] focus:border-[#FF6A13]/50 focus:ring-1 focus:ring-[#FF6A13]/50'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:bg-white focus:border-[#FF6A13] focus:ring-2 focus:ring-[#FF6A13]/20'
                                        }`}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className={`absolute inset-y-0 right-0 pr-4 flex items-center ${isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs pl-2">{errors.password.message}</p>}
                        </div>

                        {/* Options */}
                        <div className="flex items-center justify-between text-sm py-1">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input type="checkbox" className={`peer w-4 h-4 rounded border appearance-none checked:bg-[#FF6A13] checked:border-transparent transition-all cursor-pointer ${isDarkMode ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'}`} />
                                    <FiCheckCircle size={10} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" />
                                </div>
                                <span className={`transition-colors ${isDarkMode ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-900'}`}>Remember me</span>
                            </label>
                            <button type="button" onClick={() => setShowForgotPassword(true)} className="text-[#FF6A13] hover:text-[#e05a0b] transition-colors font-medium">
                                Forgot password?
                            </button>
                        </div>

                        {/* Submit */}
                        <button type="submit" className="relative group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#FF6A13] to-[#FF8C42] text-white py-3.5 px-4 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(255,106,19,0.4)] active:scale-[0.98] overflow-hidden">
                            <span className="relative z-10">Log in to Profast</span>
                            <FiArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                            {/* Hover effect layer */}
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
                        </button>

                        {/* Demo Credentials */}
                        <div className={`text-sm font-bold space-y-2 p-3 rounded-xl border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                            <p>👤 User: <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>user2@gmail.com</span> | Password: <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>11223344</span></p>
                            <p>🏍️ Rider: <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>rider2@gmail.com</span> | Password: <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>11223344</span></p>
                            <p>🛡️ Admin: <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>admin@gmail.com</span> | Password: <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>11223344</span></p>
                        </div>

                        <div className="relative py-4 flex items-center justify-center">
                            <div className={`absolute w-full h-[1px] ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}></div>
                            <span className={`relative px-4 text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'bg-[#111827] text-gray-500' : 'bg-white text-gray-400'}`}>OR</span>
                        </div>

                        {/* Google Auth */}
                        <button type="button" onClick={handleGoogleLogin} className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border font-medium transition-all active:scale-[0.98] ${isDarkMode
                            ? 'bg-transparent border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-gray-600'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm'
                            }`}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continue with Google
                        </button>

                        <div className="text-center pt-2">
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                Don't have an account?{' '}
                                <Link to="/auth/register" className="text-[#FF6A13] font-semibold hover:underline">
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </form>
                </motion.div>

                {/* Right Side: Floating Widgets */}
                <div className="hidden xl:flex flex-col h-full max-h-[800px] w-1/4 max-w-[320px] absolute right-12 py-12 pt-[180px]">
                    {/* Delivery Status Widget */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                        className={`p-5 rounded-2xl border backdrop-blur-xl ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white/70 border-white shadow-xl text-gray-800'}`}
                    >
                        <div className="flex gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 self-start">
                                <FiBox size={24} />
                            </div>
                            <div className="w-full">
                                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Delivery Status</p>
                                <p className="font-semibold text-[#FF6A13] mb-3">Out for Delivery</p>

                                <div className="flex justify-between text-xs mb-1">
                                    <span>85% Completed</span>
                                </div>
                                <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                                    <div className="h-full bg-blue-500 w-[85%] rounded-full relative">
                                        <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            <AnimatePresence>
                {showForgotPassword && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl ${isDarkMode ? 'bg-[#1F2937] border-gray-700' : 'bg-white border-gray-100'}`}
                        >
                            <h2 className={`text-2xl font-bold font-syne mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Reset Password</h2>
                            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Enter your email address and we'll send you a link to reset your password.</p>

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                                    <input
                                        type="email"
                                        value={resetEmail}
                                        onChange={(e) => { setResetEmail(e.target.value); setResetError(''); }}
                                        placeholder="your.email@gmail.com"
                                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-all outline-none ${isDarkMode ? 'bg-[#374151]/50 border-gray-600 text-white focus:border-[#FF6A13]' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-[#FF6A13] focus:ring-2 focus:ring-[#FF6A13]/20'}`}
                                    />
                                </div>

                                {resetError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-red-500 text-sm font-medium">⚠️ {resetError}</p>
                                    </div>
                                )}

                                {resetEmail && !resetError && (
                                    <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                                        <p className="text-green-500 text-sm">✓ We'll send a reset link to this email</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => { setShowForgotPassword(false); setResetEmail(''); setResetError(''); }}
                                        className={`flex-1 py-3 rounded-xl font-medium transition-colors ${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={resetLoading}
                                        className={`flex-1 py-3 bg-blue-500 text-white font-medium rounded-xl transition-all ${resetLoading ? 'opacity-50' : 'hover:bg-blue-600 active:scale-95'}`}
                                    >
                                        {resetLoading ? 'Sending...' : 'Send Link'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Login;