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
    const [selectedParcel, setSelectedParcel] = useState(null);
    const [selectedRiderId, setSelectedRiderId] = useState('');

    // Fetch parcels (sorted by latest date in backend)
    const { data: parcelsData, isLoading: parcelsLoading } = useQuery({
        queryKey: ['admin-parcels'],
        queryFn: async () => {
            const res = await axiosSecure.get('/admin/parcels');
            return res.data?.parcels || [];
        },
        enabled: !!isAdmin,
    });

    // Fetch available riders for the selected parcel's district
    const { data: ridersData, isLoading: ridersLoading } = useQuery({
        queryKey: ['riders', selectedParcel?.senderDistrict, 'available'],
        queryFn: async () => {
            const res = await axiosSecure.get(
                `/riders?status=approved&district=${selectedParcel.senderDistrict}&workStatus=available`
            );
            return res.data?.riders || [];
        },
        enabled: !!selectedParcel,
    });

    const parcels = parcelsData || [];
    const riders = ridersData || [];
    const totalAvailableRiders = riders.length;

    // Explicitly sort by latest date and time (descending)
    const sortedParcels = [...parcels].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


    const openRiderModal = (parcel) => {
        setSelectedParcel(parcel);
        setSelectedRiderId(parcel.riderId || ''); // Pre-select if already assigned
        riderModalRef.current?.showModal();
    };
    

    const assignRiderMutation = useMutation({
        mutationFn: async ({ parcelId, riderId, riderName, riderEmail }) => {
            return axiosSecure.patch(`/parcels/${parcelId}`, {
                deliveryStatus: 'driver_assigned',
                riderId,
                riderName,
                riderEmail
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-parcels'] });
            queryClient.invalidateQueries({ queryKey: ['riders', selectedParcel?.senderDistrict, 'available'] });
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
        const selectedRider = riders.find(r => r._id === selectedRiderId);
        assignRiderMutation.mutate({
            parcelId: selectedParcel._id,
            riderId: selectedRiderId,
            riderName: selectedRider?.name || '',
            riderEmail: selectedRider?.email || ''
        });
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
                <div className="modal-box bg-white text-slate-800 rounded-2xl max-w-2xl w-full">
                    <h3 className="font-bold text-2xl text-slate-800 mb-4">Assign Rider</h3>

                    {/* Parcel Info */}
                    {selectedParcel && (
                        <div className="mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                            <div className="bg-lime-100 p-3 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-lime-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Parcel</p>
                                <p className="font-bold text-slate-800">{selectedParcel.parcelName}</p>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    📍 Pickup: <span className="font-semibold text-slate-700">{selectedParcel.senderDistrict || 'N/A'}</span>
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Rider Cards */}
                    <div className="mb-2">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-slate-700">Available Riders</p>
                            {!ridersLoading && riders.length > 0 && (
                                <span className="bg-lime-100 text-lime-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                    {riders.length} found
                                </span>
                            )}
                        </div>

                        {ridersLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                <span className="loading loading-spinner loading-md text-lime-600"></span>
                                <p className="text-sm text-slate-500">Finding available riders...</p>
                            </div>
                        ) : riders.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                                <div className="text-4xl mb-2">🛵</div>
                                <p className="font-semibold text-slate-600">No available riders</p>
                                <p className="text-xs text-slate-400 mt-1">No approved & available riders in this district</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                                {riders.map(rider => {
                                    const isSelected = selectedRiderId === rider._id;
                                    return (
                                        <button
                                            key={rider._id}
                                            type="button"
                                            onClick={() => setSelectedRiderId(rider._id)}
                                            className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left w-full transition-all duration-150 cursor-pointer
                                                ${isSelected
                                                    ? 'border-lime-500 bg-lime-50 shadow-sm'
                                                    : 'border-slate-200 bg-white hover:border-lime-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            {/* Avatar */}
                                            <div className="relative flex-shrink-0">
                                                {rider.photo ? (
                                                    <img
                                                        src={rider.photo}
                                                        alt={rider.name}
                                                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 rounded-full bg-lime-100 flex items-center justify-center border-2 border-white shadow">
                                                        <span className="text-lime-700 font-bold text-lg">
                                                            {rider.name?.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                                {isSelected && (
                                                    <span className="absolute -top-1 -right-1 bg-lime-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none">✓</span>
                                                )}
                                            </div>
                                            {/* Info */}
                                            <div className="min-w-0 flex-1">
                                                <p className={`font-bold text-sm truncate ${isSelected ? 'text-lime-800' : 'text-slate-800'}`}>
                                                    {rider.name}
                                                </p>
                                                <p className="text-xs text-slate-500 truncate">📞 {rider.phoneNumber}</p>
                                                <p className="text-xs text-slate-400 truncate">🏍️ {rider.bikeBrand || 'N/A'} · {rider.district || rider.region || 'N/A'}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="modal-action mt-6">
                        <form method="dialog" className="flex gap-3 w-full">
                            <button className="btn btn-ghost hover:bg-slate-100 text-slate-600 flex-1">Cancel</button>
                            <button
                                type="button"
                                disabled={assignRiderMutation.isPending || !selectedRiderId}
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