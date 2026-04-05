import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import ProFastLogo from '../ProFastLogo/ProFastLogo';
import useAuth from '../../../../hooks/useAuth';
import useLogout from '../../../../hooks/useLogout';
import LogoutConfirmModal from '../../../../components/LogoutConfirmModal';
import ProfileDropdown from '../../../../components/ProfileDropdown';
import ProfileModal from '../../../../components/ProfileModal';

const Navbar = () => {
    const { user, loading } = useAuth();
    const { handleLogout, isLoading: isLoggingOut } = useLogout();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleConfirmLogout = async () => {
        await handleLogout();
        setShowLogoutModal(false);
    };

    const handleCancelLogout = () => {
        setShowLogoutModal(false);
    };

    const handleMyProfileClick = () => {
        setShowProfileModal(true);
    };

    const navItems = <>
        <li><NavLink to="/" className="text-gray-700 hover:text-lime-600 transition-colors duration-200">Home</NavLink></li>
        <li><NavLink to="/service" className="text-gray-700 hover:text-lime-600 transition-colors duration-200">Service</NavLink></li>
        <li><NavLink to="/coverage" className="text-gray-700 hover:text-lime-600 transition-colors duration-200">Coverage</NavLink></li>
        <li><NavLink to="/about" className="text-gray-700 hover:text-lime-600 transition-colors duration-200">About Us</NavLink></li>
        <li><NavLink to="/pricing" className="text-gray-700 hover:text-lime-600 transition-colors duration-200">Pricing</NavLink></li>
    </>

    return (
        <>
            <div className="w-full navbar bg-white shadow-sm">
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </div>
                        <ul
                            tabIndex="-1"
                            className="menu menu-sm dropdown-content bg-slate-800 rounded-box z-1 mt-3 w-52 p-2 shadow-xl">
                            {navItems}
                        </ul>
                    </div>
                    <a className="btn btn-ghost text-xl">
                        <ProFastLogo></ProFastLogo>
                    </a>
                </div>
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        {navItems}
                    </ul>
                </div>
                <div className="navbar-end gap-2">
                    {loading ? (
                        <span className="loading loading-spinner loading-sm"></span>
                    ) : user ? (
                        <>
                            {/* User Info */}
                            <div className="hidden sm:flex flex-col items-end mr-2">
                                <p className="text-sm font-semibold text-gray-800">
                                    {user.displayName || user.email?.split('@')[0]}
                                </p>
                            </div>

                            {/* Profile Dropdown */}
                            <ProfileDropdown
                                profileImage={user.photoURL}
                                userName={user.displayName || user.email?.split('@')[0]}
                                onMyProfile={handleMyProfileClick}
                                onLogout={handleLogoutClick}
                            />
                        </>
                    ) : (
                        <>
                            <a href="/auth/login"
                                className="btn btn-sm bg-lime-500 hover:bg-lime-600 text-white border-none rounded-xl transition-all duration-200">
                                Sing In
                            </a>
                            <a href="/"
                                className="btn btn-sm bg-lime-500 hover:bg-lime-600 text-white border-none transition-all duration-200 rounded-xl">
                                Be a Rider
                            </a>
                        </>
                    )}
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onConfirm={handleConfirmLogout}
                onCancel={handleCancelLogout}
                isLoading={isLoggingOut}
            />

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                userName={user?.displayName || user?.email?.split('@')[0] || ''}
                userEmail={user?.email || ''}
                currentProfileImage={user?.photoURL}
            />
        </>
    );
};

export default Navbar;