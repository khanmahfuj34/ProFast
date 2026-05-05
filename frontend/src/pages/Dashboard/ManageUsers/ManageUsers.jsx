import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ManageUsers = () => {
    const { isAdmin } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    // Remove local filteredUsers state, handle purely server side
    const itemsPerPage = 20;

    // UI + query state
    const [currentPage, setCurrentPage] = useState(1);
    const [filterRole, setFilterRole] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch users from server (moved above effects so it's callable)
    async function fetchUsers(page = 1, role = 'all', search = '') {
        try {
            setLoading(true);
            const response = await axiosSecure.get(`/users?page=${page}&limit=${itemsPerPage}&role=${role}&search=${search}`);
            if (response.data.success) {
                setUsers(response.data.users || []);
                setTotalUsers(response.data.total || 0);
                setTotalPages(response.data.totalPages || 1);
            }
        } catch (error) {
            console.error('❌ Error fetching users:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch users',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50 });
        if (!isAdmin) {
            navigate('/');
        } else {
            fetchUsers(currentPage, filterRole, searchTerm);
        }
    }, [isAdmin, navigate, currentPage, filterRole]); // Re-fetch when page or role changes

    // We can debounce the search if needed but let's trigger it directly for now or let users press search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isAdmin) {
                setCurrentPage(1); // Reset page to 1 when search term changes
                fetchUsers(1, filterRole, searchTerm);
            }
        }, 500); // 500ms debounce
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterRole = (e) => {
        setFilterRole(e.target.value);
        setCurrentPage(1);
    };

    const handleChangeRole = async (userId, userEmail, userName, currentRole) => {
        const result = await Swal.fire({
            icon: 'question',
            title: 'Change User Role',
            html: `<p class="text-gray-700">Change <strong>${userName}</strong>'s role?</p>`,
            input: 'select',
            inputOptions: {
                'user': 'User',
                'admin': 'Admin',
                'rider': 'Rider'
            },
            inputValue: currentRole,
            showCancelButton: true,
            confirmButtonText: 'Change',
            confirmButtonColor: '#3b82f6',
            cancelButtonText: 'Cancel',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed && result.value !== currentRole) {
            try {
                const response = await axiosSecure.patch('/user/role', {
                    email: userEmail,
                    userId: userId,
                    role: result.value
                });

                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Role Updated!',
                        text: `${userName}'s role changed to ${result.value}`,
                        confirmButtonColor: '#10b981'
                    });
                    fetchUsers();
                }
            } catch (error) {
                console.error('❌ Error changing role:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to change user role',
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };

    const handleRemoveAdmin = async (userId, userEmail, userName) => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Remove Admin Access?',
            html: `<p class="text-gray-700">Are you sure you want to remove admin status from <strong>${userName}</strong>?<br/><small class="text-gray-500">They will be demoted to regular user.</small></p>`,
            showCancelButton: true,
            confirmButtonText: 'Yes, Remove Admin',
            confirmButtonColor: '#ef4444',
            cancelButtonText: 'Cancel',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed) {
            try {
                const response = await axiosSecure.patch('/user/role', {
                    email: userEmail,
                    userId: userId,
                    role: 'user'
                });

                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Admin Removed!',
                        text: `${userName} has been demoted to regular user`,
                        confirmButtonColor: '#10b981'
                    });
                    fetchUsers();
                }
            } catch (error) {
                console.error('❌ Error removing admin:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to remove admin status',
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    };

    const handleOtherActions = async (user) => {
        const result = await Swal.fire({
            icon: 'info',
            title: 'User Actions',
            html: `<p class="text-gray-700">Choose an action for <strong>${user.displayName}</strong></p>`,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'View Details',
            denyButtonText: 'Delete User',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#3b82f6',
            denyButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280'
        });

        if (result.isConfirmed) {
            // View details
            Swal.fire({
                title: `${user.displayName}`,
                html: `
                    <div class="text-left space-y-3">
                        <div class="flex justify-center mb-4">
                            ${user.photoURL ? `<img src="${user.photoURL}" alt="${user.displayName}" class="w-24 h-24 rounded-full object-cover border-4 border-blue-300">` : '<div class="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center text-2xl">👤</div>'}
                        </div>
                        <div class="border-b pb-2">
                            <strong>Email:</strong> ${user.email}
                        </div>
                        <div class="border-b pb-2">
                            <strong>Role:</strong> <span class="px-2 py-1 rounded ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                user.role === 'rider' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }">${user.role}</span>
                        </div>
                        <div class="border-b pb-2">
                            <strong>Created:</strong> ${new Date(user.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                `,
                confirmButtonText: 'Close',
                confirmButtonColor: '#3b82f6'
            });
        } else if (result.isDenied) {
            // Delete user
            const deleteResult = await Swal.fire({
                icon: 'warning',
                title: 'Delete User?',
                html: `<p class="text-gray-700">Are you sure you want to delete <strong>${user.displayName}</strong>? This action cannot be undone.</p>`,
                showCancelButton: true,
                confirmButtonText: 'Yes, Delete',
                confirmButtonColor: '#ef4444',
                cancelButtonText: 'Cancel',
                cancelButtonColor: '#6b7280'
            });

            if (deleteResult.isConfirmed) {
                try {
                    const response = await axiosSecure.delete(`/user/${user._id}`);
                    if (response.data.success) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: `${user.displayName} has been deleted`,
                            confirmButtonColor: '#10b981'
                        });
                        fetchUsers();
                    }
                } catch (error) {
                    console.error('❌ Error deleting user:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete user',
                        confirmButtonColor: '#ef4444'
                    });
                }
            }
        }
    };

    const getRoleBadge = (role) => {
        switch(role) {
            case 'admin':
                return <span className="badge badge-error badge-lg gap-2">👑 Admin</span>;
            case 'rider':
                return <span className="badge badge-info badge-lg gap-2">🏍️ Rider</span>;
            default:
                return <span className="badge badge-neutral badge-lg gap-2">👤 User</span>;
        }
    };

    // Prevent non-admin users from seeing this page
    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8" data-aos="fade-down">
                <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    👥 Manage Users
                </h1>
                <p className="text-gray-600 text-lg">View and manage all users in the system</p>
            </div>

            {/* Total Users Stat */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div data-aos="zoom-in" className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-semibold">Total Filtered / Searched</p>
                            <p className="text-3xl font-bold text-blue-600">{totalUsers}</p>
                        </div>
                        <div className="text-blue-500 text-3xl">👥</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div data-aos="fade-up" className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Search by Name or Email</label>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full text-base-100 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Role</label>
                        <select
                            value={filterRole}
                            onChange={handleFilterRole}
                            className="w-full text-base-100 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">User</option>
                            <option value="rider">Rider</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div data-aos="fade-up" className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block animate-spin">
                            <svg className="w-12 h-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                        <p className="text-gray-600 mt-4">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 text-lg">No users found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">#</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Admin Action</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Other Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user, index) => {
                                    const serialNumber = (currentPage - 1) * itemsPerPage + index + 1;
                                    return (
                                        <tr key={user._id} className="hover:bg-gray-50 transition" data-aos="fade-up" data-aos-delay={index * 50}>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 text-white font-bold text-sm">
                                                    {serialNumber}
                                                </span>
                                            </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.photoURL ? (
                                                    <img 
                                                        src={user.photoURL} 
                                                        alt={user.displayName}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 shadow-md"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold">
                                                        {user.displayName?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="font-semibold text-gray-900">{user.displayName || 'Unknown'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{user.email}</td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.role === 'admin' ? (
                                                <button
                                                    onClick={() => handleRemoveAdmin(user._id, user.email, user.displayName || 'User')}
                                                    className="btn btn-sm btn-error gap-2 text-white"
                                                    title="Remove Admin Access"
                                                >
                                                    ❌ Remove Admin
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleChangeRole(user._id, user.email, user.displayName || 'User', user.role)}
                                                    className="btn btn-sm btn-ghost gap-2 text-blue-600 hover:bg-blue-50"
                                                    title="Make Admin"
                                                >
                                                    👑 Make Admin
                                                </button>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleOtherActions(user)}
                                                className="btn btn-sm btn-primary gap-2"
                                                title="More Actions"
                                            >
                                                ⚙️ Actions
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Pagination */}
                {totalUsers > itemsPerPage && (
                    <div className="p-4 bg-white border-t flex items-center justify-between">
                        <div className="text-sm text-gray-600">Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalUsers)} of {totalUsers} users</div>
                        <div className="flex items-center gap-2">
                            <button
                                className="btn btn-sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                ← Prev
                            </button>

                            <div className="flex gap-1 items-center">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`btn btn-xs ${page === currentPage ? 'btn-active' : ''}`}
                                    >
                                        {page}
                                    </button>
                                ))}
                            </div>

                            <button
                                className="btn btn-sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next →
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageUsers;
