import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ManageUsers = () => {
    const { isAdmin } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50 });
        if (!isAdmin) {
            navigate('/');
        } else {
            fetchUsers();
        }
    }, [isAdmin, navigate]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosSecure.get('/users');
            if (response.data.success) {
                setUsers(response.data.users);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError('Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId, userEmail, newRole) => {
        try {
            const response = await axiosSecure.patch('/user/role', {
                userId,
                email: userEmail,
                role: newRole
            });
            if (response.data.success) {
                fetchUsers();
            }
        } catch (err) {
            console.error('Error updating user role:', err);
            setError('Failed to update user role');
        }
    };

    const deleteUser = async (userId, userEmail) => {
        if (confirm(`Are you sure you want to delete ${userEmail}?`)) {
            try {
                const response = await axiosSecure.delete(`/user/${userId}`);
                if (response.data.success) {
                    fetchUsers();
                }
            } catch (err) {
                console.error('Error deleting user:', err);
                setError('Failed to delete user');
            }
        }
    };

    if (!isAdmin) return null;

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500 mb-2">
                    👥 Manage Users
                </h1>
                <p className="text-slate-400">View and manage all system users</p>
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

            {!loading && users.length === 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
                    <p className="text-slate-400 text-lg">No users found</p>
                </div>
            )}

            {!loading && users.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-700">
                                    <th className="px-6 py-4 text-left text-base-100 font-bold">Email</th>
                                    <th className="px-6 py-4 text-left text-base-100 font-bold">Name</th>
                                    <th className="px-6 py-4 text-left text-base-100 font-bold">Role</th>
                                    <th className="px-6 py-4 text-left text-base-100 font-bold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {users.map((user) => (
                                    <tr key={user._id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 text-slate-300">{user.email}</td>
                                        <td className="px-6 py-4 text-slate-300">{user.displayName}</td>
                                        <td className="px-6 py-4">
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => updateUserRole(user._id, user.email, e.target.value)}
                                                className="px-3 py-1.5 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-sm font-medium hover:border-slate-500 transition-colors"
                                            >
                                                <option value="user">User</option>
                                                <option value="rider">Rider</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => deleteUser(user._id, user.email)} 
                                                className="px-4 py-1.5 bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 rounded-lg font-medium text-sm transition-all"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;