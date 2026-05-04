import React from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';

/**
 * Forbidden Page (403)
 * Displayed when user doesn't have permission to access a resource
 */
const Forbidden = () => {
    React.useEffect(() => {
        AOS.init({ duration: 800 });
    }, []);

    const navigate = useNavigate();

    const handleBack = () => {
        navigate(-1);
    };

    const handleHome = () => {
        navigate('/');
    };

    const handleDashboard = () => {
        navigate('/dashboard');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 px-4">
            <div 
                className="max-w-md w-full text-center"
                data-aos="fade-up"
            >
                {/* Icon */}
                <div className="mb-6" data-aos="zoom-in" data-aos-delay="100">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full">
                        <svg 
                            className="w-10 h-10 text-orange-600" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                            />
                        </svg>
                    </div>
                </div>

                {/* Status Code */}
                <h1 
                    className="text-6xl font-bold text-orange-600 mb-2"
                    data-aos="fade-up"
                    data-aos-delay="200"
                >
                    403
                </h1>

                {/* Title */}
                <h2 
                    className="text-2xl font-bold text-gray-900 mb-4"
                    data-aos="fade-up"
                    data-aos-delay="300"
                >
                    Access Forbidden
                </h2>

                {/* Description */}
                <p 
                    className="text-gray-600 mb-8"
                    data-aos="fade-up"
                    data-aos-delay="400"
                >
                    You don't have permission to access this resource. This action is restricted to authorized users only.
                </p>

                {/* Actions */}
                <div 
                    className="flex flex-col gap-3"
                    data-aos="fade-up"
                    data-aos-delay="500"
                >
                    <button
                        onClick={handleBack}
                        className="btn btn-primary bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 border-none text-white w-full"
                    >
                        Go Back
                    </button>
                    <button
                        onClick={handleDashboard}
                        className="btn btn-outline border-gray-300 hover:border-gray-400 text-gray-700 w-full"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={handleHome}
                        className="btn btn-ghost text-gray-600 hover:text-gray-900 w-full"
                    >
                        Go Home
                    </button>
                </div>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200" data-aos="fade-up" data-aos-delay="600">
                    <p className="text-sm text-orange-700">
                        <span className="font-semibold">Need help?</span>
                        {' '}
                        <a 
                            href="/about" 
                            className="underline hover:text-orange-900 transition-colors"
                        >
                            Contact support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Forbidden;
