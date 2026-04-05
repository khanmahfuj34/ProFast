import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from './useAuth';

/**
 * Custom hook for handling user logout with toast notifications and redirect
 * @returns {Object} - { handleLogout, isLoading, error }
 */
export const useLogout = () => {
    const { logOut } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogout = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Call logout from auth context
            await logOut();

            // Show success toast
            toast.success('Logged out successfully!', {
                position: 'top-center',
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });

            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/auth/login', { replace: true });
            }, 500);

        } catch (err) {
            const errorMessage = err.message || 'Failed to logout. Please try again.';
            setError(errorMessage);
            toast.error(errorMessage, {
                position: 'top-center',
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            setIsLoading(false);
        }
    };

    return { 
        handleLogout, 
        isLoading, 
        error 
    };
};

export default useLogout;
