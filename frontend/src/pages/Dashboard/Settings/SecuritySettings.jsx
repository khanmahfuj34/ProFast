import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
    RiLockPasswordLine, 
    RiShieldCheckLine, 
    RiEyeLine, 
    RiEyeOffLine, 
    RiLogoutBoxRLine,
    RiMailLine,
    RiCalendarLine,
    RiTimeLine,
    RiErrorWarningLine,
    RiCheckboxCircleLine,
    RiDeviceLine
} from 'react-icons/ri';
import { auth } from '../../../firebase/firebase.init';
import { 
    reauthenticateWithCredential, 
    EmailAuthProvider, 
    updatePassword 
} from 'firebase/auth';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const SecuritySettings = () => {
    const { user, logOut } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const newPassword = watch('newPassword');

    // Fetch Account Metadata from Backend
    const { data: metadata, isLoading: metadataLoading } = useQuery({
        queryKey: ['accountMetadata'],
        queryFn: async () => {
            const res = await axiosSecure.get('/security/account-metadata');
            return res.data.metadata;
        }
    });

    const isPasswordUser = user?.providerData?.some(p => p.providerId === 'password');

    // Password Update Mutation
    const passwordMutation = useMutation({
        mutationFn: async (data) => {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not authenticated");
            if (!isPasswordUser) throw new Error("Social login users cannot change passwords here. Please use your provider (Google/Facebook) settings.");

            console.log('🔐 [Security] Attempting re-authentication for:', currentUser.email);

            // 1. Re-authenticate with current password
            try {
                const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword);
                await reauthenticateWithCredential(currentUser, credential);
                console.log('✅ [Security] Re-authentication successful');
            } catch (reauthError) {
                console.error('❌ [Security] Re-authentication failed:', reauthError.code);
                throw reauthError;
            }

            // 2. Update password
            await updatePassword(currentUser, data.newPassword);
            return { success: true };
        },
        onSuccess: () => {
            toast.success('Password updated successfully!');
            reset();
        },
        onError: (error) => {
            console.error('❌ Password Update Error:', error);
            
            // Handle specific Firebase error codes
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                toast.error('Current password is incorrect');
            } else if (error.code === 'auth/weak-password') {
                toast.error('New password is too weak');
            } else if (error.code === 'auth/requires-recent-login') {
                toast.error('Security timeout. Please log out and log back in to change password.');
            } else {
                toast.error(error.message || 'Failed to update password');
            }
        }
    });

    // Revoke Sessions Mutation
    const revokeSessionsMutation = useMutation({
        mutationFn: async () => {
            const res = await axiosSecure.post('/security/revoke-sessions');
            return res.data;
        },
        onSuccess: (data) => {
            toast.success(data.message || 'All sessions revoked. Logging you out...');
            // Log out locally after revoking all sessions
            setTimeout(() => {
                logOut();
            }, 2000);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to revoke sessions');
        }
    });

    const onSubmitPassword = (data) => {
        passwordMutation.mutate(data);
    };

    // Password Strength Check
    const getPasswordStrength = (pass) => {
        if (!pass) return 0;
        let strength = 0;
        if (pass.length >= 8) strength += 25;
        if (/[A-Z]/.test(pass)) strength += 25;
        if (/[0-9]/.test(pass)) strength += 25;
        if (/[^A-Za-z0-9]/.test(pass)) strength += 25;
        return strength;
    };

    const strength = getPasswordStrength(newPassword);
    const strengthColor = strength <= 25 ? 'bg-red-500' : strength <= 50 ? 'bg-amber-500' : strength <= 75 ? 'bg-blue-500' : 'bg-lime-500';
    const strengthText = strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong';

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start animate-in fade-in duration-700">
            {/* Left Column: Security Controls */}
            <div className="xl:col-span-2 space-y-8">
                {/* Password Change Card */}
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="p-8 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Security Credentials</h2>
                            <p className="text-slate-400 text-sm font-medium mt-0.5">Update your password to keep your account secure</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-lime-600">
                            <RiLockPasswordLine size={24} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmitPassword)} className={`p-8 space-y-8 relative ${!isPasswordUser ? 'opacity-50 pointer-events-none' : ''}`}>
                        {!isPasswordUser && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-b-[40px] px-8">
                                <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl shadow-xl max-w-md text-center">
                                    <RiErrorWarningLine size={40} className="text-amber-500 mx-auto mb-4" />
                                    <h3 className="text-lg font-black text-slate-900 mb-2">Social Account Detected</h3>
                                    <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                        You are logged in via <span className="font-bold text-slate-900 capitalize">{user?.providerData?.[0]?.providerId.split('.')[0]}</span>. 
                                        Password management for social accounts is handled directly by the provider.
                                    </p>
                                </div>
                            </div>
                        )}
                        {/* Current Password */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-sm font-bold text-slate-700">Current Password</label>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Required</span>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-lime-500 transition-colors">
                                    <RiLockPasswordLine size={20} />
                                </div>
                                <input
                                    type={showCurrentPass ? "text" : "password"}
                                    {...register('currentPassword', { required: 'Current password is required' })}
                                    placeholder="••••••••"
                                    className="w-full h-14 pl-12 pr-12 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showCurrentPass ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                                </button>
                            </div>
                            {errors.currentPassword && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.currentPassword.message}</p>}
                        </div>

                        {/* Divider */}
                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-4 bg-white text-slate-400 font-bold uppercase tracking-widest">New Credentials</span>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 ml-1">New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-lime-500 transition-colors">
                                        <RiShieldCheckLine size={20} />
                                    </div>
                                    <input
                                        type={showNewPass ? "text" : "password"}
                                        {...register('newPassword', { 
                                            required: 'New password is required',
                                            minLength: { value: 8, message: 'Password must be at least 8 characters' }
                                        })}
                                        placeholder="••••••••"
                                        className="w-full h-14 pl-12 pr-12 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPass(!showNewPass)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showNewPass ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                                    </button>
                                </div>
                                
                                {/* Strength Meter */}
                                <div className="mt-4 space-y-2 px-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Strength</span>
                                        <span className={`text-[10px] font-black uppercase ${strengthColor.replace('bg-', 'text-')}`}>{strengthText}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${strengthColor} transition-all duration-500`}
                                            style={{ width: `${strength}%` }}
                                        ></div>
                                    </div>
                                </div>
                                {errors.newPassword && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.newPassword.message}</p>}
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 ml-1">Confirm New Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-lime-500 transition-colors">
                                        <RiShieldCheckLine size={20} />
                                    </div>
                                    <input
                                        type={showConfirmPass ? "text" : "password"}
                                        {...register('confirmPassword', { 
                                            required: 'Please confirm your password',
                                            validate: value => value === newPassword || 'Passwords do not match'
                                        })}
                                        placeholder="••••••••"
                                        className="w-full h-14 pl-12 pr-12 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showConfirmPass ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                                    </button>
                                </div>
                                {errors.confirmPassword && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.confirmPassword.message}</p>}
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={passwordMutation.isPending}
                                className="w-full md:w-auto px-10 h-14 bg-slate-900 hover:bg-lime-500 disabled:bg-slate-200 text-white rounded-2xl font-black shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 active:scale-95 group/btn"
                            >
                                {passwordMutation.isPending ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    <RiCheckboxCircleLine size={22} className="group-hover/btn:scale-125 transition-transform" />
                                )}
                                {passwordMutation.isPending ? 'Updating Password...' : 'Update Password'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Session Management Card */}
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border-l-4 border-l-red-500">
                    <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[24px] bg-red-50 text-red-500 flex items-center justify-center border border-red-100 shadow-sm">
                                <RiDeviceLine size={32} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900">Active Sessions</h3>
                                <p className="text-slate-500 text-sm font-medium mt-1 leading-relaxed max-w-md">
                                    Lost a device or suspect unauthorized access? Log out of all active sessions across all your devices immediately.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                if (window.confirm('Are you sure you want to log out from all devices? This will also log you out of your current session.')) {
                                    revokeSessionsMutation.mutate();
                                }
                            }}
                            disabled={revokeSessionsMutation.isPending}
                            className="w-full md:w-auto px-8 h-14 bg-red-500 hover:bg-red-600 disabled:bg-slate-200 text-white rounded-2xl font-black shadow-lg shadow-red-500/20 transition-all flex items-center justify-center gap-3 active:scale-95 group/logout"
                        >
                            {revokeSessionsMutation.isPending ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <RiLogoutBoxRLine size={20} className="group-hover/logout:translate-x-1 transition-transform" />
                            )}
                            {revokeSessionsMutation.isPending ? 'Processing...' : 'Logout All Devices'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Information & Metadata */}
            <div className="space-y-8">
                {/* Security Metadata Card */}
                <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-lg">Account Integrity</h3>
                            <RiShieldCheckLine size={28} className="text-lime-400" />
                        </div>
                        
                        <div className="space-y-6">
                            {/* Email Status */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-lime-400">
                                    <RiMailLine size={20} />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Email Status</p>
                                    <div className="flex items-center justify-between mt-0.5">
                                        <p className="text-sm font-bold">{user?.email}</p>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${metadata?.emailVerified ? 'bg-lime-500/20 text-lime-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {metadata?.emailVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Created At */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                                    <RiCalendarLine size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Account Created</p>
                                    <p className="text-sm font-bold mt-0.5">
                                        {metadata?.creationTime ? new Date(metadata.creationTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Loading...'}
                                    </p>
                                </div>
                            </div>

                            {/* Last Login */}
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-400">
                                    <RiTimeLine size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Last Login</p>
                                    <p className="text-sm font-bold mt-0.5">
                                        {metadata?.lastSignInTime ? new Date(metadata.lastSignInTime).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Tip Section */}
                        <div className="p-4 bg-white/5 rounded-[24px] border border-white/10 mt-6">
                            <div className="flex items-start gap-3">
                                <RiErrorWarningLine className="text-amber-400 shrink-0 mt-0.5" size={18} />
                                <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                                    For better security, use a combination of uppercase, numbers and special characters. Never reuse your email password.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Decorative Patterns */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
                </div>

                {/* Help Section */}
                <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group hover:border-lime-500 transition-all duration-500">
                    <div className="w-14 h-14 bg-blue-50 rounded-[20px] flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-500">
                        <RiShieldCheckLine size={28} />
                    </div>
                    <h4 className="text-xl font-black text-slate-900">Security Center</h4>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed mt-3">
                        If you believe your account has been compromised, please contact our security team immediately.
                    </p>
                    <button className="mt-8 w-full h-12 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-900 rounded-xl font-black transition-all flex items-center justify-center gap-2 group/btn">
                        Contact Security
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecuritySettings;
