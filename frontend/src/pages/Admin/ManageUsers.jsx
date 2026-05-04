import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAuth from '../../hooks/useAuth';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ManageUsers = () => {
    const { user, isAdmin } = useAuth();
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

    const handleRoleChange = async (userId, userEmail, newRole) => {
        if (userEmail === user?.email) {
            Swal.fire('Cannot modify your own role!', '', 'warning');
            return;
        }

        Swal.fire({
            title: 'Change User Role?',
            text: `Change ${userEmail} to ${newRole}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, change it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axiosSecure.patch('/user/role', {
                        email: userEmail,
                        role: newRole
                    });

                    if (response.data.success) {
                        setUsers(users.map(u =>
                            u._id === userId ? { ...u, role: newRole } : u
                        ));
                        Swal.fire('Success!', `User role updated to ${newRole}`, 'success');
                    }
                } catch (error) {
                    Swal.fire('Error!', error.response?.data?.message || 'Failed to update role', 'error');
                }
            }
        });
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (userEmail === user?.email) {
            Swal.fire('Cannot delete your own account!', '', 'warning');
            return;
        }

        Swal.fire({
            title: 'Delete User?',
            text: `This will permanently delete ${userEmail}. This cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await axiosSecure.delete(`/user/${userId}`);

                    if (response.data.success) {
                        setUsers(users.filter(u => u._id !== userId));
                        Swal.fire('Deleted!', 'User has been deleted.', 'success');
                    }
                } catch (error) {
                    Swal.fire('Error!', error.response?.data?.message || 'Failed to delete user', 'error');
                }
            }
        });
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div data-aos="fade-down" className="mb-12">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-600 mb-2">
                        👥 User Management
                    </h1>
                    <p className="text-lg text-gray-600">Manage system users and their roles</p>
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

                {!loading && users.length > 0 && (
                    <div data-aos="fade-up" className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-blue-600 to-teal-600 text-white">
                            <p className="text-lg font-bold">Total Users: {users.length}</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100 border-b">
                                    <tr>
                                        <th className="px-6 py-4 text-left font-bold text-gray-800">Photo</th>
                                        <th className="px-6 py-4 text-left font-bold text-gray-800">Name</th>
                                        <th className="px-6 py-4 text-left font-bold text-gray-800">Email</th>
                                        <th className="px-6 py-4 text-left font-bold text-gray-800">Role</th>
                                        <th className="px-6 py-4 text-left font-bold text-gray-800">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((usr) => (
                                        <tr key={usr._id} className="border-b hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                {usr.photoURL ? (
                                                    <img
                                                        src={usr.photoURL}
                                                        alt={usr.displayName}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold">
                                                        {usr.displayName?.charAt(0) || 'U'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-gray-900">{usr.displayName || 'N/A'}</td>
                                            <td className="px-6 py-4 text-gray-700">{usr.email}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-4 py-2 rounded-full font-bold text-sm ${
                                                        usr.role === 'admin'
                                                            ? 'bg-purple-200 text-purple-800'
                                                            : 'bg-blue-200 text-blue-800'
                                                    }`}
                                                >
                                                    {usr.role === 'admin' ? '👑 Admin' : '👤 User'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    {usr.email === user?.email ? (
                                                        <span className="text-xs text-gray-500 font-semibold">Your Account</span>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() =>
                                                                    handleRoleChange(
                                                                        usr._id,
                                                                        usr.email,
                                                                        usr.role === 'admin' ? 'user' : 'admin'
                                                                    )
                                                                }
                                                                className={`btn btn-sm ${
                                                                    usr.role === 'admin'
                                                                        ? 'btn-outline text-orange-600 border-orange-600'
                                                                        : 'btn-sm bg-purple-500 hover:bg-purple-600 text-white border-none'
                                                                }`}
                                                            >
                                                                {usr.role === 'admin' ? 'Demote' : 'Promote'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(usr._id, usr.email)}
                                                                className="btn btn-sm btn-error text-white"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!loading && users.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-xl text-gray-600">No users found</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
