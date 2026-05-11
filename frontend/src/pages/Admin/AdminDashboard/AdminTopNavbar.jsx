import React, { useState } from 'react';
import { MdSearch, MdNotifications, MdLogout } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import useLogout from '../../../hooks/useLogout';

const AdminTopNavbar = ({ userProfile, unreadNotifications = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const logout = useLogout();

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      setIsSearching(true);
      // Search will be handled by TanStack Query in parent component
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Left - Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <MdSearch className="absolute left-3 top-3 text-gray-400 text-lg" />
            <input
              type="text"
              placeholder="Search parcels, riders, users, transactions..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Right - Notifications & Profile */}
        <div className="flex items-center gap-6 ml-6">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
            <MdNotifications className="text-2xl text-gray-600" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {userProfile?.fullName || 'Admin'}
              </p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold">
              {userProfile?.fullName?.charAt(0) || 'A'}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-lg transition text-red-600"
            title="Logout"
          >
            <MdLogout className="text-2xl" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminTopNavbar;
