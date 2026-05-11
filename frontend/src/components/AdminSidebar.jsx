import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  MdDashboard,
  MdGroup,
  MdDeliveryDining,
  MdAssignment,
  MdPayments,
  MdHistory,
  MdAnalytics,
  MdNotifications,
  MdSupportAgent,
  MdSettings,
  MdPublic,
  MdLocationOn,
} from 'react-icons/md';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [expandedSection, setExpandedSection] = useState(null);

  // Navigation items grouped by sections
  const navSections = [
    {
      id: 'overview',
      title: 'OVERVIEW',
      items: [
        {
          label: 'Dashboard',
          icon: MdDashboard,
          path: '/admin',
          badge: null,
        },
      ],
    },
    {
      id: 'operations',
      title: 'OPERATIONS',
      items: [
        {
          label: 'Assign Rider',
          icon: MdDeliveryDining,
          path: '/admin/assign-rider',
          badge: '12',
        },
        {
          label: 'Approve Riders',
          icon: MdAssignment,
          path: '/admin/approve-riders',
          badge: '5',
        },
        {
          label: 'Manage Users',
          icon: MdGroup,
          path: '/admin/users',
          badge: null,
        },
        {
          label: 'All Parcels',
          icon: MdDeliveryDining,
          path: '/admin/parcels',
          badge: '249',
        },
      ],
    },
    {
      id: 'finance',
      title: 'FINANCE',
      items: [
        {
          label: 'All Payments',
          icon: MdPayments,
          path: '/admin/payments',
          badge: null,
        },
        {
          label: 'Payment History',
          icon: MdHistory,
          path: '/admin/payments-history',
          badge: null,
        },
        {
          label: 'Reports & Analytics',
          icon: MdAnalytics,
          path: '/admin/reports',
          badge: null,
        },
      ],
    },
    {
      id: 'system',
      title: 'SYSTEM',
      items: [
        {
          label: 'Notifications',
          icon: MdNotifications,
          path: '/admin/notifications',
          badge: '7',
        },
        {
          label: 'Support Tickets',
          icon: MdSupportAgent,
          path: '/admin/support-tickets',
          badge: '3',
        },
        {
          label: 'Settings',
          icon: MdSettings,
          path: '/admin/settings',
          badge: null,
        },
      ],
    },
    {
      id: 'zone-control',
      title: 'ZONE CONTROL',
      items: [
        {
          label: 'Zone Manager',
          icon: MdPublic,
          path: '/admin/zone-manager',
          badge: null,
        },
        {
          label: 'Live Tracking',
          icon: MdLocationOn,
          path: '/admin/live-tracking',
          badge: null,
        },
      ],
    },
  ];

  const isActive = (path) => location.pathname === path;

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    return (
      <NavLink
        to={item.path}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${
          active
            ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg shadow-emerald-500/50'
            : 'text-gray-300 hover:text-white hover:bg-slate-700/50'
        }`}
      >
        {/* Glow effect for active items */}
        {active && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 blur-xl -z-10 animate-pulse" />
        )}

        {/* Icon */}
        <Icon className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />

        {/* Label */}
        <span className={`text-sm flex-1 transition-all duration-300 ${active ? 'font-bold text-white' : 'font-semibold text-gray-300 group-hover:text-white group-hover:translate-x-0.5'}`}>
          {item.label}
        </span>

        {/* Badge */}
        {item.badge && (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
              active
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 group-hover:bg-emerald-500/30'
            }`}
          >
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  const SectionTitle = ({ title }) => (
    <div className="px-4 py-3 mt-2 first:mt-0">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest letter-spacing">
        {title}
      </h3>
    </div>
  );

  return (
    <div
      className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl transform transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } overflow-y-auto`}
    >
      {/* Header */}
      <div className="sticky top-0 bg-gradient-to-b from-slate-900 via-slate-800/95 to-slate-800/50 backdrop-blur-sm p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                className="w-6 h-6"
              >
                <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2l-4 4v-4z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">ProFast</h1>
              <p className="text-xs text-emerald-400 font-medium">Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-1">
        {navSections.map((section) => (
          <div key={section.id}>
            <SectionTitle title={section.title} />
            <div className="space-y-1.5">
              {section.items.map((item) => (
                <div key={item.path} onClick={onClose}>
                  <NavItem item={item} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="sticky bottom-0 bg-gradient-to-t from-slate-900 via-slate-800/50 to-transparent p-4 border-t border-slate-700/30 mt-auto">
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-3 text-xs text-slate-300 text-center">
          <p className="font-medium text-emerald-400 mb-1">Admin Dashboard</p>
          <p>v1.0 • ProFast Logistics</p>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
