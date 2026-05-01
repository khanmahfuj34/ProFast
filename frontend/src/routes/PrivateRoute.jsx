import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <span className="loading loading-spinner loading-xl"></span>;
    }
    
    if (!user) {
        return <Navigate to="/auth/login" replace />;
    }

    return children;
};

export default PrivateRoute;