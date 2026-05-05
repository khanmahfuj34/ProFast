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
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">👥 Manage Users</h1>

                {loading && (
                    <div className="flex justify-center items-center py-20">
                        <span className="loading loading-spinner loading-lg text-blue-600"></span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mb-8">
                        <span>{error}</span>
                    </div>
                )}

                {!loading && users.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No users found</p>
                    </div>
                )}

                {!loading && users.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td>{user.email}</td>
                                        <td>{user.displayName}</td>
                                        <td>
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => updateUserRole(user._id, user.email, e.target.value)}
                                                className="select select-sm"
                                            >
                                                <option value="user">User</option>
                                                <option value="rider">Rider</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => deleteUser(user._id, user.email)} 
                                                className="btn btn-sm btn-error"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;