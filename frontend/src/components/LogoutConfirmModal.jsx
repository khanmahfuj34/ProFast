import React, { useEffect } from 'react';
import { MdLogout } from 'react-icons/md';

/**
 * Modern Production-Level Logout Confirmation Modal
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onConfirm - Callback when user confirms logout
 * @param {Function} props.onCancel - Callback when user cancels
 * @param {boolean} props.isLoading - Loading state during logout
 */
const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel, isLoading }) => {
    // Handle ESC key to close modal
    useEffect(() => {
        if (!isOpen) return;

        const handleEscKey = (e) => {
            if (e.key === 'Escape' && !isLoading) {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleEscKey);
        return () => window.removeEventListener('keydown', handleEscKey);
    }, [isOpen, isLoading, onCancel]);

    // Handle outside click to close modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && !isLoading) {
            onCancel();
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-all duration-300"
            onClick={handleBackdropClick}
        >
            {/* Modal Container */}
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 transform transition-all duration-300 scale-100 animate-in fade-in">
                
                {/* Icon Section */}
                <div className="flex justify-center mb-6">
                    <div className="bg-red-100 rounded-full p-4 shadow-sm">
                        <MdLogout className="text-red-500 text-4xl" />
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Confirm Logout
                    </h3>
                </div>

                {/* Description */}
                <p className="text-gray-500 text-sm text-center mb-8 leading-relaxed">
                    Are you sure you want to log out? You'll need to sign in again to access your account.
                </p>

                {/* Actions */}
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                        Cancel
                    </button>
                    
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-5 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 flex items-center gap-2 min-w-max"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Logging out...</span>
                            </>
                        ) : (
                            <>
                                <MdLogout className="text-lg" />
                                <span>Logout</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmModal;
