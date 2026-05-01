import { useState } from 'react';
import axios from 'axios';

const IMGBB_API_KEY = 'b5c23dbb416dbbdccf9fcce606fc2d81';
const IMGBB_API_URL = 'https://api.imgbb.com/1/upload';
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes
const ALLOWED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Hook for uploading images to imgbb
 * @returns {Object} { uploadImage, uploading, error }
 */
export const useImageUpload = () => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const validateFile = (file) => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
            throw new Error(`File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        }

        // Check file format
        if (!ALLOWED_FORMATS.includes(file.type)) {
            throw new Error('Invalid file format. Allowed formats: JPG, PNG, JPEG, WebP');
        }

        return true;
    };

    const uploadImage = async (file) => {
        try {
            setError(null);
            setUploading(true);

            // Validate file
            validateFile(file);

            // Create FormData
            const formData = new FormData();
            formData.append('image', file);
            formData.append('key', IMGBB_API_KEY);

            // Upload to imgbb
            const response = await axios.post(IMGBB_API_URL, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Extract and return image URL
            if (response.data.success) {
                const imageUrl = response.data.data.url;
                console.log('✅ Image uploaded successfully:', imageUrl);
                return imageUrl;
            } else {
                throw new Error(response.data.error?.message || 'Failed to upload image');
            }
        } catch (err) {
            const errorMessage = err.message || 'Failed to upload image';
            setError(errorMessage);
            console.error('❌ Image upload error:', errorMessage);
            throw new Error(errorMessage);
        } finally {
            setUploading(false);
        }
    };

    return { uploadImage, uploading, error };
};

export default useImageUpload;
