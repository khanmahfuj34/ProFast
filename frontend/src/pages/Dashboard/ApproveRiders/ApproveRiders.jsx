import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ApproveRiders = () => {
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [riders, setRiders] = useState([]);
    const [filteredRiders, setFilteredRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50 });
        fetchRiders();
    }, []);

    const fetchRiders = async () => {
        try {
            setLoading(true);
            const response = await axiosSecure.get('/riders');
            if (response.data.success) {
                setRiders(response.data.riders || []);
                filterRiders(response.data.riders || [], filterStatus, searchTerm);
            }
        } catch (error) {
            console.error('❌ Error fetching riders:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to fetch rider applications',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(false);
        }
    };

    const filterRiders = (ridersList, status, search) => {
        let filtered = ridersList;

        // Filter by status
        if (status !== 'all') {
            filtered = filtered.filter(rider => rider.status.toLowerCase() === status.toLowerCase());
        }

        // Filter by search term
        if (search.trim()) {
            filtered = filtered.filter(rider =>
                rider.name.toLowerCase().includes(search.toLowerCase()) ||
                rider.email.toLowerCase().includes(search.toLowerCase()) ||
                rider.phoneNumber.includes(search)
            );
        }

        setFilteredRiders(filtered);
    };

    const handleSearch = (e) => {
        const search = e.target.value;
        setSearchTerm(search);
        filterRiders(riders, filterStatus, search);
    };

    const handleFilterStatus = (e) => {
        const status = e.target.value;
        setFilterStatus(status);
        filterRiders(riders, status, searchTerm);
    };

    const viewRiderDetails = (riderId) => {
        navigate(`/dashboard/ApproveRiders/${riderId}`, { state: { riders } });
    };

    const getStatusBadge = (status) => {
        switch(status) {
            case 'Approved':
                return <span className="badge badge-success badge-lg gap-2">✅ Approved</span>;
            case 'Rejected':
                return <span className="badge badge-error badge-lg gap-2">❌ Rejected</span>;
            default:
                return <span className="badge badge-warning badge-lg gap-2">⏳ Pending</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8" data-aos="fade-down">
                <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                    🏍️ Approve Riders
                </h1>
                <p className="text-gray-600 text-lg">Review and manage rider applications</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div data-aos="zoom-in" className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-semibold">Pending</p>
                            <p className="text-3xl font-bold text-yellow-600">{riders.filter(r => r.status === 'Pending').length}</p>
                        </div>
                        <div className="text-yellow-500 text-3xl">⏳</div>
                    </div>
                </div>

                <div data-aos="zoom-in" data-aos-delay="100" className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-semibold">Approved</p>
                            <p className="text-3xl font-bold text-green-600">{riders.filter(r => r.status === 'Approved').length}</p>
                        </div>
                        <div className="text-green-500 text-3xl">✅</div>
                    </div>
                </div>

                <div data-aos="zoom-in" data-aos-delay="200" className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-semibold">Rejected</p>
                            <p className="text-3xl font-bold text-red-600">{riders.filter(r => r.status === 'Rejected').length}</p>
                        </div>
                        <div className="text-red-500 text-3xl">❌</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div data-aos="fade-up" className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Search by Name, Email or Phone</label>
                        <input
                            type="text"
                            placeholder="Search riders..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full text-base-100 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Filter by Status</label>
                        <select
                            value={filterStatus}
                            onChange={handleFilterStatus}
                            className="w-full text-base-100 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div data-aos="fade-up" className="bg-white rounded-lg shadow-md overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="inline-block">
                            <div className="animate-spin">
                                <svg className="w-12 h-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            </div>
                        </div>
                        <p className="text-gray-600 mt-4">Loading riders...</p>
                    </div>
                ) : filteredRiders.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-gray-500 text-lg">No riders found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Region</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredRiders.map((rider, index) => (
                                    <tr key={rider._id} className="hover:bg-gray-50 transition" data-aos="fade-up" data-aos-delay={index * 50}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {rider.photo ? (
                                                    <img 
                                                        src={rider.photo} 
                                                        alt={rider.name}
                                                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-300 shadow-md"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center justify-center text-white font-bold text-sm">
                                                        {rider.name?.charAt(0)?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="font-semibold text-gray-900">{rider.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">{rider.email}</td>
                                        <td className="px-6 py-4 text-gray-700">{rider.phoneNumber}</td>
                                        <td className="px-6 py-4 text-gray-700">{rider.region}</td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(rider.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2 flex-wrap">
                                                <button
                                                    onClick={() => viewRiderDetails(rider._id)}
                                                    className="btn btn-sm btn-outline btn-primary gap-2"
                                                    title="View and manage this rider"
                                                >
                                                    👁️ View Details
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div data-aos="fade-up" className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                <p className="text-blue-800">
                    <strong>Total Applications:</strong> {filteredRiders.length} | 
                    <strong className="ml-4">Pending:</strong> {filteredRiders.filter(r => r.status === 'Pending').length} |
                    <strong className="ml-4">Approved:</strong> {filteredRiders.filter(r => r.status === 'Approved').length} |
                    <strong className="ml-4">Rejected:</strong> {filteredRiders.filter(r => r.status === 'Rejected').length}
                </p>
            </div>
        </div>
    );
};

export default ApproveRiders;
