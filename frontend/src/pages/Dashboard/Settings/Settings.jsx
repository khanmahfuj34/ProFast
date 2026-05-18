import React from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { RiUserSettingsLine, RiLockPasswordLine, RiNotification3Line } from 'react-icons/ri';
import useAuth from '../../../hooks/useAuth';

const Settings = () => {
    const { userProfile, loading } = useAuth();

    if (loading) return null;

    if (userProfile?.role === 'rider') {
        return <Navigate to="/dashboard/rider/settings" replace />;
    }

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-lime-50 rounded-2xl flex items-center justify-center text-lime-600 shadow-sm border border-lime-100">
                            <RiUserSettingsLine size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 leading-tight">Settings</h1>
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                <span>Dashboard</span>
                                <span className="text-slate-300">/</span>
                                <span className="text-lime-600">Settings</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Settings Navigation Sidebar */}
                    <aside className="lg:col-span-2">
                        <nav className="sticky top-28 flex flex-col space-y-1 bg-white rounded-3xl p-3 border border-slate-200 shadow-sm">
                            <NavLink
                                to="/dashboard/settings"
                                end
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm ${
                                        isActive
                                            ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/40'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`
                                }
                            >
                                <RiUserSettingsLine className="w-5 h-5" />
                                <span>Profile Settings</span>
                            </NavLink>
                            
                            <NavLink
                                to="/dashboard/settings/security"
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm ${
                                        isActive
                                            ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/40'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`
                                }
                            >
                                <RiLockPasswordLine className="w-5 h-5" />
                                <span>Security</span>
                            </NavLink>

                            <NavLink
                                to="/dashboard/settings/notifications"
                                className={({ isActive }) =>
                                    `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold text-sm ${
                                        isActive
                                            ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/40'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`
                                }
                            >
                                <RiNotification3Line className="w-5 h-5" />
                                <span>Notifications</span>
                            </NavLink>
                        </nav>
                    </aside>

                    {/* Settings Content */}
                    <main className="lg:col-span-10">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Settings;