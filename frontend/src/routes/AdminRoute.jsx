import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const AdminRoute = ({ children }) => {
    const { user, loading, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-blue-600"></span>
                    <p className="text-gray-600 font-medium">Checking access...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/403" replace />;
    }

    return children;
};

export default AdminRoute;