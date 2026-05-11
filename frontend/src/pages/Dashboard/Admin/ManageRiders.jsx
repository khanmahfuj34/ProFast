import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import AOS from 'aos';
import 'aos/dist/aos.css';

const ManageRiders = () => {
    const { isAdmin } = useAuth();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [riders, setRiders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 50 });
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
                setRiders(response.data.riders);
                setError(null);
            }
        } catch (err) {
            console.error('Error fetching riders:', err);
            setError('Failed to load rider applications');
            setRiders([]);
        } finally {
            setLoading(false);
        }
    };

    const updateRiderStatus = async (riderId, newStatus) => {
        try {
            const response = await axiosSecure.patch(`/riders/${riderId}`, { status: newStatus });
            if (response.data.success) {
                fetchRiders();
            }
        } catch (err) {
            console.error('Error updating rider status:', err);
            setError('Failed to update rider status');
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">🏍️ Manage Riders</h1>

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

                {!loading && riders.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-500">No rider applications found</p>
                    </div>
                )}

                {!loading && riders.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {riders.map((rider) => (
                                    <tr key={rider._id}>
                                        <td>{rider.name}</td>
                                        <td>{rider.email}</td>
                                        <td>
                                            <span className={`badge ${rider.status === 'Approved' ? 'badge-success' : rider.status === 'Rejected' ? 'badge-error' : 'badge-warning'}`}>
                                                {rider.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button onClick={() => updateRiderStatus(rider._id, 'Approved')} className="btn btn-sm btn-success mr-2">Approve</button>
                                            <button onClick={() => updateRiderStatus(rider._id, 'Rejected')} className="btn btn-sm btn-error">Reject</button>
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

export default ManageRiders;