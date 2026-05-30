import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useQueryClient } from '@tanstack/react-query';
import { 
  MdSearch, MdFilterList, MdCheckCircle, MdCancel, 
  MdPauseCircleFilled, MdVisibility,
  MdPhone, MdEmail, MdLocationOn, MdDirectionsBike
} from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import useAuth from '../../../../hooks/useAuth';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';

const ApproveRiders = () => {
    const { isAdmin } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    const [riders, setRiders] = useState([]);
    const [filteredRiders, setFilteredRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        if (!isAdmin) {
            navigate('/');
        } else {
            fetchRiders();
        }
    }, [isAdmin, navigate]);

    const fetchRiders = async () => {
        try {
            setLoading(true);
            const response = await axiosSecure.get('/riders');
            if (response.data.success) {
                const list = response.data.riders || [];
                setRiders(list);
                filterRiders(list, filterStatus, searchTerm);
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

        if (status !== 'all') {
            filtered = filtered.filter(rider => rider.status.toLowerCase() === status.toLowerCase());
        }

        if (search.trim()) {
            const query = search.toLowerCase();
            filtered = filtered.filter(rider =>
                (rider.name && rider.name.toLowerCase().includes(query)) ||
                (rider.email && rider.email.toLowerCase().includes(query)) ||
                (rider.phoneNumber && rider.phoneNumber.includes(search))
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
        navigate(`/admin/approve-riders/${riderId}`, { state: { riders } });
    };

    const updateRiderStatus = async (riderId, status, name) => {
        try {
            const confirm = await Swal.fire({
                title: `Confirm ${status}`,
                text: `Are you sure you want to mark ${name} as ${status}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: status === 'Approved' ? '#10b981' : status === 'Rejected' ? '#ef4444' : '#f59e0b',
                cancelButtonColor: '#64748b',
                confirmButtonText: `Yes, ${status}`
            });

            if (confirm.isConfirmed) {
                const response = await axiosSecure.patch(`/riders/${riderId}`, { status });
                if (response.data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: `Rider ${status.toLowerCase()} successfully`,
                        timer: 1500,
                        showConfirmButton: false
                    });
                    fetchRiders();
                    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
                    queryClient.invalidateQueries({ queryKey: ['admin-riders'] });
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
            Swal.fire('Error', 'Failed to update rider status', 'error');
        }
    };

    const getApprovalBadge = (status) => {
        const styles = {
            'Approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'Pending': 'bg-amber-100 text-amber-700 border-amber-200',
            'Rejected': 'bg-red-100 text-red-700 border-red-200',
            'Suspended': 'bg-slate-100 text-slate-700 border-slate-300'
        };
        const style = styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
        return (
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${style}`}>
                {status || 'Unknown'}
            </span>
        );
    };

    const getWorkStatusChip = (rider) => {
        if (rider.status !== 'Approved') {
            return (
                <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span> Unavailable
                </div>
            );
        }

        const isOnline = rider.isOnline;
        const workStatus = (rider.workStatus || '').toLowerCase();

        if (workStatus === 'in_delivery') {
            return (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    <MdDirectionsBike className="w-3.5 h-3.5" /> In Delivery
                </div>
            );
        }

        if (isOnline) {
            return (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Online
                </div>
            );
        }

        return (
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Offline
            </div>
        );
    };

    if (!isAdmin) return null;

    const pendingCount = riders.filter(r => r.status === 'Pending').length;
    const approvedCount = riders.filter(r => r.status === 'Approved').length;
    const rejectedCount = riders.filter(r => r.status === 'Rejected').length;

    return (
        <div className="min-h-screen bg-slate-50 p-4 lg:p-6 text-slate-800 w-full overflow-x-hidden font-sans">
            <div className="flex flex-col gap-6 max-w-7xl mx-auto">
                
                {/* ─── Header ─── */}
                <div className="flex items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                        <MdDirectionsBike className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Approve Riders</h1>
                        <p className="text-sm font-medium text-slate-500 mt-1">Review, approve, and manage rider applications</p>
                    </div>
                </div>

                {/* ─── Stats Cards ─── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Pending Requests</p>
                            <p className="text-3xl font-extrabold text-amber-600">{pendingCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
                            <MdPauseCircleFilled className="w-6 h-6 text-amber-500" />
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Approved Riders</p>
                            <p className="text-3xl font-extrabold text-emerald-600">{approvedCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                            <MdCheckCircle className="w-6 h-6 text-emerald-500" />
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Rejected Apps</p>
                            <p className="text-3xl font-extrabold text-red-600">{rejectedCount}</p>
                        </div>
                        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                            <MdCancel className="w-6 h-6 text-red-500" />
                        </div>
                    </motion.div>
                </div>

                {/* ─── Filters & Search ─── */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                            />
                        </div>
                        <div className="relative md:w-64">
                            <MdFilterList className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                            <select
                                value={filterStatus}
                                onChange={handleFilterStatus}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-8 py-2.5 text-sm text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none cursor-pointer"
                            >
                                <option value="all">All Applications</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* ─── Data Content ─── */}
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-sm font-medium text-slate-500">Loading riders...</p>
                    </div>
                ) : filteredRiders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                        <MdDirectionsBike className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-base font-bold text-slate-600">No riders found</p>
                        <p className="text-sm text-slate-400 mt-1">Adjust your filters to see more results.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Desktop Table View */}
                        <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="overflow-x-auto overflow-y-auto max-h-[60vh] scrollbar-thin scrollbar-thumb-slate-300">
                                <table className="w-full text-left border-collapse table-fixed min-w-[1050px]">
                                    <thead className="bg-slate-50/90 sticky top-0 z-10 backdrop-blur-sm">
                                        <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                                            <th className="py-4 px-5 text-left w-[25%]">Rider Profile</th>
                                            <th className="py-4 px-5 text-left w-[20%]">Contact Info</th>
                                            <th className="py-4 px-5 text-left w-[15%]">Region</th>
                                            <th className="py-4 px-5 text-center w-[15%]">Approval Status</th>
                                            <th className="py-4 px-5 text-center w-[12%]">Work Status</th>
                                            <th className="py-4 px-5 text-center w-[13%]">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <AnimatePresence>
                                            {filteredRiders.map((rider) => (
                                                <motion.tr 
                                                    key={rider._id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="hover:bg-slate-50/80 transition-colors group"
                                                >
                                                    <td className="py-4 px-5 align-middle">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-sm">
                                                                {rider.photo ? (
                                                                    <img src={rider.photo} alt={rider.name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <span className="text-sm font-bold text-slate-500 uppercase">{rider.name?.charAt(0)}</span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-bold text-slate-900 truncate">{rider.name}</div>
                                                                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">ID: {rider._id?.slice(-6)}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-5 align-middle">
                                                        <div className="flex flex-col gap-1.5">
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium truncate">
                                                                <MdEmail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                                {rider.email}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                                                                <MdPhone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                                {rider.phoneNumber || rider.phone || '—'}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-5 align-middle">
                                                        <div className="flex items-start gap-1.5 text-sm text-slate-700 font-semibold truncate">
                                                            <MdLocationOn className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                            {rider.division || rider.region || '—'}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-5 align-middle text-center">
                                                        {getApprovalBadge(rider.status)}
                                                    </td>
                                                    <td className="py-4 px-5 align-middle text-center">
                                                        {getWorkStatusChip(rider)}
                                                    </td>
                                                    <td className="py-4 px-5 align-middle">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => viewRiderDetails(rider._id)}
                                                                title="View Details"
                                                                className="p-2 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                                                            >
                                                                <MdVisibility className="w-4 h-4" />
                                                            </button>

                                                            {rider.status !== 'Approved' && (
                                                                <button
                                                                    onClick={() => updateRiderStatus(rider._id, 'Approved', rider.name)}
                                                                    title="Approve Rider"
                                                                    className="p-2 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 rounded-lg transition-colors border border-transparent hover:border-emerald-200"
                                                                >
                                                                    <MdCheckCircle className="w-4 h-4" />
                                                                </button>
                                                            )}

                                                            {rider.status === 'Pending' && (
                                                                <button
                                                                    onClick={() => updateRiderStatus(rider._id, 'Rejected', rider.name)}
                                                                    title="Reject Rider"
                                                                    className="p-2 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                                >
                                                                    <MdCancel className="w-4 h-4" />
                                                                </button>
                                                            )}

                                                            {rider.status === 'Approved' && (
                                                                <button
                                                                    onClick={() => updateRiderStatus(rider._id, 'Suspended', rider.name)}
                                                                    title="Suspend Rider"
                                                                    className="p-2 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-600 rounded-lg transition-colors border border-transparent hover:border-amber-200"
                                                                >
                                                                    <MdPauseCircleFilled className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Mobile Cards View */}
                        <div className="block lg:hidden space-y-4">
                            <AnimatePresence>
                                {filteredRiders.map((rider) => (
                                    <motion.div
                                        key={rider._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4"
                                    >
                                        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 overflow-hidden shadow-sm">
                                                    {rider.photo ? (
                                                        <img src={rider.photo} alt={rider.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-bold text-slate-500 uppercase">{rider.name?.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-slate-800 text-sm truncate">{rider.name}</h4>
                                                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">ID: {rider._id?.slice(-6).toUpperCase()}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1.5">
                                                {getApprovalBadge(rider.status)}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl text-xs space-y-2 sm:space-y-0">
                                            <div className="space-y-1.5">
                                                <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Contact Info</p>
                                                <p className="flex items-center gap-1.5 text-slate-700 font-semibold truncate">
                                                    <MdEmail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    {rider.email}
                                                </p>
                                                <p className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                                    <MdPhone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                    {rider.phoneNumber || rider.phone || '—'}
                                                </p>
                                            </div>
                                            <div className="sm:border-l sm:border-slate-200 sm:pl-3 space-y-1.5">
                                                <p className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Region & Work Status</p>
                                                <p className="flex items-center gap-1.5 text-slate-700 font-semibold">
                                                    <MdLocationOn className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                    {rider.division || rider.region || '—'}
                                                </p>
                                                <div className="mt-1">
                                                    {getWorkStatusChip(rider)}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                            <button
                                                onClick={() => viewRiderDetails(rider._id)}
                                                title="View Details"
                                                className="px-3 py-2 bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                            >
                                                <MdVisibility className="w-4 h-4" /> Details
                                            </button>

                                            {rider.status !== 'Approved' && (
                                                <button
                                                    onClick={() => updateRiderStatus(rider._id, 'Approved', rider.name)}
                                                    title="Approve Rider"
                                                    className="px-3 py-2 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-600 rounded-lg transition-colors border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <MdCheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                            )}

                                            {rider.status === 'Pending' && (
                                                <button
                                                    onClick={() => updateRiderStatus(rider._id, 'Rejected', rider.name)}
                                                    title="Reject Rider"
                                                    className="px-3 py-2 bg-slate-100 hover:bg-red-100 text-slate-600 hover:text-red-600 rounded-lg transition-colors border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <MdCancel className="w-4 h-4" /> Reject
                                                </button>
                                            )}

                                            {rider.status === 'Approved' && (
                                                <button
                                                    onClick={() => updateRiderStatus(rider._id, 'Suspended', rider.name)}
                                                    title="Suspend Rider"
                                                    className="px-3 py-2 bg-slate-100 hover:bg-amber-100 text-slate-600 hover:text-amber-600 rounded-lg transition-colors border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <MdPauseCircleFilled className="w-4 h-4" /> Suspend
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Bottom spacer */}
                <div className="h-6"></div>
            </div>
        </div>
    );
};

export default ApproveRiders;
