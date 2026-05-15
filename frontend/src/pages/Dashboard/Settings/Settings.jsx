import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { RiUserSettingsLine, RiLockPasswordLine, RiNotification3Line } from 'react-icons/ri';

const Settings = () => {
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Settings</h1>
                    <p className="text-slate-500 mt-1">Manage your profile, security, and notification preferences.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Settings Navigation */}
                <aside className="lg:col-span-1">
                    <nav className="flex flex-col space-y-1 bg-white/50 backdrop-blur-md p-2 rounded-2xl border border-slate-200 shadow-sm">
                        <NavLink
                            to="/dashboard/settings"
                            end
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    isActive
                                        ? 'bg-lime-500 text-white shadow-lg shadow-lime-500/30 font-bold'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`
                            }
                        >
                            <RiUserSettingsLine className="w-5 h-5" />
                            <span>Profile Settings</span>
                        </NavLink>
                        
                        <button
                            disabled
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed group relative"
                        >
                            <RiLockPasswordLine className="w-5 h-5" />
                            <span>Security</span>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">SOON</span>
                        </button>

                        <button
                            disabled
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 cursor-not-allowed group relative"
                        >
                            <RiNotification3Line className="w-5 h-5" />
                            <span>Notifications</span>
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">SOON</span>
                        </button>
                    </nav>
                </aside>

                {/* Settings Content */}
                <main className="lg:col-span-3">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[600px]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Settings;