import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
    RiCameraLine, 
    RiUserLine, 
    RiPhoneLine, 
    RiMapPinLine, 
    RiHome4Line, 
    RiBuildingLine, 
    RiMailLine, 
    RiShieldCheckLine, 
    RiCalendarLine,
    RiArrowRightSLine,
    RiCustomerService2Line,
    RiUpload2Line,
    RiCheckboxCircleLine,
    RiGlobalLine,
    RiEdit2Line
} from 'react-icons/ri';
import useAuth from '../../../hooks/useAuth';
import useImageUpload from '../../../hooks/useImageUpload';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const ProfileSettings = () => {
    const { user, userProfile, updateProfileData } = useAuth();
    const axiosSecure = useAxiosSecure();
    const { uploadImage, uploading: imageUploading } = useImageUpload();
    const [previewImage, setPreviewImage] = useState(userProfile?.photoURL || user?.photoURL || null);
    
    const { register, handleSubmit, reset, watch, setValue, formState: { errors, isDirty } } = useForm({
        defaultValues: {
            displayName: userProfile?.displayName || user?.displayName || '',
            phoneNumber: userProfile?.phoneNumber || '',
            division: userProfile?.division || '',
            district: userProfile?.district || '',
            address: userProfile?.address || ''
        }
    });

    const selectedDivision = watch('division');
    const queryClient = useQueryClient();

    // Fetch Divisions
    const { data: divisions = [] } = useQuery({
        queryKey: ['divisions'],
        queryFn: async () => {
            const res = await axiosSecure.get('/coverage/divisions');
            console.log('📦 Divisions Response:', res.data);
            return res.data.divisions || [];
        }
    });

    // Fetch Districts based on Division
    const { data: districts = [], isLoading: districtsLoading } = useQuery({
        queryKey: ['districts', selectedDivision],
        queryFn: async () => {
            if (!selectedDivision) return [];
            const res = await axiosSecure.get(`/coverage/districts/${selectedDivision}`);
            return res.data.districts || [];
        },
        enabled: !!selectedDivision
    });

    useEffect(() => {
        if (userProfile) {
            reset({
                displayName: userProfile.displayName || user?.displayName || '',
                phoneNumber: userProfile.phoneNumber || '',
                division: userProfile.division || '',
                district: userProfile.district || '',
                address: userProfile.address || ''
            });
            setPreviewImage(userProfile.photoURL || user?.photoURL || null);
        }
    }, [userProfile, user, reset]);

    const mutation = useMutation({
        mutationFn: updateProfileData,
        onSuccess: (data) => {
            toast.success(data.message || 'Profile updated successfully!');
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update profile');
        }
    });

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setPreviewImage(reader.result);
        reader.readAsDataURL(file);

        try {
            const imageUrl = await uploadImage(file);
            mutation.mutate({ photoURL: imageUrl });
        } catch (error) {
            toast.error(error.message || 'Image upload failed');
            setPreviewImage(userProfile?.photoURL || user?.photoURL || null);
        }
    };

    const onSubmit = (data) => {
        mutation.mutate(data);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start animate-in fade-in duration-700">
            {/* Left Column: Main Form */}
            <div className="xl:col-span-2 space-y-8">
                {/* Profile Banner / Header Card */}
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden relative group">
                    <div className="h-32 bg-gradient-to-r from-lime-400 to-lime-600 relative overflow-hidden">
                        {/* Decorative Patterns */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
                        </div>
                    </div>
                    
                    <div className="px-8 pb-8 -mt-16 relative z-10 flex flex-col md:flex-row items-end gap-6">
                        <div className="relative group/photo">
                            <div className="w-32 h-32 rounded-[32px] border-[6px] border-white shadow-2xl overflow-hidden ring-1 ring-slate-100 bg-white">
                                {previewImage ? (
                                    <img src={previewImage} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover/photo:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                        <span className="text-4xl font-black">{user?.displayName?.charAt(0) || 'U'}</span>
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-slate-900 hover:bg-lime-500 text-white rounded-xl flex items-center justify-center shadow-xl cursor-pointer transition-all hover:scale-110 active:scale-95 border-[3px] border-white">
                                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={imageUploading} />
                                <RiCameraLine size={18} />
                            </label>
                        </div>
                        
                        <div className="flex-1 pb-2">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-slate-900">{userProfile?.displayName || user?.displayName}</h1>
                                <span className="px-3 py-1 bg-lime-50 text-lime-600 text-[10px] font-black rounded-full border border-lime-100 uppercase tracking-wider">
                                    {userProfile?.role || 'User'}
                                </span>
                            </div>
                            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                <RiMailLine className="text-slate-400" />
                                {user?.email}
                            </p>
                        </div>
                        
                        <div className="pb-2 hidden md:block">
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-bold bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                                <RiCalendarLine />
                                Joined {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Settings Card */}
                <div className="bg-white rounded-[40px] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Personal Details</h2>
                            <p className="text-slate-400 text-sm font-medium mt-0.5">Keep your account information up to date</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                            <RiEdit2Line size={24} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-10">
                        {/* Section 1: Identity */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-6 bg-lime-500 rounded-full"></div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Identity Information</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Display Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-lime-500 transition-colors">
                                            <RiUserLine size={20} />
                                        </div>
                                        <input
                                            {...register('displayName', { required: 'Name is required' })}
                                            placeholder="Enter your name"
                                            className="w-full h-14 pl-12 pr-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Phone Number</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-lime-500 transition-colors">
                                            <RiPhoneLine size={20} />
                                        </div>
                                        <input
                                            {...register('phoneNumber', { required: 'Phone is required' })}
                                            placeholder="017XXXXXXXX"
                                            className="w-full h-14 pl-12 pr-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Address */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-6 bg-lime-500 rounded-full"></div>
                                <h3 className="font-black text-slate-900 uppercase tracking-widest text-[11px]">Location & Delivery</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 ml-1">Division</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <RiGlobalLine size={20} />
                                        </div>
                                        <select
                                            {...register('division', { required: 'Division is required' })}
                                            onChange={(e) => {
                                                register('division').onChange(e);
                                                setValue('district', ''); 
                                            }}
                                            className="w-full h-14 pl-12 pr-10 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 transition-all outline-none font-bold text-slate-700 appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                                        >
                                            <option value="">Select Division</option>
                                            {divisions.map(div => (
                                                <option key={div} value={div}>{div}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700 ml-1">District</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                                            <RiBuildingLine size={20} />
                                        </div>
                                        <select
                                            {...register('district', { required: 'District is required' })}
                                            disabled={!selectedDivision || districtsLoading}
                                            className="w-full h-14 pl-12 pr-10 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 transition-all outline-none font-bold text-slate-700 appearance-none disabled:opacity-50 disabled:cursor-not-allowed bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%20stroke%3D%22currentColor%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%20%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                                        >
                                            <option value="">{districtsLoading ? 'Loading...' : 'Select District'}</option>
                                            {districts.map(dist => (
                                                <option key={dist} value={dist}>{dist}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 ml-1">Full Address</label>
                                <div className="relative group">
                                    <div className="absolute top-4 left-4 pointer-events-none text-slate-400 group-focus-within:text-lime-500 transition-colors">
                                        <RiHome4Line size={20} />
                                    </div>
                                    <textarea
                                        {...register('address', { required: 'Address is required' })}
                                        placeholder="House no, Street name, Village..."
                                        rows={3}
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-lime-500/5 focus:border-lime-500 transition-all outline-none font-bold text-slate-700 placeholder:text-slate-300 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 flex flex-col md:flex-row items-center justify-end gap-4 border-t border-slate-100 mt-10">
                            <button
                                type="button"
                                onClick={() => reset()}
                                className="w-full md:w-auto px-10 h-14 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-2xl font-black transition-all active:scale-95"
                            >
                                Reset Form
                            </button>
                            <button
                                type="submit"
                                disabled={mutation.isPending || !isDirty}
                                className="w-full md:w-auto px-10 h-14 bg-slate-900 hover:bg-lime-500 disabled:bg-slate-200 text-white rounded-2xl font-black shadow-xl shadow-slate-900/10 transition-all flex items-center justify-center gap-3 active:scale-95 group/btn"
                            >
                                {mutation.isPending ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    <RiCheckboxCircleLine size={22} className="group-hover/btn:scale-125 transition-transform" />
                                )}
                                {mutation.isPending ? 'Updating Profile...' : 'Save All Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Sidebar */}
            <div className="space-y-8">
                {/* Status Card */}
                <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black text-lg">Account Status</h3>
                            <div className="w-3 h-3 rounded-full bg-lime-400 animate-pulse ring-4 ring-lime-400/20"></div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-3">
                                    <RiMailLine className="text-lime-400" />
                                    <span className="text-sm font-bold text-white/70">Email</span>
                                </div>
                                <span className="text-xs font-black uppercase text-lime-400">Verified</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                                <div className="flex items-center gap-3">
                                    <RiShieldCheckLine className="text-lime-400" />
                                    <span className="text-sm font-bold text-white/70">Security</span>
                                </div>
                                <span className="text-xs font-black uppercase text-lime-400">High</span>
                            </div>
                        </div>
                    </div>
                    {/* Decorative element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-lime-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                </div>

                {/* Support Banner */}
                <div className="bg-white rounded-[40px] border border-slate-200 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group hover:border-lime-500 transition-all duration-500">
                    <div className="relative z-10">
                        <div className="w-14 h-14 bg-lime-50 rounded-[20px] flex items-center justify-center text-lime-600 mb-6 group-hover:scale-110 transition-transform duration-500">
                            <RiCustomerService2Line size={28} />
                        </div>
                        <h4 className="text-xl font-black text-slate-900">Need Assistance?</h4>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mt-3">Our 24/7 dedicated support team is ready to help you with any issues.</p>
                        <button className="mt-8 w-full h-12 bg-slate-50 hover:bg-lime-500 hover:text-white text-slate-900 rounded-xl font-black transition-all flex items-center justify-center gap-2 group/btn">
                            Get Help Now
                            <RiArrowRightSLine size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Account Settings Shortcut */}
                <div className="bg-slate-50 rounded-[40px] p-4 flex flex-col gap-2">
                    <button className="flex items-center justify-between p-4 hover:bg-white rounded-[24px] transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm group-hover:text-lime-500 transition-colors">
                                <RiShieldCheckLine size={20} />
                            </div>
                            <span className="font-bold text-slate-700">Security Privacy</span>
                        </div>
                        <RiArrowRightSLine className="text-slate-300 group-hover:text-lime-500" />
                    </button>
                    <button className="flex items-center justify-between p-4 hover:bg-white rounded-[24px] transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm group-hover:text-lime-500 transition-colors">
                                <RiBuildingLine size={20} />
                            </div>
                            <span className="font-bold text-slate-700">Company Info</span>
                        </div>
                        <RiArrowRightSLine className="text-slate-300 group-hover:text-lime-500" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileSettings;