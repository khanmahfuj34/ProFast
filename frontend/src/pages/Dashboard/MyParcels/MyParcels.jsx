import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaMagnifyingGlass, FaTrashCan, FaPencil } from 'react-icons/fa6';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useAuth from '../../../hooks/useAuth';

const MyParcels = () => {
    const {user} = useAuth();
    const navigate = useNavigate();
    const axiosSecure = useAxiosSecure();
    const { data: parcels = [], isLoading, isError, refetch } = useQuery({
        queryKey: ['parcels', user?.email],
        queryFn: async () => {
            const res = await axiosSecure.get(`/parcels?email=${user.email}`);
            return res.data;
        },
        enabled: !!user?.email
    });

    const handlePayment = (parcel) => {
        navigate('/dashboard/payment', { state: { parcel } });
    };

    const formatLabel = (value) =>
        value ? value.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : 'N/A';

    const handleViewDetails = (parcel) => {
        Swal.fire({
            title: 'Parcel Details',
            html: `
                <div style="text-align:left;line-height:1.8">
                    <p><strong>Name:</strong> ${parcel.parcelName || 'N/A'}</p>
                    <p><strong>Type:</strong> ${formatLabel(parcel.parcelType)}</p>
                    <p><strong>Delivery:</strong> ${formatLabel(parcel.deliveryType)}</p>
                    <p><strong>Sender:</strong> ${parcel.senderName || 'N/A'}</p>
                    <p><strong>Receiver:</strong> ${parcel.receiverName || 'N/A'}</p>
                    <p><strong>Cost:</strong> ৳${parcel.totalPrice ?? 0}</p>
                    <p><strong>Payment:</strong> ${formatLabel(parcel.paymentStatus || parcel.payment_status || 'unpaid')}</p>
                </div>
            `,
            confirmButtonColor: '#65a30d'
        });
    };

    const handleEditParcel = async (parcel) => {
        if (!parcel?._id) return;

        // Show edit form in modal
        const { value: formValues } = await Swal.fire({
            title: 'Edit Parcel Details',
            html: `
                <div style="text-align:left; max-height:500px; overflow-y:auto">
                    <div style="background-color:#f0f9ff; padding:12px; border-radius:6px; margin-bottom:16px">
                        <h3 style="margin:0 0 10px 0; color:#1e40af; font-size:14px; font-weight:bold">Parcel Information</h3>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:12px">
                            <div>
                                <p style="margin:0; color:#666"><strong>Type:</strong></p>
                                <p style="margin:4px 0 0 0; color:#333">${formatLabel(parcel.parcelType)}</p>
                            </div>
                            <div>
                                <p style="margin:0; color:#666"><strong>Delivery:</strong></p>
                                <p style="margin:4px 0 0 0; color:#333">${formatLabel(parcel.deliveryType)}</p>
                            </div>
                            <div>
                                <p style="margin:0; color:#666"><strong>Cost:</strong></p>
                                <p style="margin:4px 0 0 0; color:#333">৳${parcel.totalPrice ?? 0}</p>
                            </div>
                            <div>
                                <p style="margin:0; color:#666"><strong>Payment:</strong></p>
                                <p style="margin:4px 0 0 0; color:#333">${formatLabel(parcel.paymentStatus || parcel.payment_status || 'unpaid')}</p>
                            </div>
                        </div>
                    </div>

                    <h3 style="margin:16px 0 12px 0; color:#374151; font-size:14px; font-weight:bold">Sender Information</h3>
                    <div style="margin-bottom:12px">
                        <label style="display:block; margin-bottom:4px; font-weight:bold; color:#333; font-size:13px">Sender Name</label>
                        <input id="senderName" type="text" value="${parcel.senderName || ''}" 
                            class="swal2-input" placeholder="Enter sender name" style="width:95%; padding:8px; font-size:13px">
                    </div>
                    <div style="margin-bottom:12px">
                        <label style="display:block; margin-bottom:4px; font-weight:bold; color:#333; font-size:13px">Sender Phone</label>
                        <input id="senderPhone" type="tel" value="${parcel.senderPhone || ''}" 
                            class="swal2-input" placeholder="Enter sender phone" style="width:95%; padding:8px; font-size:13px">
                    </div>

                    <h3 style="margin:16px 0 12px 0; color:#374151; font-size:14px; font-weight:bold">Parcel Details</h3>
                    <div style="margin-bottom:12px">
                        <label style="display:block; margin-bottom:4px; font-weight:bold; color:#333; font-size:13px">Parcel Name</label>
                        <input id="parcelName" type="text" value="${parcel.parcelName || ''}" 
                            class="swal2-input" placeholder="Enter parcel name" style="width:95%; padding:8px; font-size:13px">
                    </div>
                    <div style="margin-bottom:12px">
                        <label style="display:block; margin-bottom:4px; font-weight:bold; color:#333; font-size:13px">Description</label>
                        <textarea id="parcelDescription" class="swal2-input" placeholder="Enter parcel description" 
                            style="width:95%; padding:8px; font-size:13px; resize:vertical; height:60px; font-family:inherit">${parcel.parcelDescription || ''}</textarea>
                    </div>

                    <h3 style="margin:16px 0 12px 0; color:#374151; font-size:14px; font-weight:bold">Receiver Information</h3>
                    <div style="margin-bottom:12px">
                        <label style="display:block; margin-bottom:4px; font-weight:bold; color:#333; font-size:13px">Receiver Name</label>
                        <input id="receiverName" type="text" value="${parcel.receiverName || ''}" 
                            class="swal2-input" placeholder="Enter receiver name" style="width:95%; padding:8px; font-size:13px">
                    </div>
                    <div style="margin-bottom:12px">
                        <label style="display:block; margin-bottom:4px; font-weight:bold; color:#333; font-size:13px">Receiver Phone</label>
                        <input id="receiverPhone" type="tel" value="${parcel.receiverPhone || ''}" 
                            class="swal2-input" placeholder="Enter receiver phone" style="width:95%; padding:8px; font-size:13px">
                    </div>
                    <div style="margin-bottom:12px">
                        <label style="display:block; margin-bottom:4px; font-weight:bold; color:#333; font-size:13px">Receiver Email</label>
                        <input id="receiverEmail" type="email" value="${parcel.receiverEmail || ''}" 
                            class="swal2-input" placeholder="Enter receiver email" style="width:95%; padding:8px; font-size:13px">
                    </div>
                    <div style="margin-bottom:12px">
                        <label style="display:block; margin-bottom:4px; font-weight:bold; color:#333; font-size:13px">Receiver Address</label>
                        <textarea id="receiverAddress" class="swal2-input" placeholder="Enter receiver address" 
                            style="width:95%; padding:8px; font-size:13px; resize:vertical; height:70px; font-family:inherit">${parcel.receiverAddress || ''}</textarea>
                    </div>
                </div>
            `,
            focusConfirm: false,
            preConfirm: () => {
                const senderName = document.getElementById('senderName').value.trim();
                const senderPhone = document.getElementById('senderPhone').value.trim();
                const parcelName = document.getElementById('parcelName').value.trim();
                const parcelDescription = document.getElementById('parcelDescription').value.trim();
                const receiverName = document.getElementById('receiverName').value.trim();
                const receiverPhone = document.getElementById('receiverPhone').value.trim();
                const receiverEmail = document.getElementById('receiverEmail').value.trim();
                const receiverAddress = document.getElementById('receiverAddress').value.trim();

                // Validation
                if (!senderName || !senderPhone || !parcelName || !receiverName || !receiverPhone || !receiverAddress) {
                    Swal.showValidationMessage('All required fields must be filled');
                    return false;
                }

                if (!/^\d{10,}$/.test(senderPhone.replace(/\s|-/g, ''))) {
                    Swal.showValidationMessage('Please enter a valid sender phone number');
                    return false;
                }

                if (!/^\d{10,}$/.test(receiverPhone.replace(/\s|-/g, ''))) {
                    Swal.showValidationMessage('Please enter a valid receiver phone number');
                    return false;
                }

                if (receiverEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(receiverEmail)) {
                    Swal.showValidationMessage('Please enter a valid email address');
                    return false;
                }

                return {
                    senderName,
                    senderPhone,
                    parcelName,
                    parcelDescription,
                    receiverName,
                    receiverPhone,
                    receiverEmail,
                    receiverAddress
                };
            },
            showCancelButton: true,
            confirmButtonText: 'Update',
            confirmButtonColor: '#65a30d',
            cancelButtonColor: '#6b7280',
            width: '500px'
        });

        if (!formValues) return;

        // Show loading state
        Swal.fire({
            title: 'Updating...',
            text: 'Please wait while we update your parcel.',
            didOpen: () => Swal.showLoading(),
            allowOutsideClick: false,
            allowEscapeKey: false
        });

        try {
            // Send update request to backend with JWT token from useAxiosSecure
            const response = await axiosSecure.patch(`/parcels/${parcel._id}`, formValues);

            if (response.data.modifiedCount > 0 || response.data.acknowledged) {
                await Swal.fire('Success!', 'Parcel updated successfully.', 'success');
                refetch(); // Refresh the parcels list
            } else {
                Swal.fire('Warning', 'No changes were made.', 'info');
            }
        } catch (error) {
            console.error('Error updating parcel:', error);
            
            // Security: Handle unauthorized access
            if (error.response?.status === 401 || error.response?.status === 403) {
                Swal.fire('Unauthorized', 'You do not have permission to edit this parcel.', 'error');
            } else {
                Swal.fire('Error', error.response?.data?.message || 'Failed to update parcel. Please try again.', 'error');
            }
        }
    };

    const handleDeleteParcel = async (parcel) => {
        if (!parcel?._id) return;

        const result = await Swal.fire({
            title: 'Delete this parcel?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#dc2626'
        });

        if (!result.isConfirmed) return;

        try {
            await axiosSecure.delete(`/parcels/${parcel._id}`);
            await Swal.fire('Deleted!', 'Parcel has been deleted.', 'success');
            refetch();
        } catch {
            Swal.fire('Error', 'Failed to delete parcel. Please try again.', 'error');
        }
    };

    return (
        <div className="space-y-5">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">All of My Parcels</h2>
                <p className="text-sm text-slate-500 mt-1">
                    Track your submitted deliveries and pricing details.
                </p>
            </div>

            {isLoading && <p className="text-base font-medium text-slate-600">Loading parcels...</p>}
            {isError && <p className="text-base font-medium text-red-500">Failed to load parcels.</p>}
            {!isLoading && !isError && parcels.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                    <p className="text-lg font-semibold text-slate-700">No parcels found.</p>
                    <p className="text-sm text-slate-500 mt-1">Create your first parcel to see it listed here.</p>
                </div>
            )}

            {!isLoading && !isError && parcels.length > 0 && (
                <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="table">
                        <thead className="bg-slate-100 text-slate-700 text-sm">
                            <tr>
                                <th className="font-semibold">#</th>
                                <th className="font-semibold">Parcel Name</th>
                                <th className="font-semibold">Type</th>
                                <th className="font-semibold">Delivery</th>
                                <th className="font-semibold text-right">Cost</th>
                                <th className="font-semibold">Payment Status</th>
                                <th className="font-semibold text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parcels.map((parcel, index) => (
                                (() => {
                                    const paymentStatus = parcel.paymentStatus || parcel.payment_status || 'Pay';
                                    const isPaid = paymentStatus.toLowerCase() === 'paid';
                                    return (
                                <tr key={parcel._id || index} className="hover:bg-lime-50 transition-colors">
                                    <th className="text-base font-semibold text-slate-500">{index + 1}</th>
                                    <td className="text-base font-semibold text-slate-800">
                                        {parcel.parcelName || 'N/A'}
                                    </td>
                                    <td>
                                        <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                                            {formatLabel(parcel.parcelType)}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                            {formatLabel(parcel.deliveryType)}
                                        </span>
                                    </td>
                                    <td className="text-right text-base font-bold text-lime-700">
                                        ৳{parcel.totalPrice ?? 0}
                                    </td>
                                    <td>
                                        {isPaid ? (
                                            <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                                {formatLabel(paymentStatus)}
                                            </span>
                                        ) : (
                                            <button
                                                onClick={() => handlePayment(parcel)}
                                                className="inline-flex items-center justify-center rounded-md bg-lime-100 px-3 py-2 text-xs font-semibold text-lime-700 transition-all duration-200 hover:bg-lime-200"
                                                title="Pay parcel"
                                            >
                                                Pay Now
                                            </button>
                                        )}
                                    </td>
                                    <td className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleViewDetails(parcel)}
                                                className="inline-flex items-center justify-center rounded-md bg-blue-100 p-2 text-blue-700 transition-all duration-200 hover:bg-blue-200"
                                                title="View details"
                                            >
                                                <FaMagnifyingGlass className="text-sm" />
                                            </button>

                                            <button
                                                onClick={() => handleEditParcel(parcel)}
                                                className="inline-flex items-center justify-center rounded-md bg-green-100 p-2 text-green-700 transition-all duration-200 hover:bg-green-200"
                                                title="Edit parcel"
                                            >
                                                <FaPencil className="text-sm" />
                                            </button>

                                            <button
                                                onClick={() => handleDeleteParcel(parcel)}
                                                className="inline-flex items-center justify-center rounded-md bg-red-100 p-2 text-red-700 transition-all duration-200 hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                                                title="Delete parcel"
                                                disabled={!parcel?._id}
                                            >
                                                <FaTrashCan className="text-sm" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                    );
                                })()
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MyParcels;