import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { RiCameraLine, RiUserLine, RiPhoneLine, RiMapPinLine, RiHome4Line, RiBuildingLine, RiMailLine, RiShieldCheckLine, RiCalendarLine } from 'react-icons/ri';
import useAuth from '../../../hooks/useAuth';
import useImageUpload from '../../../hooks/useImageUpload';

const ProfileSettings = () => {
    const { user, userProfile, updateProfileData } = useAuth();
    const { uploadImage, uploading: imageUploading } = useImageUpload();
    const [previewImage, setPreviewImage] = useState(userProfile?.photoURL || user?.photoURL || null);
    
    const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
        defaultValues: {
            displayName: userProfile?.displayName || user?.displayName || '',
            phoneNumber: userProfile?.phoneNumber || '',
            district: userProfile?.district || '',
            area: userProfile?.area || '',
            address: userProfile?.address || ''
        }
    });

    // Reset form when userProfile loads
    useEffect(() => {
        if (userProfile) {
            reset({
                displayName: userProfile.displayName || user?.displayName || '',
                phoneNumber: userProfile.phoneNumber || '',
                district: userProfile.district || '',
                area: userProfile.area || '',
                address: userProfile.address || ''
            });
            setPreviewImage(userProfile.photoURL || user?.photoURL || null);
        }
    }, [userProfile, user, reset]);

    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: updateProfileData,
        onMutate: async (newData) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['userProfile'] });

            // Snapshot the previous value
            const previousProfile = userProfile;

            // Optimistically update to the new value
            // (Since userProfile is in AuthContext state, we can't easily update it here without a setter,
            // but we can at least show we're following the pattern if it were in React Query)
            console.log('🚀 Optimistic update with:', newData);

            return { previousProfile };
        },
        onSuccess: (data) => {
            toast.success(data.message || 'Profile updated successfully!');
            // Invalidate and refetch
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
        onError: (error, newData, context) => {
            toast.error(error.message || 'Failed to update profile');
            // Rollback if needed (if it were in React Query)
        },
        onSettled: () => {
            // Always refetch after error or success to ensure we're in sync with server
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        }
    });

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show instant local preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);

        try {
            // Upload to storage
            const imageUrl = await uploadImage(file);
            // Update profile with new image URL immediately
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
        <div className="p-6 md:p-10 space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center gap-8 border-b border-slate-100 pb-10">
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-lime-500/20 group-hover:ring-lime-500/40 transition-all duration-300">
                        {previewImage ? (
                            <img src={previewImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400">
                                <RiUserLine size={48} />
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-1 right-1 w-10 h-10 bg-lime-500 hover:bg-lime-600 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer transition-transform hover:scale-110 active:scale-95 border-4 border-white">
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} disabled={imageUploading} />
                        {imageUploading ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <RiCameraLine size={20} />
                        )}
                    </label>
                </div>

                <div className="text-center md:text-left flex-1">
                    <h2 className="text-2xl font-bold text-slate-900">{userProfile?.displayName || user?.displayName}</h2>
                    <p className="text-slate-500 flex items-center justify-center md:justify-start gap-1.5 mt-1">
                        <RiMailLine size={16} />
                        {user?.email}
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200 flex items-center gap-1.5">
                            <RiShieldCheckLine size={14} className="text-lime-600" />
                            {userProfile?.role?.toUpperCase() || 'USER'}
                        </span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full border border-slate-200 flex items-center gap-1.5">
                            <RiCalendarLine size={14} className="text-blue-600" />
                            Joined {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
                        </span>
                        {user?.emailVerified && (
                            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200 flex items-center gap-1.5">
                                Verified
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    {/* Full Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <RiUserLine className="text-lime-600" />
                            Full Name
                        </label>
                        <input
                            {...register('displayName', { required: 'Name is required', minLength: { value: 2, message: 'Name too short' } })}
                            placeholder="e.g. John Doe"
                            className={`w-full px-4 py-3 bg-slate-50 border ${errors.displayName ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-lime-100'} rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all`}
                        />
                        {errors.displayName && <p className="text-xs text-red-500 font-medium">{errors.displayName.message}</p>}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <RiPhoneLine className="text-lime-600" />
                            Phone Number
                        </label>
                        <input
                            {...register('phoneNumber', { 
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^[0-9+]{11,15}$/,
                                    message: 'Invalid phone format (11-15 digits)'
                                }
                            })}
                            placeholder="e.g. 017XXXXXXXX"
                            className={`w-full px-4 py-3 bg-slate-50 border ${errors.phoneNumber ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-lime-100'} rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all`}
                        />
                        {errors.phoneNumber && <p className="text-xs text-red-500 font-medium">{errors.phoneNumber.message}</p>}
                    </div>

                    {/* Email (Readonly) */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-400 flex items-center gap-2">
                            <RiMailLine />
                            Email Address (Readonly)
                        </label>
                        <input
                            value={user?.email || ''}
                            readOnly
                            className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 cursor-not-allowed"
                        />
                    </div>

                    {/* District */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <RiBuildingLine className="text-lime-600" />
                            District
                        </label>
                        <input
                            {...register('district', { required: 'District is required' })}
                            placeholder="e.g. Dhaka"
                            className={`w-full px-4 py-3 bg-slate-50 border ${errors.district ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-lime-100'} rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all`}
                        />
                        {errors.district && <p className="text-xs text-red-500 font-medium">{errors.district.message}</p>}
                    </div>

                    {/* Area */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <RiMapPinLine className="text-lime-600" />
                            Area
                        </label>
                        <input
                            {...register('area', { required: 'Area is required' })}
                            placeholder="e.g. Dhanmondi"
                            className={`w-full px-4 py-3 bg-slate-50 border ${errors.area ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-lime-100'} rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all`}
                        />
                        {errors.area && <p className="text-xs text-red-500 font-medium">{errors.area.message}</p>}
                    </div>

                    {/* Full Address */}
                    <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <RiHome4Line className="text-lime-600" />
                            Full Address
                        </label>
                        <textarea
                            {...register('address', { required: 'Address is required' })}
                            placeholder="e.g. House 12, Road 5, Block A"
                            rows={3}
                            className={`w-full px-4 py-3 bg-slate-50 border ${errors.address ? 'border-red-400 focus:ring-red-100' : 'border-slate-200 focus:ring-lime-100'} rounded-2xl focus:outline-none focus:ring-4 focus:bg-white transition-all resize-none`}
                        />
                        {errors.address && <p className="text-xs text-red-500 font-medium">{errors.address.message}</p>}
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex flex-col sm:row items-center gap-4">
                    <button
                        type="submit"
                        disabled={mutation.isPending || !isDirty}
                        className={`w-full sm:w-auto px-10 py-4 bg-lime-500 hover:bg-lime-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black rounded-2xl shadow-lg shadow-lime-500/20 hover:shadow-lime-500/40 transition-all flex items-center justify-center gap-2 active:scale-95`}
                    >
                        {mutation.isPending ? (
                            <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Saving Changes...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                    {!isDirty && !mutation.isPending && (
                        <p className="text-xs text-slate-400 font-medium">No changes detected</p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default ProfileSettings;