/**
 * uploadHelper.js
 * Utility functions for verifying and sanitizing photo URLs or base64 uploads.
 */

const sanitizeImageUrl = (url, fallbackUrl = "") => {
    if (!url || typeof url !== 'string') return fallbackUrl;
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("data:image/")) {
        return trimmed;
    }
    return fallbackUrl;
};

const isValidImageExt = (filename) => {
    if (!filename) return false;
    const ext = filename.split('.').pop().toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);
};

module.exports = {
    sanitizeImageUrl,
    isValidImageExt
};
