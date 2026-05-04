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
            className={`${bgColor} rounded-2xl shadow-lg p-8 text-white flex items-center gap-4 hover:shadow-2xl transition-all duration-300`}
        >
            <div className="text-5xl">{icon}</div>
            <div>
                <p className="text-sm font-semibold opacity-90">{title}</p>
                <p className="text-4xl font-black">{value}</p>
            </div>
        </div>
    );

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div data-aos="fade-down" className="mb-12">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600 mb-2">
                        👑 Admin Dashboard
                    </h1>
                    <p className="text-xl text-gray-600">Welcome, {user?.displayName || 'Admin'}!</p>
                </div>

                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error shadow-lg mb-8" data-aos="fade-up">
                        <div>
                            <span>⚠️ {error}</span>
                        </div>
                    </div>
                )}

                {stats && (
                    <>
                        {/* Main Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                            <StatCard
                                title="Total Users"
                                value={stats.totalUsers}
                                icon="👥"
                                bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
                            />
                            <StatCard
                                title="Total Riders"
                                value={stats.totalRiders}
                                icon="🏍️"
                                bgColor="bg-gradient-to-r from-orange-500 to-orange-600"
                            />
                            <StatCard
                                title="Total Parcels"
                                value={stats.totalParcels}
                                icon="📦"
                                bgColor="bg-gradient-to-r from-green-500 to-green-600"
                            />
                        </div>

                        {/* Rider Status Breakdown */}
                        <div
                            data-aos="fade-up"
                            className="bg-white rounded-2xl shadow-lg p-8 mb-12 border-l-4 border-yellow-500"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Rider Applications Status</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-500">
                                    <p className="text-sm font-semibold text-yellow-800">Pending Review</p>
                                    <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.riderStats.pending}</p>
                                </div>
                                <div className="bg-green-50 rounded-lg p-6 border-l-4 border-green-500">
                                    <p className="text-sm font-semibold text-green-800">Approved</p>
                                    <p className="text-3xl font-bold text-green-600 mt-2">{stats.riderStats.approved}</p>
                                </div>
                                <div className="bg-red-50 rounded-lg p-6 border-l-4 border-red-500">
                                    <p className="text-sm font-semibold text-red-800">Rejected</p>
                                    <p className="text-3xl font-bold text-red-600 mt-2">{stats.riderStats.rejected}</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div data-aos="fade-up" className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-blue-600">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚙️ Management Tools</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button
                                    onClick={() => navigate('/admin/users')}
                                    className="btn btn-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-none w-full"
                                >
                                    👥 Manage Users
                                </button>
                                <button
                                    onClick={() => navigate('/admin/riders')}
                                    className="btn btn-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-none w-full"
                                >
                                    🏍️ Approve Riders
                                </button>
                                <button
                                    onClick={() => navigate('/admin/parcels')}
                                    className="btn btn-lg bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-none w-full"
                                >
                                    📦 View Parcels
                                </button>
                                <button
                                    onClick={fetchStats}
                                    className="btn btn-lg bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-none w-full"
                                >
                                    🔄 Refresh Stats
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
