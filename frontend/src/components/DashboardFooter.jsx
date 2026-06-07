import React from 'react';
import { Link } from 'react-router-dom';

const DashboardFooter = ({ role }) => {
  const isRider = role === 'rider';
  const currentYear = new Date().getFullYear();

  // Define links based on user role
  const footerLinks = isRider
    ? [
        { label: 'Homepage', path: '/' },
        { label: 'Parcel Requests', path: '/dashboard/rider/parcel-requests' },
        { label: 'Assigned Deliveries', path: '/dashboard/assigned-deliveries' },
        { label: 'Delivery History', path: '/dashboard/delivery-history' },
        { label: 'Earnings', path: '/dashboard/rider/earnings' },
        { label: 'Notifications', path: '/dashboard/notifications' },
        { label: 'Support Center', path: '/dashboard/support' },
        { label: 'Contact Admin', path: '/dashboard/contact-admin' },
      ]
    : [
        { label: 'Homepage', path: '/' },
        { label: 'My Parcels', path: '/dashboard/my-parcels' },
        { label: 'Track Parcel', path: '/dashboard/track-parcel' },
        { label: 'Payment History', path: '/dashboard/payment-history' },
        { label: 'Notifications', path: '/dashboard/notifications' },
        { label: 'Support Center', path: '/dashboard/support' },
        { label: 'Contact Us', path: '/contact' },
      ];

  const legalLinks = [
    { label: 'Privacy Policy', path: '/privacy' },
    { label: 'Terms & Conditions', path: '/terms' },
  ];

  return (
    <footer className="mt-auto pt-10 pb-6 border-t border-slate-100 dark:border-slate-800/80 bg-transparent transition-colors duration-300">
      <div className="w-full space-y-6">
        
        {/* Navigation Grid/List */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo / Badge */}
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-md ${
              isRider 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                : 'bg-lime-500/10 text-lime-600 dark:text-lime-400 border border-lime-500/20'
            }`}>
              {isRider ? 'Rider Member' : 'User Member'}
            </span>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              ProFast Panel
            </span>
          </div>

          {/* Links Row */}
          <nav>
            <ul className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2">
              {footerLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Separator / Sub-footer */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
            © {currentYear} ProFast Logistics. All rights reserved.
          </p>

          <div className="flex items-center gap-6">
            {legalLinks.map((link, index) => (
              <Link
                key={index}
                to={link.path}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
};

export default DashboardFooter;
