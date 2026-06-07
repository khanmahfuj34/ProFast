import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
    RiUserLine, 
    RiPhoneLine, 
    RiMapPinLine, 
    RiMailLine, 
    RiShieldCheckLine, 
    RiCalendarLine,
    RiTimeLine,
    RiErrorWarningLine,
    RiCheckboxCircleLine,
    RiLockPasswordLine,
    RiLogoutBoxRLine,
    RiDeviceLine,
    RiEyeLine,
    RiEyeOffLine,
    RiContrastLine,
    RiSunLine,
    RiMoonLine,
    RiNotification3Line,
    RiTruckLine,
    RiUserStarLine,
    RiCameraLine,
    RiUpload2Line,
    RiSettings4Line,
    RiCoinsLine,
    RiDatabaseLine,
    RiTerminalLine
} from 'react-icons/ri';
import { auth } from '../../../firebase/firebase.init';
import { 
    reauthenticateWithCredential, 
    EmailAuthProvider, 
    updatePassword 
} from 'firebase/auth';
import useAuth from '../../../hooks/useAuth';
import useImageUpload from '../../../hooks/useImageUpload';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useTheme } from '../../../contexts/ThemeContext';

const Settings = () => {
    const { user, userProfile, updateProfileData, logOut } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { theme, setTheme } = useTheme();
    const { uploadImage, uploading: imageUploading } = useImageUpload();
    const queryClient = useQueryClient();
    
    const [activeTab, setActiveTab] = useState('profile');
    const [previewImage, setPreviewImage] = useState(userProfile?.photoURL || user?.photoURL || null);
    
    // Toggle password visibility states
    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    // React Hook Forms
    const { 
        register: registerProfile, 
        handleSubmit: handleSubmitProfile, 
        reset: resetProfile, 
        formState: { errors: profileErrors, isDirty: isProfileDirty } 
    } = useForm({
        defaultValues: {
            displayName: userProfile?.displayName || user?.displayName || '',
            phoneNumber: userProfile?.phoneNumber || '',
            address: userProfile?.address || ''
        }
    });

    const { 
        register: registerPassword, 
        handleSubmit: handleSubmitPassword, 
        reset: resetPassword, 
        watch: watchPassword,
        formState: { errors: passwordErrors } 
    } = useForm();
    
    const newPassword = watchPassword('newPassword');

    // 1. Fetch Account Metadata (Firebase admin SDK info from backend)
    const { data: metadata, isLoading: isMetadataLoading } = useQuery({
        queryKey: ['adminAccountMetadata'],
        queryFn: async () => {
            const res = await axiosSecure.get('/security/account-metadata');
            return res.data.metadata;
        }
    });

    // 2. Fetch Admin Notification Settings
    const { data: notifSettings, isLoading: isNotifLoading } = useQuery({
        queryKey: ['adminNotificationSettings'],
        queryFn: async () => {
            const res = await axiosSecure.get('/notification-settings');
            return res.data.settings;
        }
    });

    // 3. Fetch Global Admin Settings (Delivery & Rider Settings)
    const { data: globalSettings, isLoading: isGlobalSettingsLoading } = useQuery({
        queryKey: ['adminGlobalSettings'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin/settings');
            return res.data.settings;
        }
    });

    // Sync profile form when userProfile changes
    useEffect(() => {
        if (userProfile) {
            resetProfile({
                displayName: userProfile.displayName || user?.displayName || '',
                phoneNumber: userProfile.phoneNumber || '',
                address: userProfile.address || ''
            });
            setPreviewImage(userProfile.photoURL || user?.photoURL || null);
        }
    }, [userProfile, user, resetProfile]);

    // Profile update mutation
    const profileMutation = useMutation({
        mutationFn: updateProfileData,
        onSuccess: (data) => {
            toast.success(data.message || 'Profile updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update profile');
        }
    });

    // Theme update mutation
    const themeMutation = useMutation({
        mutationFn: async (newTheme) => {
            // Apply locally first for instant feedback
            setTheme(newTheme);
            // Sync theme in users collection in DB
            const res = await axiosSecure.patch('/user', { theme: newTheme });
            return res.data;
        },
        onSuccess: () => {
            toast.success('Theme preference synced to account!');
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (err) => {
            console.error('Failed to sync theme to DB:', err);
            toast.error('Theme applied locally, but failed to sync to cloud.');
        }
    });

    // Notification settings update mutation
    const notifMutation = useMutation({
        mutationFn: async (updatedFields) => {
            const res = await axiosSecure.patch('/notification-settings', updatedFields);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Notification preferences updated!');
            queryClient.invalidateQueries({ queryKey: ['adminNotificationSettings'] });
        },
        onError: () => {
            toast.error('Failed to save notification preferences');
        }
    });

    // Global settings update mutation (Delivery and Rider settings)
    const globalSettingsMutation = useMutation({
        mutationFn: async (settingsData) => {
            const res = await axiosSecure.patch('/admin/settings', settingsData);
            return res.data;
        },
        onSuccess: () => {
            toast.success('Global configurations saved successfully!');
            queryClient.invalidateQueries({ queryKey: ['adminGlobalSettings'] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to update global configurations');
        }
    });

    // Password Update Mutation
    const isPasswordUser = user?.providerData?.some(p => p.providerId === 'password');
    const passwordMutation = useMutation({
        mutationFn: async (data) => {
            const currentUser = auth.currentUser;
            if (!currentUser) throw new Error("User not authenticated");
            if (!isPasswordUser) throw new Error("Social accounts manage passwords on their provider (Google/Facebook) settings.");

            // Re-authenticate
            const credential = EmailAuthProvider.credential(currentUser.email, data.currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            
            // Update password
            await updatePassword(currentUser, data.newPassword);
            return { success: true };
        },
        onSuccess: () => {
            toast.success('Password updated successfully!');
            resetPassword();
        },
        onError: (error) => {
            console.error('Password Update Error:', error);
            if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                toast.error('Current password is incorrect');
            } else if (error.code === 'auth/weak-password') {
                toast.error('New password is too weak');
            } else if (error.code === 'auth/requires-recent-login') {
                toast.error('Security timeout. Please log out and back in to change password.');
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
            toast.success(data.message || 'All sessions revoked. Logging out...');
            setTimeout(() => {
                logOut();
            }, 2000);
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to revoke sessions');
        }
    });

    // Handlers
    const handleProfileSubmit = (data) => {
        profileMutation.mutate(data);
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);

        try {
            const imageUrl = await uploadImage(file);
            profileMutation.mutate({ photoURL: imageUrl });
        } catch (error) {
            toast.error(error.message || 'Image upload failed');
            setPreviewImage(userProfile?.photoURL || user?.photoURL || null);
        }
    };

    const handleThemeChange = (selectedTheme) => {
        themeMutation.mutate(selectedTheme);
    };

    const handleNotificationToggle = (field, checked) => {
        notifMutation.mutate({ [field]: checked });
    };

    const handleDeliverySettingsSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            defaultFee: formData.get('defaultFee'),
            expressFee: formData.get('expressFee'),
            codPercent: formData.get('codPercent'),
            minWeight: formData.get('minWeight'),
            maxWeight: formData.get('maxWeight'),
        };
        globalSettingsMutation.mutate(data);
    };

    const handleRiderSettingsSave = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            autoApproveRiders: formData.get('autoApproveRiders') === 'true',
            maxActiveDeliveries: formData.get('maxActiveDeliveries'),
            assignmentRule: formData.get('assignmentRule'),
        };
        globalSettingsMutation.mutate(data);
    };

    const handlePasswordSubmit = (data) => {
        passwordMutation.mutate(data);
    };

    // Password Strength Meter
    const getPasswordStrength = (pass) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length >= 8) score += 25;
        if (/[A-Z]/.test(pass)) score += 25;
        if (/[0-9]/.test(pass)) score += 25;
        if (/[^A-Za-z0-9]/.test(pass)) score += 25;
        return score;
    };

    const strength = getPasswordStrength(newPassword);
    const strengthColor = strength <= 25 ? 'bg-red-500' : strength <= 50 ? 'bg-amber-500' : strength <= 75 ? 'bg-blue-500' : 'bg-emerald-500';
    const strengthText = strength <= 25 ? 'Weak' : strength <= 50 ? 'Fair' : strength <= 75 ? 'Good' : 'Strong';

    // Tabs Config
    const tabs = [
        { id: 'profile', label: 'Admin Profile', icon: RiUserLine },
        { id: 'theme', label: 'Theme Settings', icon: RiContrastLine },
        { id: 'notifications', label: 'Notifications', icon: RiNotification3Line },
        { id: 'delivery', label: 'Delivery Fees', icon: RiTruckLine },
        { id: 'rider', label: 'Rider Settings', icon: RiUserStarLine },
        { id: 'security', label: 'Security & Auth', icon: RiShieldCheckLine },
    ];

    const isGlobalLoading = isMetadataLoading || isNotifLoading || isGlobalSettingsLoading;

    if (isGlobalLoading) {
        return (
            <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <span className="loading loading-spinner loading-lg text-emerald-500"></span>
                <p className="text-slate-500 dark:text-slate-400 font-bold animate-pulse">Loading system configurations...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">System Settings</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Configure global logistics settings, administration profile, security, and notification rules.</p>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    {/* Desktop Tabs */}
                    <div className="hidden lg:flex flex-col bg-white dark:bg-slate-800 rounded-[32px] p-4 border border-slate-200 dark:border-slate-700 shadow-sm gap-1 transition-colors duration-300">
                        <div className="px-4 py-2 mb-2">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Configuration Pages</span>
                        </div>
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all text-sm group ${
                                        isActive 
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                                            : 'text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-emerald-500 dark:hover:text-emerald-400'
                                    }`}
                                >
                                    <Icon size={20} className={isActive ? 'scale-110' : 'group-hover:scale-115 transition-transform'} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Mobile Horizontal Scroll Tabs */}
                    <div className="lg:hidden flex overflow-x-auto bg-white dark:bg-slate-800 rounded-2xl p-2.5 border border-slate-200 dark:border-slate-700 shadow-sm gap-2 scrollbar-none transition-colors duration-300">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all text-xs shrink-0 ${
                                        isActive 
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10' 
                                            : 'text-slate-600 dark:text-slate-355 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Settings Display Window */}
                <div className="lg:col-span-3">
                    {/* TAB: ADMIN PROFILE */}
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* Profile Header card */}
                            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative transition-colors duration-300">
                                <div className="h-32 bg-gradient-to-r from-emerald-400 to-teal-500 relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                                        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                                    </div>
                                </div>
                                
                                <div className="px-8 pb-8 -mt-16 relative z-10 flex flex-col md:flex-row items-end gap-6">
                                    <div className="relative group/photo">
                                        <div className="w-32 h-32 rounded-[32px] border-[6px] border-white dark:border-slate-800 shadow-2xl overflow-hidden bg-white dark:bg-slate-850 flex items-center justify-center text-slate-300 dark:text-slate-500">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                            ) : (
                                                <span className="text-4xl font-black">{userProfile?.displayName?.charAt(0) || user?.displayName?.charAt(0) || 'A'}</span>
                                            )}
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 dark:bg-slate-950 hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-xl cursor-pointer transition-all hover:scale-110 border-[3px] border-white dark:border-slate-800">
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={imageUploading} />
                                            {imageUploading ? <span className="loading loading-spinner loading-xs"></span> : <RiCameraLine size={18} />}
                                        </label>
                                    </div>
                                    
                                    <div className="flex-1 pb-2">
                                        <div className="flex items-center gap-3">
                                            <h1 className="text-2xl font-black text-slate-900 dark:text-white">{userProfile?.displayName || user?.displayName}</h1>
                                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-100 dark:border-emerald-900/30 uppercase tracking-wider">
                                                {userProfile?.role || 'Admin'}
                                            </span>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 mt-1">
                                            <RiMailLine className="text-slate-400" />
                                            {user?.email}
                                        </p>
                                    </div>
                                    
                                    <div className="pb-2 hidden md:block">
                                        <div className="flex items-center gap-2 text-slate-400 dark:text-slate-350 text-sm font-bold bg-slate-50 dark:bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-700/60">
                                            <RiCalendarLine />
                                            Joined {metadata?.creationTime ? new Date(metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Details form */}
                            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
                                <div className="p-8 border-b border-slate-100 dark:border-slate-700">
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin Details</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">Manage information details for your administrator profile.</p>
                                </div>

                                <form onSubmit={handleSubmitProfile(handleProfileSubmit)} className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                    <RiUserLine size={20} />
                                                </div>
                                                <input
                                                    {...registerProfile('displayName', { required: 'Name is required' })}
                                                    placeholder="Administrator name"
                                                    className="w-full h-14 pl-12 pr-5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Phone Number</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                    <RiPhoneLine size={20} />
                                                </div>
                                                <input
                                                    {...registerProfile('phoneNumber', { 
                                                        required: 'Phone is required',
                                                        minLength: { value: 11, message: 'Invalid phone number' }
                                                    })}
                                                    placeholder="017XXXXXXXX"
                                                    className="w-full h-14 pl-12 pr-5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                                />
                                            </div>
                                            {profileErrors.phoneNumber && <p className="text-red-500 text-xs font-bold mt-1">{profileErrors.phoneNumber.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Office Address</label>
                                        <div className="relative group">
                                            <div className="absolute top-4 left-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                <RiMapPinLine size={20} />
                                            </div>
                                            <textarea
                                                {...registerProfile('address')}
                                                placeholder="Enter full office or home address..."
                                                rows={3}
                                                className="w-full pl-12 pr-5 py-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-2.5 text-xs text-slate-400 dark:text-slate-500">
                                            <RiTimeLine size={16} />
                                            <span>Last login: {metadata?.lastSignInTime ? new Date(metadata.lastSignInTime).toLocaleString() : 'Loading...'}</span>
                                        </div>

                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTab('security')}
                                                className="w-full md:w-auto px-6 h-12 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all text-sm flex items-center justify-center gap-2"
                                            >
                                                <RiLockPasswordLine size={18} />
                                                <span>Change Password Shortcut</span>
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={profileMutation.isPending || !isProfileDirty}
                                                className="w-full md:w-auto px-8 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white rounded-xl font-black shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:shadow-none"
                                            >
                                                {profileMutation.isPending ? (
                                                    <span className="loading loading-spinner loading-sm"></span>
                                                ) : (
                                                    <RiCheckboxCircleLine size={20} />
                                                )}
                                                <span>Update Profile</span>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* TAB: THEME SETTINGS */}
                    {activeTab === 'theme' && (
                        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300 animate-in fade-in duration-300">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                    <RiContrastLine size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Theme Settings</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Customize the appearance of the dashboard panels.</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Light Mode option */}
                                    <div 
                                        onClick={() => handleThemeChange('light')}
                                        className={`cursor-pointer rounded-[24px] p-6 border-2 flex flex-col justify-between h-48 transition-all hover:shadow-md ${
                                            theme === 'light' 
                                                ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10' 
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center">
                                                <RiSunLine size={20} />
                                            </div>
                                            <input 
                                                type="radio" 
                                                checked={theme === 'light'} 
                                                onChange={() => {}} 
                                                className="radio radio-emerald radio-sm" 
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-base">Light Mode</h3>
                                            <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 leading-relaxed">Clean, bright interface suitable for well-lit environments.</p>
                                        </div>
                                    </div>

                                    {/* Dark Mode option */}
                                    <div 
                                        onClick={() => handleThemeChange('dark')}
                                        className={`cursor-pointer rounded-[24px] p-6 border-2 flex flex-col justify-between h-48 transition-all hover:shadow-md ${
                                            theme === 'dark' 
                                                ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10' 
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="w-10 h-10 rounded-xl bg-slate-700 text-slate-300 flex items-center justify-center">
                                                <RiMoonLine size={20} />
                                            </div>
                                            <input 
                                                type="radio" 
                                                checked={theme === 'dark'} 
                                                onChange={() => {}} 
                                                className="radio radio-emerald radio-sm" 
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-base">Dark Mode</h3>
                                            <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 leading-relaxed">Relaxing dark aesthetic that reduces eye strain in dark environments.</p>
                                        </div>
                                    </div>

                                    {/* System Mode option */}
                                    <div 
                                        onClick={() => handleThemeChange('system')}
                                        className={`cursor-pointer rounded-[24px] p-6 border-2 flex flex-col justify-between h-48 transition-all hover:shadow-md ${
                                            theme === 'system' 
                                                ? 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10' 
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center">
                                                <RiContrastLine size={20} />
                                            </div>
                                            <input 
                                                type="radio" 
                                                checked={theme === 'system'} 
                                                onChange={() => {}} 
                                                className="radio radio-emerald radio-sm" 
                                            />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-900 dark:text-white text-base">System Preference</h3>
                                            <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 leading-relaxed">Syncs automatically with your operating system theme settings.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-[24px] border border-slate-100 dark:border-slate-700 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-emerald-500 shrink-0">
                                        <RiDatabaseLine size={20} />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                        <strong className="text-slate-900 dark:text-white">Cloud Sync Enabled:</strong> Your appearance settings will be saved to your profile and persist across refreshes, logins, and all panel environments (Guest, User, Rider, Admin).
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: NOTIFICATIONS */}
                    {activeTab === 'notifications' && (
                        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300 animate-in fade-in duration-300">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                    <RiNotification3Line size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Notification Rules</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Enable or disable system event notifications for the administrator role.</p>
                                </div>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Item: New Parcel Notif */}
                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-900/40 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <div className="space-y-1 pr-4">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">New Parcel Placed</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Receive instant notifications when customers submit new parcel bookings.</p>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="toggle toggle-emerald border-slate-350 bg-slate-300 checked:bg-emerald-500" 
                                            checked={!!notifSettings?.newParcel} 
                                            onChange={(e) => handleNotificationToggle('newParcel', e.target.checked)}
                                        />
                                    </div>

                                    {/* Item: Rider Application */}
                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-900/40 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <div className="space-y-1 pr-4">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Rider Application Submitted</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Alert when a rider registers and requests approval to join the fleet.</p>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="toggle toggle-emerald border-slate-350 bg-slate-300 checked:bg-emerald-500" 
                                            checked={!!notifSettings?.riderApplication} 
                                            onChange={(e) => handleNotificationToggle('riderApplication', e.target.checked)}
                                        />
                                    </div>

                                    {/* Item: Support Ticket */}
                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-900/40 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <div className="space-y-1 pr-4">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">New Support Ticket</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Get notified when users create new customer support or claim tickets.</p>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="toggle toggle-emerald border-slate-350 bg-slate-300 checked:bg-emerald-500" 
                                            checked={!!notifSettings?.supportTicket} 
                                            onChange={(e) => handleNotificationToggle('supportTicket', e.target.checked)}
                                        />
                                    </div>

                                    {/* Item: Delivery Complete */}
                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-900/40 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm">
                                        <div className="space-y-1 pr-4">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">Delivery Completed</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Receive updates upon successful parcel deliveries by riders.</p>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="toggle toggle-emerald border-slate-350 bg-slate-300 checked:bg-emerald-500" 
                                            checked={!!notifSettings?.deliveryComplete} 
                                            onChange={(e) => handleNotificationToggle('deliveryComplete', e.target.checked)}
                                        />
                                    </div>

                                    {/* Item: Broadcast Notifications */}
                                    <div className="flex items-center justify-between p-6 bg-slate-50/50 dark:bg-slate-900/40 rounded-[24px] border border-slate-100 dark:border-slate-700 shadow-sm md:col-span-2">
                                        <div className="space-y-1 pr-4">
                                            <h3 className="font-bold text-slate-900 dark:text-white text-sm">System Broadcast Alerts</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">Allow receiving automated security broadcasts, server status alerts, and backup reminders.</p>
                                        </div>
                                        <input 
                                            type="checkbox" 
                                            className="toggle toggle-emerald border-slate-350 bg-slate-300 checked:bg-emerald-500" 
                                            checked={!!notifSettings?.broadcast} 
                                            onChange={(e) => handleNotificationToggle('broadcast', e.target.checked)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB: DELIVERY FEES */}
                    {activeTab === 'delivery' && (
                        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300 animate-in fade-in duration-300">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                    <RiTruckLine size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Delivery Fee Rules</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Configure default rates, express surcharges, COD fee margins, and load configurations.</p>
                                </div>
                            </div>

                            <form onSubmit={handleDeliverySettingsSave} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Default Delivery Fee */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Default Delivery Fee (৳)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold">
                                                ৳
                                            </div>
                                            <input
                                                type="number"
                                                name="defaultFee"
                                                defaultValue={globalSettings?.defaultFee ?? 60}
                                                required
                                                min="0"
                                                className="w-full h-14 pl-10 pr-5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Express Surcharge */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Express Delivery Fee (৳)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold">
                                                ৳
                                            </div>
                                            <input
                                                type="number"
                                                name="expressFee"
                                                defaultValue={globalSettings?.expressFee ?? 120}
                                                required
                                                min="0"
                                                className="w-full h-14 pl-10 pr-5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Cash on Delivery Fee (COD %) */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Cash on Delivery (COD) Fee (%)</label>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-bold">
                                                %
                                            </div>
                                            <input
                                                type="number"
                                                step="0.1"
                                                name="codPercent"
                                                defaultValue={globalSettings?.codPercent ?? 1.5}
                                                required
                                                min="0"
                                                max="100"
                                                className="w-full h-14 pl-10 pr-5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white"
                                            />
                                        </div>
                                    </div>

                                    {/* Weight threshold container */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Parcel Weights (Min / Max kg)</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="minWeight"
                                                defaultValue={globalSettings?.minWeight ?? 0.1}
                                                required
                                                min="0"
                                                placeholder="Min (kg)"
                                                className="h-14 px-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white text-center"
                                            />
                                            <input
                                                type="number"
                                                step="0.1"
                                                name="maxWeight"
                                                defaultValue={globalSettings?.maxWeight ?? 50}
                                                required
                                                min="0.1"
                                                placeholder="Max (kg)"
                                                className="h-14 px-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white text-center"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={globalSettingsMutation.isPending}
                                        className="w-full md:w-auto px-8 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white rounded-xl font-black shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:shadow-none"
                                    >
                                        {globalSettingsMutation.isPending ? (
                                            <span className="loading loading-spinner loading-sm"></span>
                                        ) : (
                                            <RiCheckboxCircleLine size={20} />
                                        )}
                                        <span>Save Delivery Rules</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB: RIDER SETTINGS */}
                    {activeTab === 'rider' && (
                        <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300 animate-in fade-in duration-300">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                                    <RiUserStarLine size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Rider Rules</h2>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Control rider application approvals, task limits, and dispatch rules.</p>
                                </div>
                            </div>

                            <form onSubmit={handleRiderSettingsSave} className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Auto-Approve Applications */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Rider Approvals Policy</label>
                                        <select
                                            name="autoApproveRiders"
                                            defaultValue={globalSettings?.autoApproveRiders ? 'true' : 'false'}
                                            className="w-full h-14 px-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white cursor-pointer"
                                        >
                                            <option value="false">Manual Review & Approval Required</option>
                                            <option value="true">Auto-Approve Upon Registration</option>
                                        </select>
                                    </div>

                                    {/* Max Active Deliveries */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Maximum Active Deliveries Per Rider</label>
                                        <input
                                            type="number"
                                            name="maxActiveDeliveries"
                                            defaultValue={globalSettings?.maxActiveDeliveries ?? 5}
                                            required
                                            min="1"
                                            max="50"
                                            className="w-full h-14 px-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white"
                                        />
                                    </div>

                                    {/* Assignment Rule */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Parcel Matching & Assignment Dispatch Rule</label>
                                        <select
                                            name="assignmentRule"
                                            defaultValue={globalSettings?.assignmentRule ?? 'nearest'}
                                            className="w-full h-14 px-4 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white cursor-pointer"
                                        >
                                            <option value="nearest">Nearest Location Match (Lowest ETA)</option>
                                            <option value="rating-based">Rating-Based Preferred Matching</option>
                                            <option value="round-robin">Round-Robin Equal Dispatching</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={globalSettingsMutation.isPending}
                                        className="w-full md:w-auto px-8 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white rounded-xl font-black shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:shadow-none"
                                    >
                                        {globalSettingsMutation.isPending ? (
                                            <span className="loading loading-spinner loading-sm"></span>
                                        ) : (
                                            <RiCheckboxCircleLine size={20} />
                                        )}
                                        <span>Save Rider Rules</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* TAB: SECURITY & SESSIONS */}
                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in fade-in duration-300">
                            {/* Password Form */}
                            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
                                <div className="p-8 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-black text-slate-900 dark:text-white">Security Credentials</h2>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Change password and secure administrator configurations.</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-650 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <RiLockPasswordLine size={24} />
                                    </div>
                                </div>

                                <form onSubmit={handleSubmitPassword(handlePasswordSubmit)} className={`p-8 space-y-6 relative ${!isPasswordUser ? 'opacity-55 pointer-events-none select-none' : ''}`}>
                                    {!isPasswordUser && (
                                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-slate-800/60 backdrop-blur-[2px] rounded-b-[32px] px-8">
                                            <div className="bg-amber-50 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900/30 p-6 rounded-3xl shadow-xl max-w-md text-center">
                                                <RiErrorWarningLine size={40} className="text-amber-500 dark:text-amber-400 mx-auto mb-4" />
                                                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Federated Login Profile</h3>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                                                    You logged in via <span className="font-bold text-slate-900 dark:text-white capitalize">{user?.providerData?.[0]?.providerId.split('.')[0]}</span>. 
                                                    Password resets and security configurations are handled by your identity provider.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Current Password */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between px-1">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Current Password</label>
                                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Verification Required</span>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                <RiLockPasswordLine size={20} />
                                            </div>
                                            <input
                                                type={showCurrentPass ? "text" : "password"}
                                                {...registerPassword('currentPassword', { required: 'Current password is required' })}
                                                placeholder="••••••••"
                                                className="w-full h-14 pl-12 pr-12 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCurrentPass(!showCurrentPass)}
                                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-450 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                            >
                                                {showCurrentPass ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                                            </button>
                                        </div>
                                        {passwordErrors.currentPassword && <p className="text-red-500 text-xs font-bold mt-1">{passwordErrors.currentPassword.message}</p>}
                                    </div>

                                    {/* New Password & Confirm Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">New Password</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                    <RiShieldCheckLine size={20} />
                                                </div>
                                                <input
                                                    type={showNewPass ? "text" : "password"}
                                                    {...registerPassword('newPassword', { 
                                                        required: 'New password is required',
                                                        minLength: { value: 8, message: 'Password must be at least 8 characters' }
                                                    })}
                                                    placeholder="••••••••"
                                                    className="w-full h-14 pl-12 pr-12 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPass(!showNewPass)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-455 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                                >
                                                    {showNewPass ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                                                </button>
                                            </div>
                                            
                                            {/* Strength Indicator */}
                                            <div className="mt-2 space-y-1 px-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Strength</span>
                                                    <span className={`text-[10px] font-black uppercase ${strengthColor.replace('bg-', 'text-')}`}>{strengthText}</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                                    <div 
                                                        className={`h-full ${strengthColor} transition-all duration-500`}
                                                        style={{ width: `${strength}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                            {passwordErrors.newPassword && <p className="text-red-500 text-xs font-bold mt-1">{passwordErrors.newPassword.message}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Confirm New Password</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                                                    <RiShieldCheckLine size={20} />
                                                </div>
                                                <input
                                                    type={showConfirmPass ? "text" : "password"}
                                                    {...registerPassword('confirmPassword', { 
                                                        required: 'Confirm your password',
                                                        validate: value => value === newPassword || 'Passwords do not match'
                                                    })}
                                                    placeholder="••••••••"
                                                    className="w-full h-14 pl-12 pr-12 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all outline-none font-bold text-slate-700 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-455 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                                >
                                                    {showConfirmPass ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                                                </button>
                                            </div>
                                            {passwordErrors.confirmPassword && <p className="text-red-500 text-xs font-bold mt-1">{passwordErrors.confirmPassword.message}</p>}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={passwordMutation.isPending}
                                            className="w-full md:w-auto px-8 h-12 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-200 dark:disabled:bg-slate-700 text-white rounded-xl font-black shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:shadow-none"
                                        >
                                            {passwordMutation.isPending ? (
                                                <span className="loading loading-spinner loading-sm"></span>
                                            ) : (
                                                <RiCheckboxCircleLine size={20} />
                                            )}
                                            <span>Update Password</span>
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Session Security Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden border-l-4 border-l-red-500 transition-colors duration-300">
                                <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center border border-red-100 dark:border-red-900/30 shrink-0">
                                            <RiDeviceLine size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-black text-slate-900 dark:text-white">Active Account Sessions</h3>
                                            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed max-w-xl">
                                                Suspect unauthorized access? Instantly revoke active access sessions across all devices. This will require log-in again.
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
                                        className="w-full md:w-auto px-6 h-12 bg-red-500 hover:bg-red-650 disabled:bg-slate-250 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shrink-0 active:scale-95"
                                    >
                                        {revokeSessionsMutation.isPending ? (
                                            <span className="loading loading-spinner loading-sm"></span>
                                        ) : (
                                            <RiLogoutBoxRLine size={18} />
                                        )}
                                        <span>Logout All Devices</span>
                                    </button>
                                </div>
                            </div>

                            {/* Session Activity and Metadata Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Integrities metadata card */}
                                <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200 dark:border-slate-700 p-8 shadow-sm space-y-6 transition-colors duration-300">
                                    <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                        <RiShieldCheckLine size={22} className="text-emerald-500" />
                                        <span>Security Audit Log</span>
                                    </h3>
                                    
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Created</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {metadata?.creationTime ? new Date(metadata.creationTime).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Last Login</span>
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                {metadata?.lastSignInTime ? new Date(metadata.lastSignInTime).toLocaleString() : 'Just now'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Email Verified</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${metadata?.emailVerified ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
                                                {metadata?.emailVerified ? 'Verified' : 'Unverified'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Multi-Factor authentication teaser */}
                                <div className="bg-slate-900 dark:bg-slate-950 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl transition-colors duration-300">
                                    <div className="relative z-10 space-y-4 h-full flex flex-col justify-between">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-black text-lg">2-Factor Authentication</h3>
                                            <span className="px-2.5 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-full uppercase tracking-wider">Coming Soon</span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                                            We are currently developing Multi-Factor Authentication (MFA/2FA) utilizing Google Authenticator and SMS TOTP to guarantee total protection on administrator profiles.
                                        </p>
                                        <div className="pt-2">
                                            <button disabled className="px-5 py-2.5 bg-white/10 text-white/50 text-xs font-bold rounded-xl border border-white/5 cursor-not-allowed">
                                                Configure MFA (Locked)
                                            </button>
                                        </div>
                                    </div>
                                    {/* background glow */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
