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

const AdminSidebar = ({ isOpen, onClose, isCollapsed = false, onToggleCollapse = () => {} }) => {
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
          label: 'Delivery Control',
          icon: MdDeliveryDining,
          path: '/admin/delivery-control',
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
        title={isCollapsed ? item.label : ''}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group relative overflow-hidden ${
          active
            ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white shadow-lg shadow-emerald-500/30'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        } ${isCollapsed ? 'justify-center' : ''}`}
      >
        {/* Glow effect for active items */}
        {active && (
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-teal-400/10 blur-xl -z-10 animate-pulse" />
        )}

        {/* Icon */}
        <Icon className={`w-5 h-5 transition-transform duration-300 flex-shrink-0 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />

        {/* Label - Hidden when collapsed */}
        {!isCollapsed && (
          <span className={`text-sm flex-1 transition-all duration-300 ${active ? 'font-bold text-white' : 'font-semibold text-gray-600 group-hover:text-gray-900 group-hover:translate-x-0.5'}`}>
            {item.label}
          </span>
        )}

        {/* Badge - Hidden when collapsed */}
        {!isCollapsed && item.badge && (
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold transition-all duration-300 ${
              active
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200 group-hover:bg-emerald-100'
            }`}
          >
            {item.badge}
          </span>
        )}
      </NavLink>
    );
  };

  const SectionTitle = ({ title }) => (
    !isCollapsed && (
      <div className="px-4 py-3 mt-2 first:mt-0">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest letter-spacing">
          {title}
        </h3>
      </div>
    )
  );

  return (
    <div
      className={`fixed md:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 shadow-md transform transition-all duration-300 md:translate-x-0 flex flex-col h-full overflow-hidden ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } ${isCollapsed ? 'w-20 md:w-20' : 'w-64 md:w-64'}`}
    >
      {/* Header */}
      <div className="bg-white p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/lg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-6 h-6"
                >
                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2l-4 4v-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">ProFast</h1>
                <p className="text-xs text-emerald-600 font-medium">Admin Panel</p>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-1 ml-auto">
            {isCollapsed ? (
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="w-5 h-5"
                >
                  <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2h-2l-4 4v-4z" />
                </svg>
              </div>
            ) : null}
            
            {/* Desktop Collapse Button */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${
                  isCollapsed ? 'rotate-180' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
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
      {!isCollapsed && (
        <div className="bg-white p-4 border-t border-gray-200 mt-auto flex-shrink-0">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 text-center">
            <p className="font-medium text-emerald-600 mb-1">Admin Dashboard</p>
            <p>v1.0 • ProFast Logistics</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSidebar;
