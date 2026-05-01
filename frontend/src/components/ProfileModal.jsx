import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import useImageUpload from '../hooks/useImageUpload';
import useAuth from '../hooks/useAuth';

/**
 * Profile Modal Component
 * Displays user profile form with image upload
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Callback to close modal
 * @param {string} props.userName - Current user's display name
 * @param {string} props.userEmail - Current user's email
 * @param {string} props.currentProfileImage - Current profile image URL
 * @param {boolean} props.isLoading - Loading state
 */
const ProfileModal = ({
    isOpen,
    onClose,
    userName,
    userEmail,
    currentProfileImage,
    isLoading = false
}) => {
    const { updateUserProfilePhoto, updateUserDisplayName } = useAuth();
    const { register, handleSubmit, formState: { errors }, setValue, getValues } = useForm({
        defaultValues: {
            name: userName || '',
            email: userEmail || '',
            profileImage: null
        }
    });

    const { uploadImage, uploading } = useImageUpload();
    const [imagePreview, setImagePreview] = useState(currentProfileImage);
    const [isSaving, setIsSaving] = useState(false);

    // Update form when user data changes
    useEffect(() => {
        if (isOpen) {
            setValue('name', userName || '');
            setValue('email', userEmail || '');
            setImagePreview(currentProfileImage);
        }
    }, [isOpen, userName, userEmail, currentProfileImage, setValue]);

    // Handle image preview
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Handle form submission
    const onSubmit = async () => {
        try {
            setIsSaving(true);
            const formValues = getValues();
            let finalImageUrl = currentProfileImage;

            // Upload image if a new one was selected
            const imageInput = document.querySelector('input[name="profileImage"]');
            if (imageInput?.files?.[0]) {
                try {
                    finalImageUrl = await uploadImage(imageInput.files[0]);
                    toast.success('Image uploaded successfully!');
                } catch (error) {
                    toast.error(error.message || 'Failed to upload image');
                    setIsSaving(false);
                    return;
                }
            }

            // Update Firebase user profile with photo URL
            if (finalImageUrl) {
                try {
                    await updateUserProfilePhoto(finalImageUrl);
                    toast.success('Profile photo updated successfully!');
                } catch (error) {
                    toast.error(error.message || 'Failed to update profile photo');
                    setIsSaving(false);
                    return;
                }
            }

            // Update Firebase user display name
            if (formValues.name && formValues.name.trim()) {
                try {
                    await updateUserDisplayName(formValues.name.trim());
                    toast.success('Display name updated successfully!');
                } catch (error) {
                    toast.error(error.message || 'Failed to update display name');
                    setIsSaving(false);
                    return;
                }
            }

            toast.success('Profile updated successfully!');
            onClose();
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error(error.message || 'Failed to save profile');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle ESC key
    useEffect(() => {
        if (!isOpen) return;

        const handleEscKey = (e) => {
            if (e.key === 'Escape' && !isSaving && !uploading) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [isOpen, isSaving, uploading, onClose]);

    // Handle backdrop click
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isSaving && !uploading) {
            onClose();
        }
    };

    if (!isOpen) return null;

    const isProcessing = isSaving || uploading || isLoading;

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
            onClick={handleBackdropClick}
        >
            {/* Modal Container */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 transform transition-all duration-300 scale-100 animate-in fade-in">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
                    <button
                        onClick={onClose}
                        disabled={isProcessing}
                        className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed active:scale-90"
                    >
                        <FiX className="text-2xl" />
                    </button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Profile Image Upload Section */}
                    <div className="flex flex-col items-center gap-4">
                        {/* Image Preview */}
                        <div className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Profile preview"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <FiUpload className="text-gray-400 text-2xl" />
                            )}
                        </div>

                        {/* Upload Input */}
                        <label className="cursor-pointer">
                            <input
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                onChange={handleImageChange}
                                disabled={isProcessing}
                                className="hidden"
                                name="profileImage"
                            />
                            <span
                                className={`inline-block px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 ${
                                    isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                }`}
                            >
                                {uploading ? 'Uploading...' : 'Change Image'}
                            </span>
                        </label>

                        <p className="text-xs text-gray-500 text-center">
                            Max 2MB • JPG, PNG, JPEG, WebP
                        </p>
                    </div>

                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Name
                        </label>
                        <input
                            type="text"
                            {...register('name', {
                                required: 'Name is required',
                                minLength: { value: 2, message: 'Name must be at least 2 characters' }
                            })}
                            disabled={isProcessing}
                            className={`w-full px-4 py-2.5 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter your name"
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Email Field (Read-only) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            {...register('email')}
                            disabled
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Email cannot be changed
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isProcessing}
                            className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isProcessing}
                            className="px-5 py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2 min-w-max"
                        >
                            {isProcessing ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfileModal;
