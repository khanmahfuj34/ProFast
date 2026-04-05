import React, { useState, useRef, useEffect } from 'react';
import { FiUser, FiLogOut } from 'react-icons/fi';

/**
 * Profile Dropdown Component
 * Displays user profile icon with dropdown menu
 *
 * @param {Object} props - Component props
 * @param {string} props.profileImage - User's profile image URL
 * @param {string} props.userName - User's display name or email
 * @param {Function} props.onMyProfile - Callback when "My Profile" is clicked
 * @param {Function} props.onLogout - Callback when "Logout" is clicked
 */
const ProfileDropdown = ({ profileImage, userName, onMyProfile, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };

        const handleEscKey = (e) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            window.addEventListener('click', handleClickOutside);
            window.addEventListener('keydown', handleEscKey);
        }

        return () => {
            window.removeEventListener('click', handleClickOutside);
            window.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen]);

    const handleMyProfileClick = () => {
        setIsOpen(false);
        onMyProfile();
    };

    const handleLogoutClick = () => {
        setIsOpen(false);
        onLogout();
    };

    return (
        <div className="relative">
            {/* Profile Icon Button */}
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-200 active:scale-95 overflow-hidden cursor-pointer border border-gray-300"
                title={userName || 'Profile'}
            >
                {profileImage ? (
                    <img
                        src={profileImage}
                        alt={userName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <FiUser className="text-gray-600 text-lg" />
                )}
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 origin-top-right duration-200"
                >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                            {userName || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                            Profile
                        </p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        {/* My Profile */}
                        <button
                            onClick={handleMyProfileClick}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-700 hover:bg-gray-100 transition-colors duration-150 active:bg-gray-200"
                        >
                            <FiUser className="text-lg text-gray-600" />
                            <span className="text-sm font-medium">My Profile</span>
                        </button>

                        {/* Logout */}
                        <button
                            onClick={handleLogoutClick}
                            className="w-full px-4 py-2.5 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors duration-150 active:bg-red-100 border-t border-gray-100"
                        >
                            <FiLogOut className="text-lg" />
                            <span className="text-sm font-medium">Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropdown;
