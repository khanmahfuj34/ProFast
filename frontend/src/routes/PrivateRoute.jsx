import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * PrivateRoute Component
 * Protects routes that require authentication
 * 
 * Features:
 * - Redirects unauthenticated users to login with intended route
 * - Shows loading spinner while auth state is being verified
 * - Preserves user's intended destination after login
 * - Provides fallback loading UI for better UX
 */
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    
    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="flex flex-col items-center gap-4">
                    <span className="loading loading-spinner loading-lg text-blue-600"></span>
                    <p className="text-gray-600 font-medium">Verifying your credentials...</p>
                </div>
            </div>
        );
    }
    
    // If user is not authenticated, redirect to login
    // Preserve the intended route in location state for redirect after login
    if (!user) {
        return (
            <Navigate 
                to="/auth/login" 
                state={{ from: location }} 
                replace 
            />
        );
    }

    // User is authenticated, render the protected content
    return children;
};

export default PrivateRoute;