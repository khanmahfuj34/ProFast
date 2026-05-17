import React, { useEffect } from 'react';
import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useLogout from '../hooks/useLogout';
import { useNotifications } from '../contexts/NotificationContext';
import logo from '../assets/logo.png';
import useRiderStatus from '../hooks/useRiderStatus';

import { RiTaskLine, RiCustomerService2Line } from 'react-icons/ri';

const DashboardLayout = () => {
  const { user, isAdmin, userProfile, loading } = useAuth();
  const isRider = userProfile?.role === 'rider';
  const { handleLogout, isLoading: isLoggingOut } = useLogout();
  const location = useLocation();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const { isOnline, toggleStatus, isLoading: statusLoading } = useRiderStatus();

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
    return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col bg-gray-50">
        {/* Professional Navbar */}
        <nav className="navbar bg-linear-to-r from-slate-900 to-slate-800 shadow-lg sticky top-0 z-40">
          <div className="flex-1">
            <label
              htmlFor="my-drawer-4"
              aria-label="open sidebar"
              className="btn btn-square btn-ghost btn-lg text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2"
                fill="none"
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                <path d="M9 4v16"></path>
                <path d="M14 10l2 2l-2 2"></path>
              </svg>
            </label>

            <div className="px-4 text-2xl font-bold text-white flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-lime-500"
              >
                <path d="M6 2a1 1 0 00-1 1v2H3a1 1 0 000 2h1v2H3a1 1 0 000 2h1v2H3a1 1 0 000 2h1v3a1 1 0 001 1h2v1a1 1 0 002 0v-1h2v1a1 1 0 002 0v-1h2v1a1 1 0 002 0v-1h3a1 1 0 001-1v-3h1a1 1 0 000-2h-1v-2h1a1 1 0 000-2h-1V7h1a1 1 0 000-2h-1V3a1 1 0 000-2h-2a1 1 0 00-1 1v1H9V3a1 1 0 00-1-1H6z"></path>
              </svg>
              {isRider ? 'Rider Dashboard' : 'Dashboard'}
            </div>
          </div>

          {!isRider && (
            <div className="flex-none gap-3">
              <div className="form-control hidden sm:block">
                <input
                  type="text"
                  placeholder="Search..."
                  className="input input-sm input-bordered bg-slate-700 text-white placeholder-gray-400 border-slate-600"
                />
              </div>
            </div>
          )}
          
          {/* Rider Status Toggle */}
          {isRider && (
            <div className="flex-none gap-4 px-4 mr-4">
              <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-1.5 rounded-full border border-slate-700/50">
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
                
                <div className="h-4 w-px bg-slate-700"></div>

                <label className="relative inline-flex items-center cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={isOnline}
                    onChange={toggleStatus}
                    disabled={statusLoading}
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500 group-hover:scale-105 transition-transform"></div>
                </label>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>

      {/* Professional Sidebar */}
      <div className="drawer-side is-drawer-close:overflow-visible">
        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>

        <div className="flex min-h-full flex-col items-start bg-linear-to-b from-slate-900 via-slate-800 to-slate-900 pt-0 w-64 is-drawer-close:w-14 is-drawer-open:w-64 transition-all duration-200">
          {/* Sidebar Header */}
          <div className="bg-linear-to-r from-slate-900 to-slate-800 p-4 is-drawer-open:p-6 is-drawer-close:p-3 border-b border-slate-700 w-full">
            {isRider ? (
              <div className="flex items-center gap-3 is-drawer-close:hidden">
                <img src={logo} alt="ProFast Logo" className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <p className="text-lg font-bold text-white leading-tight">ProFast</p>
                  <p className="text-xs text-slate-400">Rider Panel</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-lime-500"
                >
                  <path d="M6 2a1 1 0 00-1 1v2H3a1 1 0 000 2h1v2H3a1 1 0 000 2h1v2H3a1 1 0 000 2h1v3a1 1 0 001 1h2v1a1 1 0 002 0v-1h2v1a1 1 0 002 0v-1h2v1a1 1 0 002 0v-1h3a1 1 0 001-1v-3h1a1 1 0 000-2h-1v-2h1a1 1 0 000-2h-1V7h1a1 1 0 000-2h-1V3a1 1 0 000-2h-2a1 1 0 00-1 1v1H9V3a1 1 0 00-1-1H6z"></path>
                </svg>
                <span className="text-lg font-bold text-white is-drawer-close:hidden">Menu</span>
              </div>
            )}
          </div>

          {/* Sidebar Menu */}
          <ul className="menu w-full grow space-y-1 p-4 is-drawer-close:p-2">
            {!isRider && (
              <li>
                <NavLink
                  to="/"
                  data-tip="Homepage"
                  className={({ isActive }) =>
                    `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-lime-500 text-white shadow-lg'
                        : 'text-gray-300 hover:bg-slate-700'
                    } is-drawer-close:px-0 is-drawer-close:justify-center`
                  }
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                    <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                    <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  </svg>
                  <span className="font-medium is-drawer-close:hidden">Homepage</span>
                </NavLink>
              </li>
            )}

            {isRider && (
              <>
                <li className="is-drawer-close:hidden">
                  <span className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                    Main
                  </span>
                </li>
                <li>
                  <Link
                    to="/"
                    data-tip="Homepage"
                    className="is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-slate-700 is-drawer-close:px-0 is-drawer-close:justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span className="font-medium is-drawer-close:hidden">Homepage</span>
                  </Link>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/rider-dashboard"
                    data-tip="Dashboard"
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-slate-700'
                      } is-drawer-close:px-0 is-drawer-close:justify-center`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                    <span className="font-medium is-drawer-close:hidden">Dashboard</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/rider/parcel-requests"
                    data-tip="Parcel Requests"
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-slate-700'
                      } is-drawer-close:px-0 is-drawer-close:justify-center`
                    }
                  >
                    <div className="relative">
                      <RiTaskLine className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                    </div>
                    <span className="font-medium is-drawer-close:hidden flex-1">Parcel Requests</span>
                    <span className="is-drawer-close:hidden px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-black rounded-full border border-blue-500/30">
                      LIVE
                    </span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/assigned-deliveries"
                    data-tip="Assigned Deliveries"
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-slate-700'
                      } is-drawer-close:px-0 is-drawer-close:justify-center`
                    }
                  >
                    <RiTaskLine className="w-5 h-5" />
                    <span className="font-medium is-drawer-close:hidden flex-1">Assigned Deliveries</span>
                    <span className="is-drawer-close:hidden px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/30">3</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/delivery-history"
                    data-tip="Delivery History"
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-slate-700'
                      } is-drawer-close:px-0 is-drawer-close:justify-center`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <span className="font-medium is-drawer-close:hidden">Delivery History</span>
                  </NavLink>
                </li>

                <li className="is-drawer-close:hidden mt-4">
                  <span className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest pointer-events-none">
                    Finance
                  </span>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/rider-dashboard"
                    data-tip="Earnings"
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-slate-700'
                      } is-drawer-close:px-0 is-drawer-close:justify-center`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span className="font-medium is-drawer-close:hidden">Earnings</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/settings"
                    data-tip="Settings"
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-slate-700'
                      } is-drawer-close:px-0 is-drawer-close:justify-center`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path d="M20 7h-9"></path>
                      <path d="M14 17H5"></path>
                      <circle cx="17" cy="17" r="3"></circle>
                      <circle cx="7" cy="7" r="3"></circle>
                    </svg>
                    <span className="font-medium is-drawer-close:hidden">Settings</span>
                  </NavLink>
                </li>
              </>
            )}

            {!isRider && (
              <>
                <li>
                  <NavLink
                    to="/dashboard/my-parcels"
                    data-tip="My Parcels"
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-lime-500 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-slate-700'
                      } is-drawer-close:px-0 is-drawer-close:justify-center`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                      <rect x="3" y="4" width="18" height="14" rx="2"></rect>
                      <polyline points="3 10 12 6 21 10"></polyline>
                      <line x1="3" y1="10" x2="9" y2="14"></line>
                      <line x1="21" y1="10" x2="15" y2="14"></line>
                      <line x1="12" y1="6" x2="12" y2="14"></line>
                    </svg>
                    <span className="font-medium is-drawer-close:hidden">{isAdmin ? '📦 All Parcels' : 'My Parcels'}</span>
                  </NavLink>
                </li>

                {!isAdmin && (
                  <li>
                    <NavLink
                      to="/dashboard/track-parcel"
                      data-tip="Track Parcel"
                      className={({ isActive }) =>
                        `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-lime-500 text-white shadow-lg'
                            : 'text-gray-300 hover:bg-slate-700'
                        } is-drawer-close:px-0 is-drawer-close:justify-center`
                      }
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                        <circle cx="12" cy="12" r="10"></circle>
                        <circle cx="12" cy="12" r="3"></circle>
                        <line x1="12" y1="2" x2="12" y2="5"></line>
                        <line x1="12" y1="19" x2="12" y2="22"></line>
                        <line x1="2" y1="12" x2="5" y2="12"></line>
                        <line x1="19" y1="12" x2="22" y2="12"></line>
                      </svg>
                      <span className="font-medium is-drawer-close:hidden">Track Parcel</span>
                    </NavLink>
                  </li>
                )}

                <li>
                  <NavLink
                    to="/dashboard/payment-history"
                    data-tip="Payment History"
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-lime-500 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-slate-700'
                      } is-drawer-close:px-0 is-drawer-close:justify-center`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                      <circle cx="12" cy="12" r="1"></circle>
                      <circle cx="19" cy="12" r="1"></circle>
                      <circle cx="5" cy="12" r="1"></circle>
                      <rect x="3" y="5" width="18" height="14" rx="2"></rect>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span className="font-medium is-drawer-close:hidden">{isAdmin ? '💳 All Payments' : 'Payment History'}</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/notifications"
                    data-tip="Notifications"
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-lime-500 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-slate-700'
                      } is-drawer-close:px-0 is-drawer-close:justify-center`
                    }
                  >
                    <div className="relative">
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
                    <span className="font-medium is-drawer-close:hidden flex-1 text-left">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="is-drawer-close:hidden px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-black rounded-full border border-red-500/30 ml-auto">
                        NEW
                      </span>
                    )}
                  </NavLink>
                </li>

                {isAdmin && (
                  <>
                    <li>
                      <NavLink
                        to="/dashboard/ApproveRiders"
                        data-tip="Approve Riders"
                        className={({ isActive }) =>
                          `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-lime-500 text-white shadow-lg'
                              : 'text-gray-300 hover:bg-slate-700'
                          } is-drawer-close:px-0 is-drawer-close:justify-center`
                        }
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                          <path d="M12 5v14M5 12h14"></path>
                          <circle cx="12" cy="12" r="9"></circle>
                        </svg>
                        <span className="font-medium is-drawer-close:hidden">Approve Riders</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/dashboard/ManageUsers"
                        data-tip="Manage Users"
                        className={({ isActive }) =>
                          `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-lime-500 text-white shadow-lg'
                              : 'text-gray-300 hover:bg-slate-700'
                          } is-drawer-close:px-0 is-drawer-close:justify-center`
                        }
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <span className="font-medium is-drawer-close:hidden">Manage Users</span>
                      </NavLink>
                    </li>
                    <li>
                      <NavLink
                        to="/dashboard/assign-rider"
                        data-tip="Assign Rider to Delivery"
                        aria-label="Assign rider to parcel"
                        className={({ isActive }) =>
                          `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                            isActive
                              ? 'bg-lime-500 text-white shadow-lg'
                              : 'text-gray-300 hover:bg-slate-700'
                          } is-drawer-close:px-0 is-drawer-close:justify-center`
                        }
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                          <rect x="1" y="3" width="15" height="13"></rect>
                          <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                          <circle cx="5.5" cy="18.5" r="1.5"></circle>
                          <circle cx="18.5" cy="18.5" r="1.5"></circle>
                        </svg>
                        <span className="font-medium is-drawer-close:hidden">Assign Rider</span>
                      </NavLink>
                    </li>
                  </>
                )}

                <li>
                  <NavLink
                    to="/dashboard/support"
                    data-tip="Support & Assistance"
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-lime-500 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-slate-700'
                      } is-drawer-close:px-0 is-drawer-close:justify-center`
                    }
                  >
                    <RiCustomerService2Line className="w-5 h-5" />
                    <span className="font-medium is-drawer-close:hidden flex-1 text-left">Support & Help</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/settings"
                    data-tip="Settings"
                    className={({ isActive }) =>
                      `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        isActive
                          ? 'bg-lime-500 text-white shadow-lg'
                          : 'text-gray-300 hover:bg-slate-700'
                      } is-drawer-close:px-0 is-drawer-close:justify-center`
                    }
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="currentColor" className="w-5 h-5">
                      <path d="M20 7h-9"></path>
                      <path d="M14 17H5"></path>
                      <circle cx="17" cy="17" r="3"></circle>
                      <circle cx="7" cy="7" r="3"></circle>
                    </svg>
                    <span className="font-medium is-drawer-close:hidden">Settings</span>
                  </NavLink>
                </li>
              </>
            )}
          </ul>

          {/* Sidebar Footer */}
          <div className="mt-auto border-t border-slate-700 p-4 is-drawer-close:p-2 w-full">
            {isRider ? (
              <div className="is-drawer-close:hidden">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                    {userProfile?.displayName?.charAt(0)?.toUpperCase() || user?.displayName?.charAt(0)?.toUpperCase() || 'R'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {userProfile?.displayName || user?.displayName || 'Mahfuj'} Rider
                    </p>
                    <p className="text-xs text-slate-400">ID: RID-9823</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full btn btn-sm bg-slate-700 hover:bg-slate-600 text-slate-300 border-none rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span>
                      Logging out...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M18 2h-7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7"></path>
                        <path d="M10 12h10"></path>
                        <path d="m18 8 4 4-4 4"></path>
                      </svg>
                      <span className="ml-2">Logout</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full btn btn-sm bg-lime-500 hover:bg-lime-600 text-white border-none rounded-lg transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Logging out...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                      <path d="M18 2h-7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7"></path>
                      <path d="M10 12h10"></path>
                      <path d="m18 8 4 4-4 4"></path>
                    </svg>
                    <span className="ml-2 is-drawer-close:hidden">Logout</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;