import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import useAuth from './useAuth';

const axiosSecure = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true // ✅ CRITICAL: Send cookies with every request
});

const useAxiosSecure = () => {
    const navigate = useNavigate();
    const { logOut } = useAuth();
    const hasSetupInterceptor = useRef(false);
    const isRedirecting = useRef(false);

    useEffect(() => {
        // ✅ Only set up interceptor ONCE to avoid duplicate listeners
        if (hasSetupInterceptor.current) return;
        hasSetupInterceptor.current = true;

        // 🔐 Request Interceptor - Add Firebase token to Authorization header
        const requestInterceptor = axiosSecure.interceptors.request.use(
            config => {
                // Try to get token from localStorage (set during registration/login)
                const token = localStorage.getItem('authToken');
                
                if (token && !config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log('🔐 [Request Interceptor] Added Authorization header');
                }
                
                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );

        // 🔐 Response Interceptor - Handle auth errors globally
        const responseInterceptor = axiosSecure.interceptors.response.use(
            response => response,
            async error => {
                const status = error.response?.status;
                const path = error.config?.url;
                
                if (status === 401 || status === 403) {
                    console.warn(`🔐 [Axios Interceptor] ${status} error on ${path}`);
                    console.warn('🔐 [Axios Interceptor] Error:', error.response?.data?.message);
                    
                    // Prevent multiple redirects
                    if (isRedirecting.current) {
                        console.log('🔐 [Axios Interceptor] Already redirecting...');
                        return Promise.reject(error);
                    }
                    
                    isRedirecting.current = true;
                    console.warn('🔐 [Axios Interceptor] Logging out and redirecting to login');
                    
                    // Call logout to clear cookies and state
                    try {
                        await logOut();
                    } catch (logoutError) {
                        console.error('Error during logout:', logoutError.message);
                    }
                    
                    // Redirect to login page
                    setTimeout(() => {
                        navigate('/authentication/login');
                    }, 300);
                }
                return Promise.reject(error);
            }
        );

        // Cleanup on unmount
        return () => {
            axiosSecure.interceptors.request.eject(requestInterceptor);
            axiosSecure.interceptors.response.eject(responseInterceptor);
            isRedirecting.current = false;
        };
    }, [navigate, logOut]);

    return axiosSecure;
};

export default useAxiosSecure;