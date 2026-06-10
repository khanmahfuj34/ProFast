import React from 'react';
import { Link } from 'react-router-dom';

const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto pt-8 pb-6 border-t border-slate-200 dark:border-slate-800/80 bg-transparent transition-colors duration-300">
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">
          © {currentYear} ProFast Logistics. All rights reserved.
        </p>

        <div className="flex items-center gap-6">
          <Link
            to="/privacy"
            className="text-[12px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="text-[12px] font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default DashboardFooter;
