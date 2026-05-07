import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const AssignedDeliveries = () => {
    const { user } = useAuth();
    const axiosSecure = useAxiosSecure();
    const queryClient = useQueryClient();

    const { data: parcels = [], isLoading, isError } = useQuery({
        queryKey: ['assigned-deliveries', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get('/parcels/assigned');
            return res.data || [];
        },
        enabled: !!user?.email
    });

    const updateDeliveryStatusMutation = useMutation({
        mutationFn: async ({ parcelId, deliveryStatus, clearRider }) => {
            const updatePayload = { deliveryStatus };
            if (clearRider) {
                updatePayload.riderId = null;
                updatePayload.riderName = '';
                updatePayload.riderEmail = '';
            }
            return axiosSecure.patch(`/parcels/${parcelId}`, updatePayload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assigned-deliveries', user?.email] });
            Swal.fire({
                title: 'Success!',
                text: 'Delivery status updated successfully.',
                icon: 'success',
                confirmButtonColor: '#65a30d'
            });
        },
        onError: () => {
            Swal.fire('Error', 'Failed to update delivery status', 'error');
        }
    });

    const handleAccept = (parcel) => {
        updateDeliveryStatusMutation.mutate({
            parcelId: parcel._id,
            deliveryStatus: 'driver_accepted'
        });
    };

    const handleReject = (parcel) => {
        Swal.fire({
            title: 'Reject Delivery?',
            text: 'Are you sure you want to reject this delivery? It will be sent back to the admin.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, reject it!'
        }).then((result) => {
            if (result.isConfirmed) {
                updateDeliveryStatusMutation.mutate({
                    parcelId: parcel._id,
                    deliveryStatus: 'pending-pickup',
                    clearRider: true
                });
            }
        });
    };

    const formatLabel = (value) =>
        value ? value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'N/A';

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">Assigned Deliveries</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Manage your assigned parcel delivery requests.
                    </p>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center items-center py-20">
                    <span className="loading loading-spinner loading-lg text-lime-600"></span>
                </div>
            )}
            
            {isError && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <p className="text-red-700">Failed to load assigned deliveries. Please try again later.</p>
                </div>
            )}

            {!isLoading && !isError && parcels.length === 0 && (
                <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                    <div className="text-5xl mb-4">📭</div>
                    <p className="text-xl font-bold text-slate-700">No Deliveries Assigned</p>
                    <p className="text-slate-500 mt-2">
                        You currently don't have any parcels assigned to you. 
                        Check back later when admins assign new deliveries.
                    </p>
                </div>
            )}

            {!isLoading && !isError && parcels.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {parcels.map((parcel) => (
                        <div key={parcel._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            {/* Card Header */}
                            <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="bg-lime-100 p-2 rounded-lg text-lime-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-800">{parcel.parcelName}</p>
                                        <p className="text-xs text-slate-500 font-mono tracking-wide">{parcel.trackingId || 'No Tracking ID'}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                    parcel.deliveryStatus === 'driver_assigned' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    parcel.deliveryStatus === 'driver_accepted' ? 'bg-lime-50 text-lime-700 border-lime-200' :
                                    'bg-blue-50 text-blue-700 border-blue-200'
                                }`}>
                                    {formatLabel(parcel.deliveryStatus || 'Assigned')}
                                </span>
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-4">
                                {/* Sender Info */}
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Sender</p>
                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                        <p className="font-semibold text-slate-700 text-sm">{parcel.senderName}</p>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <span>📞</span> {parcel.senderPhone || 'N/A'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <span>📍</span> {parcel.senderDistrict || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Receiver Info */}
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Receiver</p>
                                    <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-100">
                                        <p className="font-semibold text-slate-700 text-sm">{parcel.receiverName}</p>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                                            <span>📞</span> {parcel.receiverPhone || 'N/A'}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 line-clamp-2">
                                            <span>🏠</span> {parcel.receiverAddress || 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Payment Info */}
                                <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-0.5">Payment Status</p>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                            parcel.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                            {formatLabel(parcel.paymentStatus || 'Unpaid')}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-slate-500 mb-0.5">Total Cost</p>
                                        <p className="font-black text-lime-700">৳{parcel.totalPrice || 0}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Card Footer Actions */}
                            <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-3">
                                {parcel.deliveryStatus === 'driver_assigned' ? (
                                    <>
                                        <button
                                            onClick={() => handleReject(parcel)}
                                            className="flex-1 btn btn-sm btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleAccept(parcel)}
                                            className="flex-1 btn btn-sm bg-lime-600 hover:bg-lime-700 text-white border-none shadow-sm"
                                        >
                                            Accept Delivery
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full text-center py-1">
                                        <p className="text-sm font-semibold text-lime-600 flex justify-center items-center gap-2">
                                            <span>✅</span> You have accepted this delivery
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssignedDeliveries;
