import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import useAuth from './useAuth';

const axiosSecure = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    withCredentials: true // ✅ CRITICAL: Send cookies with every request
});

const useAxiosSecure = () => {
    const navigate = useNavigate();
    const { logOut, tokenReady } = useAuth();
    const hasSetupInterceptor = useRef(false);
    const isRedirecting = useRef(false);

    // Keep a ref to the latest tokenReady value so the interceptor closure always
    // reads the current value without needing to re-register on every render.
    const tokenReadyRef = useRef(tokenReady);
    useEffect(() => {
        tokenReadyRef.current = tokenReady;
    }, [tokenReady]);

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

                    // ✅ KEY FIX: Do NOT log out if the token is not ready yet.
                    // During the initial login flow the JWT cookie is being written by /jwt;
                    // any protected request that fires before that completes will 401.
                    // We should silently swallow those errors instead of logging the user out.
                    if (!tokenReadyRef.current) {
                        console.log('🔐 [Axios Interceptor] Token not ready yet — skipping logout on', path);
                        return Promise.reject(error);
                    }

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
                        navigate('/auth/login', { replace: true });
                        isRedirecting.current = false;
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
            hasSetupInterceptor.current = false;
        };
    }, [navigate, logOut]);

    return axiosSecure;
};

export default useAxiosSecure;