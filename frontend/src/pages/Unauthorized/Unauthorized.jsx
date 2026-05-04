import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';

/**
 * Unauthorized Page (401)
 * Displayed when user tries to access protected resources without authentication
 */
const Unauthorized = () => {
    React.useEffect(() => {
        AOS.init({ duration: 800 });
    }, []);

    const navigate = useNavigate();
    const location = useLocation();

    const handleLogin = () => {
        // Redirect to login with intended destination
        navigate('/auth/login', { state: { from: location } });
    };

    const handleHome = () => {
        navigate('/');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 px-4">
            <div 
                className="max-w-md w-full text-center"
                data-aos="fade-up"
            >
                {/* Icon */}
                <div className="mb-6" data-aos="zoom-in" data-aos-delay="100">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
                        <svg 
                            className="w-10 h-10 text-red-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                            />
                        </svg>
                    </div>
                </div>

                {/* Status Code */}
                <h1 
                    className="text-6xl font-bold text-red-600 mb-2"
                    data-aos="fade-up"
                    data-aos-delay="200"
                >
                    401
                </h1>

                {/* Title */}
                <h2 
                    className="text-2xl font-bold text-gray-900 mb-4"
                    data-aos="fade-up"
                    data-aos-delay="300"
                >
                    Authentication Required
                </h2>

                {/* Description */}
                <p 
                    className="text-gray-600 mb-8"
                    data-aos="fade-up"
                    data-aos-delay="400"
                >
                    You need to be logged in to access this page. Please sign in with your account to continue.
                </p>

                {/* Actions */}
                <div 
                    className="flex flex-col gap-3"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <button
                        onClick={handleLogin}
                        className="btn btn-primary bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none text-white w-full"
                    >
                        Sign In Now
                    </button>
                    <button
                        onClick={handleHome}
                        className="btn btn-outline border-gray-300 hover:border-gray-400 text-gray-700 w-full"
                    >
                        Go Home
                    </button>
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200" data-aos="fade-up" data-aos-delay="600">
                    <p className="text-sm text-blue-700">
                        <span className="font-semibold">Don't have an account?</span>
                        {' '}
                        <a 
                            href="/auth/register" 
                            className="underline hover:text-blue-900 transition-colors"
                        >
                            Create one now
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Unauthorized;
