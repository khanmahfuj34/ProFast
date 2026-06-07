import React, { useState, useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useLogout from '../hooks/useLogout';
import { useNotifications } from '../contexts/NotificationContext';
import logo from '../assets/logo.png';
import useRiderStatus from '../hooks/useRiderStatus';
import ThemeToggle from '../components/ThemeToggle';
import DashboardFooter from '../components/DashboardFooter';

import { RiTaskLine, RiCustomerService2Line } from 'react-icons/ri';

const DashboardLayout = () => {
  const { user, isAdmin, userProfile, loading } = useAuth();
  const isRider = userProfile?.role === 'rider';
  const { handleLogout, isLoading: isLoggingOut } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { isOnline, toggleStatus, isLoading: statusLoading } = useRiderStatus();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (loading) return;

    // Redirect admins to new admin layout
    if (isAdmin) {
      navigate('/admin', { replace: true });
      return;
    }

    if (location.pathname === '/dashboard' && isRider) {
      navigate('/dashboard/rider-dashboard', { replace: true });
    }
  }, [isAdmin, isRider, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <span className="loading loading-spinner loading-lg text-lime-500"></span>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 dark:bg-[#060a14] flex overflow-hidden font-sans">
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Responsive Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-[#0b1120] border-r border-slate-100 dark:border-slate-800/80 flex flex-col h-full shadow-xl transition-all duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'w-20' : 'w-64'}`}
      >
        {/* Sidebar Header */}
        <div className="bg-white dark:bg-[#0b1120] border-b border-slate-100 dark:border-slate-800/80 p-4 flex items-center justify-between h-[72px]">
          {sidebarCollapsed ? (
            <div className="mx-auto">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-8 h-8 text-lime-500"
              >
                <path d="M6 2a1 1 0 00-1 1v2H3a1 1 0 000 2h1v2H3a1 1 0 000 2h1v2H3a1 1 0 000 2h1v3a1 1 0 001 1h2v1a1 1 0 002 0v-1h2v1a1 1 0 002 0v-1h2v1a1 1 0 002 0v-1h3a1 1 0 001-1v-3h1a1 1 0 000-2h-1v-2h1a1 1 0 000-2h-1V7h1a1 1 0 000-2h-1V3a1 1 0 000-2h-2a1 1 0 00-1 1v1H9V3a1 1 0 00-1-1H6z"></path>
              </svg>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {isRider ? (
                <>
                  <img src={logo} alt="ProFast Logo" className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <p className="text-lg font-bold text-slate-800 dark:text-white leading-tight">ProFast</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Rider Panel</p>
                  </div>
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-6 h-6 text-lime-500"
                  >
                    <path d="M6 2a1 1 0 00-1 1v2H3a1 1 0 000 2h1v2H3a1 1 0 000 2h1v2H3a1 1 0 000 2h1v3a1 1 0 001 1h2v1a1 1 0 002 0v-1h2v1a1 1 0 002 0v-1h2v1a1 1 0 002 0v-1h3a1 1 0 001-1v-3h1a1 1 0 000-2h-1v-2h1a1 1 0 000-2h-1V7h1a1 1 0 000-2h-1V3a1 1 0 000-2h-2a1 1 0 00-1 1v1H9V3a1 1 0 00-1-1H6z"></path>
                  </svg>
                  <span className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider">Menu</span>
                </>
              )}
            </div>
          )}

          {/* Mobile close button */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Sidebar Menu */}
        <ul className="menu w-full grow space-y-1.5 p-4 overflow-y-auto scrollbar-none">
          {!isRider && (
            <li>
              <NavLink
                to="/"
                title={sidebarCollapsed ? "Homepage" : ""}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive ? 'bg-lime-500 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                  } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                }
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                {!sidebarCollapsed && <span className="font-medium">Homepage</span>}
              </NavLink>
            </li>
          )}

          {isRider && (
            <>
              {!sidebarCollapsed && (
                <li className="px-4 py-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                    Main
                  </span>
                </li>
              )}
              <li>
                <Link
                  to="/"
                  title={sidebarCollapsed ? "Homepage" : ""}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-slate-800 transition-all duration-200 ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  {!sidebarCollapsed && <span className="font-medium">Homepage</span>}
                </Link>
              </li>
              <li>
                <NavLink
                  to="/dashboard/rider-dashboard"
                  title={sidebarCollapsed ? "Dashboard" : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  {!sidebarCollapsed && <span className="font-medium">Dashboard</span>}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard/rider/parcel-requests"
                  title={sidebarCollapsed ? "Parcel Requests" : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <div className="relative flex-shrink-0">
                    <RiTaskLine className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium flex-1">Parcel Requests</span>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/30">
                        LIVE
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard/assigned-deliveries"
                  title={sidebarCollapsed ? "Assigned Deliveries" : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <RiTaskLine className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium flex-1">Assigned Deliveries</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">3</span>
                    </>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard/delivery-history"
                  title={sidebarCollapsed ? "Delivery History" : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  {!sidebarCollapsed && <span className="font-medium">Delivery History</span>}
                </NavLink>
              </li>

              {!sidebarCollapsed && (
                <li className="px-4 py-1 mt-4">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                    Finance
                  </span>
                </li>
              )}
              <li>
                <NavLink
                  to="/dashboard/rider/earnings"
                  title={sidebarCollapsed ? "Earnings" : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  {!sidebarCollapsed && <span className="font-medium">Earnings</span>}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard/notifications"
                  title={sidebarCollapsed ? "Notifications" : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <div className="relative flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-slate-900 animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium flex-1 text-left">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-black rounded-full border border-red-500/30">
                          NEW
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard/rider/settings"
                  title={sidebarCollapsed ? "Settings" : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path d="M20 7h-9"></path>
                    <path d="M14 17H5"></path>
                    <circle cx="17" cy="17" r="3"></circle>
                    <circle cx="7" cy="7" r="3"></circle>
                  </svg>
                  {!sidebarCollapsed && <span className="font-medium">Settings</span>}
                </NavLink>
              </li>
            </>
          )}

          {!isRider && (
            <>
              <li>
                <NavLink
                  to="/dashboard/my-parcels"
                  title={sidebarCollapsed ? (isAdmin ? "All Parcels" : "My Parcels") : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-lime-500 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                    <rect x="3" y="4" width="18" height="14" rx="2"></rect>
                    <polyline points="3 10 12 6 21 10"></polyline>
                    <line x1="3" y1="10" x2="9" y2="14"></line>
                    <line x1="21" y1="10" x2="15" y2="14"></line>
                    <line x1="12" y1="6" x2="12" y2="14"></line>
                  </svg>
                  {!sidebarCollapsed && <span className="font-medium">{isAdmin ? '📦 All Parcels' : 'My Parcels'}</span>}
                </NavLink>
              </li>

              {!isAdmin && (
                <li>
                  <NavLink
                    to="/dashboard/track-parcel"
                    title={sidebarCollapsed ? "Track Parcel" : ""}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive ? 'bg-lime-500 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                      } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                      <circle cx="12" cy="12" r="10"></circle>
                      <circle cx="12" cy="12" r="3"></circle>
                      <line x1="12" y1="2" x2="12" y2="5"></line>
                      <line x1="12" y1="19" x2="12" y2="22"></line>
                      <line x1="2" y1="12" x2="5" y2="12"></line>
                      <line x1="19" y1="12" x2="22" y2="12"></line>
                    </svg>
                    {!sidebarCollapsed && <span className="font-medium">Track Parcel</span>}
                  </NavLink>
                </li>
              )}

              <li>
                <NavLink
                  to="/dashboard/payment-history"
                  title={sidebarCollapsed ? (isAdmin ? "All Payments" : "Payment History") : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-lime-500 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                    <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  {!sidebarCollapsed && <span className="font-medium">{isAdmin ? '💳 All Payments' : 'Payment History'}</span>}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard/notifications"
                  title={sidebarCollapsed ? "Notifications" : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-lime-500 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <div className="relative flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-slate-900">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  {!sidebarCollapsed && (
                    <>
                      <span className="font-medium flex-1 text-left">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-black rounded-full border border-red-500/30">
                          NEW
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>

              {isAdmin && (
                <>
                  <li>
                    <NavLink
                      to="/dashboard/ApproveRiders"
                      title={sidebarCollapsed ? "Approve Riders" : ""}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive ? 'bg-lime-500 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                        } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                      }
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                        <path d="M12 5v14M5 12h14"></path>
                        <circle cx="12" cy="12" r="9"></circle>
                      </svg>
                      {!sidebarCollapsed && <span className="font-medium">Approve Riders</span>}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/dashboard/ManageUsers"
                      title={sidebarCollapsed ? "Manage Users" : ""}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive ? 'bg-lime-500 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                        } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                      }
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                      </svg>
                      {!sidebarCollapsed && <span className="font-medium">Manage Users</span>}
                    </NavLink>
                  </li>
                  <li>
                    <NavLink
                      to="/dashboard/assign-rider"
                      title={sidebarCollapsed ? "Assign Rider" : ""}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive ? 'bg-lime-500 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                        } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                      }
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0">
                        <rect x="1" y="3" width="15" height="13"></rect>
                        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                        <circle cx="5.5" cy="18.5" r="1.5"></circle>
                        <circle cx="18.5" cy="18.5" r="1.5"></circle>
                      </svg>
                      {!sidebarCollapsed && <span className="font-medium">Assign Rider</span>}
                    </NavLink>
                  </li>
                </>
              )}

              <li>
                <NavLink
                  to="/dashboard/support"
                  title={sidebarCollapsed ? "Support & Help" : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-lime-500 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <RiCustomerService2Line className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">Support & Help</span>}
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/dashboard/settings"
                  title={sidebarCollapsed ? "Settings" : ""}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive ? 'bg-lime-500 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'
                    } ${sidebarCollapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5 flex-shrink-0">
                    <path d="M20 7h-9"></path>
                    <path d="M14 17H5"></path>
                    <circle cx="17" cy="17" r="3"></circle>
                    <circle cx="7" cy="7" r="3"></circle>
                  </svg>
                  {!sidebarCollapsed && <span className="font-medium">Settings</span>}
                </NavLink>
              </li>
            </>
          )}
        </ul>

        {/* Sidebar Footer */}
        <div className="mt-auto border-t border-slate-100 dark:border-slate-800 p-4 w-full flex flex-col items-center">
          {sidebarCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm ${
                  isRider ? 'bg-emerald-600' : 'bg-lime-500'
                }`}
                title={userProfile?.displayName || user?.displayName || 'User'}
              >
                {userProfile?.displayName?.charAt(0)?.toUpperCase() || user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="p-2 bg-slate-100 hover:bg-red-600 dark:bg-slate-800 dark:hover:bg-red-600 text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-white border-none rounded-lg transition-all duration-200 flex items-center justify-center cursor-pointer disabled:opacity-50"
                title="Logout"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <path d="M18 2h-7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7"></path>
                  <path d="M10 12h10"></path>
                  <path d="m18 8 4 4-4 4"></path>
                </svg>
              </button>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${isRider ? 'bg-emerald-600' : 'bg-lime-500'}`}>
                  {userProfile?.displayName?.charAt(0)?.toUpperCase() || user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">
                    {userProfile?.displayName || user?.displayName || 'Mahfuj'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{isRider ? 'Rider Member' : 'User Member'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full btn btn-sm bg-slate-100 hover:bg-red-600 dark:bg-slate-800 dark:hover:bg-red-600 text-slate-600 dark:text-slate-300 hover:text-white dark:hover:text-white border-none rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoggingOut ? (
                  <>
                    <span className="loading loading-spinner loading-xs mr-2"></span>
                    Logging out...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 mr-2">
                      <path d="M18 2h-7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7"></path>
                      <path d="M10 12h10"></path>
                      <path d="m18 8 4 4-4 4"></path>
                    </svg>
                    <span>Logout</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Navbar */}
        <nav className="navbar bg-white dark:bg-[#0b1120] shadow-md sticky top-0 z-40 h-[72px] px-6 justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden btn btn-square btn-ghost text-slate-700 dark:text-white"
              title="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Desktop Sidebar Collapse Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-5 w-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div className="px-2 text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <span>{isRider ? 'Rider Dashboard' : 'Dashboard'}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            {!isRider && (
              <div className="form-control hidden sm:block">
                <input
                  type="text"
                  placeholder="Search..."
                  className="input input-sm input-bordered bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-gray-400 border-slate-200 dark:border-slate-700 focus:outline-none focus:border-lime-500 rounded-lg"
                />
              </div>
            )}

            {/* Rider Status Toggle */}
            {isRider && (
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_8px] ${
                    isOnline ? 'bg-lime-500 shadow-lime-500/50' : 'bg-red-500 shadow-red-500/50'
                  }`}></div>
                  <span className={`text-xs font-black uppercase tracking-wider ${
                    isOnline ? 'text-lime-500' : 'text-red-400'
                  }`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700"></div>

                <label className="relative inline-flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={isOnline}
                    onChange={toggleStatus}
                    disabled={statusLoading}
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500 group-hover:scale-105 transition-all"></div>
                </label>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="min-h-full flex flex-col justify-between">
            <div className="flex-1 pb-8">
              <Outlet />
            </div>
            <DashboardFooter role={userProfile?.role} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;