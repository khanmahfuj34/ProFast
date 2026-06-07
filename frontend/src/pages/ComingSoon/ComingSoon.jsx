import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPackage, FiArrowLeft, FiClock, FiSettings, FiActivity } from 'react-icons/fi';

const ComingSoon = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine page title based on route path
  const getPageInfo = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('privacy')) return { title: 'Privacy Policy', desc: 'Our updated privacy policy and data protection terms are being finalized.' };
    if (path.includes('terms')) return { title: 'Terms & Conditions', desc: 'Our service terms, legal rights, and liabilities are being refined.' };
    if (path.includes('contact-admin')) return { title: 'Contact Admin', desc: 'Direct secure channel to ProFast administrator is under maintenance.' };
    if (path.includes('contact')) return { title: 'Contact Us', desc: 'We are setting up our new multi-channel support and contact services.' };
    if (path.includes('support')) return { title: 'Support Center', desc: 'Our central knowledge base and help desk interface is being upgraded.' };
    return { title: 'Feature Coming Soon', desc: 'We are working hard to deliver this feature as part of our next release.' };
  };

  const { title, desc } = getPageInfo();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 bg-white dark:bg-[#060a14] transition-colors duration-300">
      <div className="relative w-full max-w-lg text-center space-y-8">
        
        {/* Animated Background Gradients */}
        <div className="absolute -inset-4 bg-gradient-to-r from-lime-500/10 to-emerald-500/10 rounded-3xl blur-2xl opacity-70 -z-10 animate-pulse" />

        {/* Dynamic Logistics/Tech Illustration */}
        <div className="relative inline-flex items-center justify-center mb-4">
          {/* Outer rotating/pulsing ring */}
          <div className="absolute w-28 h-28 rounded-full border border-dashed border-lime-500/40 dark:border-lime-400/30 animate-spin" style={{ animationDuration: '12s' }} />
          <div className="absolute w-24 h-24 rounded-full border border-lime-500/20 dark:border-lime-400/20 animate-ping" style={{ animationDuration: '3s' }} />
          
          {/* Main icon container */}
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-lime-50 to-lime-100 dark:from-lime-950/20 dark:to-emerald-950/20 border border-lime-200 dark:border-lime-800/30 flex items-center justify-center shadow-lg">
            <FiPackage className="w-10 h-10 text-lime-600 dark:text-lime-400 animate-bounce" />
            <div className="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
              <FiClock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 max-w-md mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-lime-50 dark:bg-lime-950/30 border border-lime-200/50 dark:border-lime-900/30 rounded-full text-xs font-bold text-lime-700 dark:text-lime-400 uppercase tracking-widest">
            <FiActivity className="w-3.5 h-3.5 animate-pulse" />
            Under Construction
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            {desc} The ProFast engineering team is currently building this page to ensure a secure and production-ready experience.
          </p>
        </div>

        {/* Loading Progress bar simulation */}
        <div className="max-w-xs mx-auto space-y-2">
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-lime-500 to-emerald-500 rounded-full w-2/3 animate-pulse" />
          </div>
          <div className="flex justify-between text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            <span>Progress: 75%</span>
            <span>Est: Q3 2026</span>
          </div>
        </div>

        {/* Back Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 bg-white dark:bg-[#0b1120] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-lime-500 dark:hover:border-lime-500 hover:text-lime-600 dark:hover:text-lime-400 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer group hover:scale-[1.02] active:scale-95"
          >
            <FiArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Go Back
          </button>
          
          <button
            onClick={() => navigate(isDashboard ? '/dashboard' : '/')}
            className="w-full sm:w-auto px-6 py-3 bg-lime-500 hover:bg-lime-600 text-white rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-95"
          >
            {isDashboard ? 'Back to Dashboard' : 'Back to Homepage'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ComingSoon;
