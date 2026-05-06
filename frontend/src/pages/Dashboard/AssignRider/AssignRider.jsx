import React, { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const AssignRider = () => {
    const { isAdmin } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();
    const riderModalRef = useRef();

    // Fetch parcels (sorted by latest date in backend)
    const { data: parcelsData, isLoading: parcelsLoading } = useQuery({
        queryKey: ['admin-parcels'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin/parcels');
            return res.data?.parcels || [];
        },
        enabled: !!isAdmin,
    });

    // Fetch riders to get available riders count
    const { data: ridersData } = useQuery({
        queryKey: ['admin-riders'],
        queryFn: async () => {
            const res = await axiosSecure.get('/riders');
            return res.data?.riders || [];
        },
        enabled: !!isAdmin,
    });

    const parcels = parcelsData || [];
    const riders = ridersData || [];
    const totalAvailableRiders = riders.filter(r => r.status === 'Approved' && (r.workStatus === 'Available' || !r.workStatus)).length;

    // Explicitly sort by latest date and time (descending)
    const sortedParcels = [...parcels].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const [selectedParcel, setSelectedParcel] = useState(null);
    const [selectedRiderId, setSelectedRiderId] = useState('');

    const openRiderModal = (parcel) => {
        setSelectedParcel(parcel);
        setSelectedRiderId(parcel.riderId || ''); // Pre-select if already assigned
        riderModalRef.current?.showModal();
    };
    

    const assignRiderMutation = useMutation({
        mutationFn: async ({ parcelId, riderId }) => {
            return axiosSecure.patch(`/parcels/${parcelId}`, {
                deliveryStatus: 'On The Way',
                riderId: riderId
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['admin-parcels']);
            Swal.fire({
                title: 'Assigned!',
                text: 'Rider has been successfully assigned.',
                icon: 'success',
                confirmButtonColor: '#65a30d'
            });
            riderModalRef.current?.close();
        },
        onError: () => {
            Swal.fire('Error', 'Failed to assign rider', 'error');
        }
    });

    const handleConfirmAssignment = () => {
        if (!selectedRiderId) {
            Swal.fire({ title: 'Error', text: 'Please select a rider first', icon: 'error', confirmButtonColor: '#ef4444' });
            return;
        }
        assignRiderMutation.mutate({ parcelId: selectedParcel._id, riderId: selectedRiderId });
    };

    if (!isAdmin) return null;

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Assign Rider</h1>
                        <p className="text-slate-500 mt-1">Manage and assign riders to pending parcels</p>
                    </div>
                    <div className="bg-lime-100 px-6 py-4 rounded-xl border border-lime-200 text-center">
                        <p className="text-sm font-bold text-lime-700 uppercase tracking-wide">Total Available Riders</p>
                        <p className="text-4xl font-black text-lime-800">{totalAvailableRiders}</p>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {parcelsLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <span className="loading loading-spinner loading-lg text-lime-600"></span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-100 text-slate-700">
                                        <th className="px-6 py-4 font-semibold text-sm border-b border-slate-200 w-12">#</th>
                                        <th className="px-6 py-4 font-semibold text-sm border-b border-slate-200">Name</th>
                                        <th className="px-6 py-4 font-semibold text-sm border-b border-slate-200">Cost</th>
                                        <th className="px-6 py-4 font-semibold text-sm border-b border-slate-200">Created At</th>
                                        <th className="px-6 py-4 font-semibold text-sm border-b border-slate-200">Pickup District</th>
                                        <th className="px-6 py-4 font-semibold text-sm border-b border-slate-200 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {sortedParcels.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                                No parcels found.
                                            </td>
                                        </tr>
                                    ) : (
                                        sortedParcels.map((parcel, index) => (
                                            <tr key={parcel._id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-slate-800">{parcel.parcelName || 'N/A'}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-lime-700">৳{parcel.totalPrice || 0}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {parcel.createdAt ? new Date(parcel.createdAt).toLocaleDateString('en-BD', {
                                                        year: 'numeric', month: 'short', day: 'numeric',
                                                        hour: '2-digit', minute: '2-digit'
                                                    }) : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700 border border-blue-100">
                                                        {parcel.senderDistrict || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => openRiderModal(parcel)}
                                                        className="btn btn-sm bg-lime-600 hover:bg-lime-700 text-white border-none rounded-lg shadow-md hover:shadow-lg transition-all"
                                                    >
                                                        Assign Rider
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Assign Rider Modal */}
            <dialog ref={riderModalRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box bg-white text-slate-800 rounded-2xl">
                    <h3 className="font-bold text-2xl text-slate-800 mb-4">Assign Rider</h3>
                    {selectedParcel && (
                        <div className="mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Parcel Details</p>
                            <p className="text-lg font-bold text-slate-700">{selectedParcel.parcelName}</p>
                            <p className="text-sm text-slate-600 mt-1">
                                <span className="font-semibold">Pickup:</span> {selectedParcel.senderDistrict || 'N/A'}
                            </p>
                        </div>
                    )}
                    
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-bold text-slate-700">Select Available Rider</span>
                        </label>
                        <select 
                            className="select select-bordered w-full bg-slate-50 border-slate-200 focus:border-lime-500 focus:ring-lime-500" 
                            value={selectedRiderId}
                            onChange={(e) => setSelectedRiderId(e.target.value)}
                        >
                            <option value="" disabled>Choose a rider...</option>
                            {riders.filter(r => r.status === 'Approved' && (r.workStatus === 'Available' || !r.workStatus)).length === 0 ? (
                                <option disabled>No available riders found</option>
                            ) : (
                                riders.filter(r => r.status === 'Approved' && (r.workStatus === 'Available' || !r.workStatus)).map(rider => (
                                    <option key={rider._id} value={rider._id}>{rider.name} - {rider.phoneNumber}</option>
                                ))
                            )}
                        </select>
                    </div>

                    <div className="modal-action mt-8">
                        <form method="dialog" className="flex gap-3 w-full">
                            <button className="btn btn-ghost hover:bg-slate-100 text-slate-600 flex-1">Cancel</button>
                            <button 
                                type="button" 
                                disabled={assignRiderMutation.isPending}
                                className="btn bg-lime-600 hover:bg-lime-700 text-white border-none flex-1 shadow-md hover:shadow-lg disabled:opacity-50"
                                onClick={handleConfirmAssignment}
                            >
                                {assignRiderMutation.isPending ? <span className="loading loading-spinner"></span> : 'Confirm Assignment'}
                            </button>
                        </form>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default AssignRider;