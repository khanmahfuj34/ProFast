import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import useAuth from './useAuth';
import { auth } from '../firebase/firebase.init';

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
            async config => {
                try {
                    const currentUser = auth.currentUser;
                    if (currentUser) {
                        // Dynamically retrieve the token (auto-refreshes if expired)
                        const token = await currentUser.getIdToken();
                        config.headers.Authorization = `Bearer ${token}`;
                        localStorage.setItem('authToken', token);
                    } else {
                        // Fallback to localStorage for compatibility/initial calls
                        const token = localStorage.getItem('authToken');
                        if (token) {
                            config.headers.Authorization = `Bearer ${token}`;
                        }
                    }
                } catch (error) {
                    console.error('🔐 [Request Interceptor] Error retrieving Firebase ID token:', error);
                }

                return config;
            },
            error => {
                return Promise.reject(error);
            }
        );

        // 🔐 Response Interceptor - Handle auth errors globally with retry logic
        const responseInterceptor = axiosSecure.interceptors.response.use(
            response => response,
            async error => {
                const originalRequest = error.config;
                const status = error.response?.status;
                const path = error.config?.url;

                // Handle 401/403 with automatic token refresh and single retry
                if ((status === 401 || status === 403) && originalRequest && !originalRequest._retry) {
                    originalRequest._retry = true;
                    const currentUser = auth.currentUser;
                    
                    if (currentUser) {
                        try {
                            console.log(`🔄 [Axios Interceptor] ${status} on ${path}. Attempting Firebase ID token refresh...`);
                            // Force refresh the token
                            const token = await currentUser.getIdToken(true);
                            localStorage.setItem('authToken', token);
                            
                            // Re-apply the new token to request headers
                            originalRequest.headers.Authorization = `Bearer ${token}`;
                            
                            console.log(`🔄 [Axios Interceptor] Retrying request to: ${path}`);
                            return axiosSecure(originalRequest);
                        } catch (refreshError) {
                            console.error('❌ [Axios Interceptor] Firebase ID token refresh failed:', refreshError);
                        }
                    }
                }

                // If retrying didn't resolve the 401/403, or no user is signed in
                if (status === 401 || status === 403) {
                    console.warn(`🔐 [Axios Interceptor] Unresolved ${status} on ${path}`);
                    
                    // ✅ KEY FIX: Do NOT log out if the token is not ready yet.
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