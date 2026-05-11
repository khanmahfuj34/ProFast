import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import AOS from 'aos';
import 'aos/dist/aos.css';

const AdminDashboard = () => {
    const { user, isAdmin } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50 });
        if (!isAdmin) {
            navigate('/');
        } else {
            fetchStats();
        }
    }, [isAdmin, navigate]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axiosSecure.get('/admin/stats');
            if (response.data.success) {
                setStats(response.data.stats);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError('Failed to load statistics');
            setStats(null);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, icon, bgColor }) => (
        <div
            data-aos="zoom-in"
            className={`${bgColor} rounded-xl shadow-lg p-6 text-white flex items-center gap-4 hover:shadow-2xl transition-all duration-300 border border-slate-600/30`}
        >
            <div className="text-4xl">{icon}</div>
            <div>
                <p className="text-sm font-semibold opacity-90">{title}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
            </div>
        </div>
    );

    if (!isAdmin) return null;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-2">
                    Welcome back, {user?.displayName || 'Admin'}!
                </h1>
                <p className="text-slate-400">Here's what's happening with your business today</p>
            </div>

                {loading && (
                    <div className="flex justify-center items-center py-20">
                    <span className="loading loading-spinner loading-lg text-emerald-500"></span>
                </div>
            )}

            {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg p-4 mb-8">
                    <p className="font-semibold">⚠️ {error}</p>
                </div>
            )}

            {stats && (
                <>
                    {/* Main Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatCard
                            title="Total Users"
                            value={stats.totalUsers}
                            icon="👥"
                            bgColor="bg-gradient-to-br from-blue-600 to-blue-700"
                        />
                        <StatCard
                            title="Total Riders"
                            value={stats.totalRiders}
                            icon="🏍️"
                            bgColor="bg-gradient-to-br from-orange-600 to-orange-700"
                        />
                        <StatCard
                            title="Total Parcels"
                            value={stats.totalParcels}
                            icon="📦"
                            bgColor="bg-gradient-to-br from-emerald-600 to-emerald-700"
                        />
                    </div>

                    {/* Payment Stats */}
                    <div
                        data-aos="fade-up"
                        className="bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-600/50 rounded-xl shadow-lg p-6 mb-8 text-white flex items-center justify-between hover:shadow-2xl transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">💳</div>
                            <div>
                                <p className="text-sm font-semibold opacity-90">Payment Transactions</p>
                                <p className="text-lg font-bold mt-1">Tracking real-time payments</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/admin/payments-history')}
                            className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/50 text-white font-semibold rounded-lg transition-all"
                        >
                            View All →
                        </button>
                    </div>

                    {/* Rider Status Breakdown */}
                    <div
                        data-aos="fade-up"
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg p-6 mb-8"
                    >
                        <h2 className="text-2xl font-bold text-white mb-6">📋 Rider Applications</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-slate-700/50 border border-amber-500/30 rounded-lg p-6">
                                <p className="text-sm font-semibold text-amber-300">Pending Review</p>
                                <p className="text-3xl font-bold text-amber-400 mt-2">{stats.riderStats.pending}</p>
                            </div>
                            <div className="bg-slate-700/50 border border-emerald-500/30 rounded-lg p-6">
                                <p className="text-sm font-semibold text-emerald-300">Approved</p>
                                <p className="text-3xl font-bold text-emerald-400 mt-2">{stats.riderStats.approved}</p>
                            </div>
                            <div className="bg-slate-700/50 border border-red-500/30 rounded-lg p-6">
                                <p className="text-sm font-semibold text-red-300">Rejected</p>
                                <p className="text-3xl font-bold text-red-400 mt-2">{stats.riderStats.rejected}</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div data-aos="fade-up" className="bg-slate-800/50 border border-slate-700/50 rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-white mb-6">⚙️ Management Tools</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <button
                                onClick={() => navigate('/admin/approve-riders')}
                                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 hover:shadow-lg hover:shadow-orange-500/50 text-white font-semibold rounded-lg transition-all"
                            >
                                🏍️ Approve Riders
                            </button>
                            <button
                                onClick={() => navigate('/admin/users')}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-lg hover:shadow-blue-500/50 text-white font-semibold rounded-lg transition-all"
                            >
                                👥 Manage Users
                            </button>
                            <button
                                onClick={() => navigate('/admin/parcels')}
                                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:shadow-lg hover:shadow-emerald-500/50 text-white font-semibold rounded-lg transition-all"
                            >
                                📦 View Parcels
                            </button>
                            <button
                                onClick={() => navigate('/admin/payments-history')}
                                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:shadow-lg hover:shadow-teal-500/50 text-white font-semibold rounded-lg transition-all"
                            >
                                💳 Payment History
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdminDashboard;
