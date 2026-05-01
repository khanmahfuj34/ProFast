import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const DashboardLayout = () => {
    return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col bg-gray-50">
        {/* Professional Navbar */}
        <nav className="navbar bg-gradient-to-r from-slate-900 to-slate-800 shadow-lg sticky top-0 z-40">
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
              Dashboard
            </div>
          </div>

          <div className="flex-none gap-3">
            <div className="form-control hidden sm:block">
              <input
                type="text"
                placeholder="Search..."
                className="input input-sm input-bordered bg-slate-700 text-white placeholder-gray-400 border-slate-600"
              />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </div>

      {/* Professional Sidebar */}
      <div className="drawer-side is-drawer-close:overflow-visible">
        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>

        <div className="flex min-h-full flex-col items-start bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pt-0 w-64 is-drawer-close:w-14 is-drawer-open:w-64 transition-all duration-200">
          {/* Sidebar Header */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 is-drawer-open:p-6 is-drawer-close:p-3 border-b border-slate-700 w-full">
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
          </div>

          {/* Sidebar Menu */}
          <ul className="menu w-full grow space-y-2 p-4 is-drawer-close:p-2">
            {/* Homepage */}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                <span className="font-medium is-drawer-close:hidden">Homepage</span>
              </NavLink>
            </li>

            {/* My Parcels */}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <rect x="3" y="4" width="18" height="14" rx="2"></rect>
                  <polyline points="3 10 12 6 21 10"></polyline>
                  <line x1="3" y1="10" x2="9" y2="14"></line>
                  <line x1="21" y1="10" x2="15" y2="14"></line>
                  <line x1="12" y1="6" x2="12" y2="14"></line>
                </svg>
                <span className="font-medium is-drawer-close:hidden">My Parcels</span>
              </NavLink>
            </li>

            {/* Settings */}
            <li>
              <NavLink
                to="/settings"
                data-tip="Settings"
                className={({ isActive }) =>
                  `is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-lime-500 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-slate-700'
                  } is-drawer-close:px-0 is-drawer-close:justify-center`
                }
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeWidth="2"
                  fill="none"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M20 7h-9"></path>
                  <path d="M14 17H5"></path>
                  <circle cx="17" cy="17" r="3"></circle>
                  <circle cx="7" cy="7" r="3"></circle>
                </svg>
                <span className="font-medium is-drawer-close:hidden">Settings</span>
              </NavLink>
            </li>
          </ul>

          {/* Sidebar Footer */}
          <div className="mt-auto border-t border-slate-700 p-4 is-drawer-close:p-2 w-full">
            <button className="w-full btn btn-sm bg-lime-500 hover:bg-lime-600 text-white border-none rounded-lg transition-all duration-200 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
              >
                <path d="M18 2h-7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h7"></path>
                <path d="M10 12h10"></path>
                <path d="m18 8 4 4-4 4"></path>
              </svg>
              <span className="ml-2 is-drawer-close:hidden">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;