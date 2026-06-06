import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import ProFastLogo from '../ProFastLogo/ProFastLogo';
import useAuth from '../../../../hooks/useAuth';
import useLogout from '../../../../hooks/useLogout';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { useNotifications } from '../../../../contexts/NotificationContext';
import LogoutConfirmModal from '../../../../components/LogoutConfirmModal';
import ProfileDropdown from '../../../../components/ProfileDropdown';
import ProfileModal from '../../../../components/ProfileModal';
import ThemeToggle from '../../../../components/ThemeToggle';

const Navbar = () => {
    const { user, userProfile, loading, tokenReady } = useAuth();
    const { unreadCount } = useNotifications();
    const { handleLogout, isLoading: isLoggingOut } = useLogout();
    const axiosSecure = useAxiosSecure();

    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [hasRiderApplication, setHasRiderApplication] = useState(false);
    const [checkingRiderStatus, setCheckingRiderStatus] = useState(false);
    const fetchedRiderStatusRef = useRef(false);

    const checkRiderApplicationStatus = useCallback(async () => {
        // Don't check if backend is down or if we already checked for this session
        if (!user?.email || fetchedRiderStatusRef.current) return;

        try {
            setCheckingRiderStatus(true);
            const response = await axiosSecure.get(`/riders/${user.email}`);

            if (response.data.success && response.data.rider) {
                setHasRiderApplication(true);
            }
            fetchedRiderStatusRef.current = true;
        } catch (error) {
            if (error.response?.status === 404) {
                setHasRiderApplication(false);
                fetchedRiderStatusRef.current = true;
            }
        } finally {
            setCheckingRiderStatus(false);
        }
    }, [user?.email, axiosSecure]);

    useEffect(() => {
        // Reset fetch ref when user changes
        fetchedRiderStatusRef.current = false;
    }, [user?.email]);

    useEffect(() => {
        // Wait for both token AND userProfile to be ready
        // This prevents the race condition where tokenReady is true but userProfile is still loading
        if (user?.email && tokenReady && userProfile && !checkingRiderStatus && !fetchedRiderStatusRef.current) {
            if (userProfile.role !== 'admin') {
                checkRiderApplicationStatus();
            } else {
                // If admin, they don't apply for riders, so mark as "checked" to stop further attempts
                fetchedRiderStatusRef.current = true;
            }
        }
    }, [user?.email, tokenReady, userProfile, checkingRiderStatus, checkRiderApplicationStatus]);

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

    // ✅ Modern Active Nav Style
    const navLinkClass = ({ isActive }) =>
        `relative px-4 py-2 text-[15px] font-medium rounded-xl transition-all duration-300 whitespace-nowrap
        ${
            isActive
                ? 'text-lime-600 bg-lime-50 shadow-sm'
                : 'text-gray-700 hover:text-lime-600 hover:bg-lime-50'
        }`;

    // ✅ Public Navigation
    const publicNavItems = (
        <>
            <li><NavLink to="/" className={navLinkClass}>Home</NavLink></li>
            <li><NavLink to="/service" className={navLinkClass}>Service</NavLink></li>
            <li><NavLink to="/coverage" className={navLinkClass}>Coverage</NavLink></li>
            <li><NavLink to="/about" className={navLinkClass}>About Us</NavLink></li>
            <li><NavLink to="/pricing" className={navLinkClass}>Pricing</NavLink></li>
        </>
    );

    // ✅ User Navigation
    const userNavItems = (
        <>
            {publicNavItems}
            <li><NavLink to="/send-parcel" className={navLinkClass}>Send Parcel</NavLink></li>
           
            <li>
                <NavLink to="/dashboard" className={navLinkClass}>
                    {userProfile?.role === 'rider' ? 'Rider Dashboard' : 'My Parcels'}
                </NavLink>
            </li>
             <li>
                <NavLink
                    to={hasRiderApplication ? "/be-rider-status" : "/be-rider"}
                    className={({ isActive }) =>
                        `px-4 py-2 rounded-xl text-[15px] font-semibold transition-all duration-300 whitespace-nowrap
                        ${isActive ? 'bg-lime-100 text-lime-700 shadow-sm' : 'bg-lime-50 text-lime-600 hover:bg-lime-100'}`
                    }
                >
                    {hasRiderApplication ? 'Rider Status' : 'Be a Rider'}
                </NavLink>
            </li>
        </>
    );

    // ✅ Admin Navigation
    const adminNavItems = (
        <>
            {publicNavItems}
            <li>
                <NavLink to="/admin" className="btn btn-sm bg-red-500 hover:bg-red-600 hover:scale-105 text-white border-none rounded-2xl transition-all duration-300 shadow-md">
                    Admin Panel
                </NavLink>
            </li>
            <li><NavLink to="/admin/approve-riders" className={navLinkClass}>Approve Riders</NavLink></li>
            <li><NavLink to="/admin/users" className={navLinkClass}>Manage Users</NavLink></li>
        </>
    );

    const navItems = user
        ? userProfile?.role === 'admin'
            ? adminNavItems
            : userNavItems
        : publicNavItems;

    return (
        <>
            <nav className="w-full sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 h-[76px] flex items-center justify-between relative">

                    {/* Left Logo & Mobile Menu */}
                    <div className="flex items-center gap-2">
                        <div className="dropdown lg:hidden">
                            <div tabIndex={0} role="button" className="btn btn-ghost p-0 mr-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
                                </svg>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-4 z-[100] p-3 shadow-xl bg-white rounded-2xl w-64 border border-gray-100 space-y-2">
                                {navItems}
                            </ul>
                        </div>
                        <ProFastLogo />
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
                        <ul className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                            {navItems}
                        </ul>
                    </div>

                    {/* Right Side: Profile/Auth */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {loading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : user ? (
                            <div className="flex items-center gap-3">
                                {/* User Info */}
                                <div className="hidden sm:flex flex-col items-end bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                                    <p className="text-sm font-semibold text-gray-800 leading-tight">
                                        {user.displayName || user.email?.split('@')[0]}
                                    </p>
                                    <p className="text-[10px] uppercase font-bold tracking-wider leading-tight">
                                        {userProfile?.role === 'admin' ? (
                                            <span className="text-red-500">Admin</span>
                                        ) : userProfile?.role === 'rider' ? (
                                            <span className="text-blue-500">Rider</span>
                                        ) : (
                                            <span className="text-gray-500">User</span>
                                        )}
                                    </p>
                                </div>

                                <ProfileDropdown
                                    profileImage={user.photoURL}
                                    userName={user.displayName || user.email?.split('@')[0]}
                                    onMyProfile={handleMyProfileClick}
                                    onLogout={handleLogoutClick}
                                />
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <a href="/auth/register" className="btn btn-sm btn-outline border-gray-300 hover:border-lime-500 hover:bg-lime-50 hover:text-lime-600 rounded-2xl transition-all duration-300">
                                    Sign Up
                                </a>
                                <a href="/auth/login" className="btn btn-sm bg-lime-500 hover:bg-lime-600 text-white border-none rounded-2xl transition-all duration-300 hover:scale-105 shadow-md">
                                    Sign In
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <LogoutConfirmModal
                isOpen={showLogoutModal}
                onConfirm={handleConfirmLogout}
                onCancel={handleCancelLogout}
                isLoading={isLoggingOut}
            />

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