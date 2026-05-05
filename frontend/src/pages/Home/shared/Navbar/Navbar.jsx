import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import ProFastLogo from '../ProFastLogo/ProFastLogo';
import useAuth from '../../../../hooks/useAuth';
import useLogout from '../../../../hooks/useLogout';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import LogoutConfirmModal from '../../../../components/LogoutConfirmModal';
import ProfileDropdown from '../../../../components/ProfileDropdown';
import ProfileModal from '../../../../components/ProfileModal';

/**
 * Navbar Component
 * Dynamically displays menu items based on user authentication and role
 * 
 * Public Navigation (Unauthenticated):
 * - Home, Service, Coverage, Pricing, About Us, Sign In
 * 
 * User Navigation (Authenticated - User role):
 * - All public items + Send Parcel, Be a Rider, My Parcels, Profile
 * 
 * Admin Navigation (Authenticated - Admin role):
 * - All user items + Approve Riders, Manage Users dashboards
 */
const Navbar = () => {
    const { user, loading } = useAuth();
    const { handleLogout, isLoading: isLoggingOut } = useLogout();
    const axiosSecure = useAxiosSecure();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [hasRiderApplication, setHasRiderApplication] = useState(false);
    const [checkingRiderStatus, setCheckingRiderStatus] = useState(false);

    // Check if user has a rider application when user loads
    useEffect(() => {
        if (user?.email && !checkingRiderStatus) {
            checkRiderApplicationStatus();
        }
    }, [user?.email]);

    const checkRiderApplicationStatus = async () => {
        try {
            setCheckingRiderStatus(true);
            const response = await axiosSecure.get(`/riders/${user.email}`);
            
            if (response.data.success && response.data.rider) {
                setHasRiderApplication(true);
            } else {
                setHasRiderApplication(false);
            }
        } catch (error) {
            // 404 means no application found
            if (error.response?.status === 404) {
                setHasRiderApplication(false);
            }
        } finally {
            setCheckingRiderStatus(false);
        }
    };

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

    // ✅ Public navigation items (accessible to all)
    const publicNavItems = <>
        <li><NavLink to="/" className="text-gray-700 hover:text-lime-600 transition-colors duration-200">Home</NavLink></li>
        <li><NavLink to="/service" className="text-gray-700 hover:text-lime-600 transition-colors duration-200">Service</NavLink></li>
        <li><NavLink to="/coverage" className="text-gray-700 hover:text-lime-600 transition-colors duration-200">Coverage</NavLink></li>
        <li><NavLink to="/about" className="text-gray-700 hover:text-lime-600 transition-colors duration-200">About Us</NavLink></li>
        <li><NavLink to="/pricing" className="text-gray-700 hover:text-lime-600 transition-colors duration-200">Pricing</NavLink></li>
    </>;

    // ✅ User-specific navigation items (authenticated users)
    const userNavItems = <>
        {publicNavItems}
        <li><NavLink to="/send-parcel" className="text-gray-700 hover:text-lime-600 transition-colors duration-200">Send Parcel</NavLink></li>
        <li>
            <NavLink 
                to={hasRiderApplication ? "/be-rider-status" : "/be-rider"} 
                className="btn btn-sm bg-lime-500 hover:bg-lime-600 text-white border-none rounded-xl transition-all duration-200 ml-3"
            >
                {hasRiderApplication ? '🏍️ Rider Status' : 'Be a Rider'}
            </NavLink>
        </li>   
        <li><NavLink to="/dashboard/my-parcels" className="text-gray-700 hover:text-lime-600 transition-colors duration-200">My Parcels</NavLink></li>
    </>;

    // ✅ Admin-specific navigation items
    const adminNavItems = <>
        {userNavItems}
        <li className="divider my-2">Admin Panel</li>
        <li><NavLink to="/dashboard/ApproveRiders" className="text-blue-700 hover:text-blue-900 transition-colors duration-200 font-semibold">👮 Approve Riders</NavLink></li>
        <li><NavLink to="/dashboard/ManageUsers" className="text-blue-700 hover:text-blue-900 transition-colors duration-200 font-semibold">👥 Manage Users</NavLink></li>
    </>;

    // ✅ Select correct navigation based on user role
    const navItems = user ? (user.role === 'admin' ? adminNavItems : userNavItems) : publicNavItems;

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
                    <ProFastLogo></ProFastLogo>
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
                                {/* Role badge */}
                                <p className="text-xs text-base-100 font-medium">
                                    {user.role === 'admin' ? (
                                        <span className="badge badge-error">👑 Admin</span>
                                    ) : user.role === 'rider' ? (
                                        <span className="badge badge-info">🏍️ Rider</span>
                                    ) : (
                                        <span className="badge badge-outline">👤 User</span>
                                    )}
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
                            <a href="/auth/register"
                                className="btn btn-sm btn-outline border-lime-500 text-lime-600 hover:bg-lime-50 rounded-xl transition-all duration-200">
                                Sign Up
                            </a>
                            <a href="/auth/login"
                                className="btn btn-sm bg-lime-500 hover:bg-lime-600 text-white border-none rounded-xl transition-all duration-200">
                                Sign In
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