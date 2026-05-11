import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdNotifications, MdLogout } from 'react-icons/md';

const RiderTopNavbar = ({ user, userProfile, isOnline, setIsOnline }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search handler
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    // Simulate search delay
    const timer = setTimeout(() => {
      // Mock search results - replace with actual API call
      const mockResults = [
        { type: 'Parcel', title: `TRK-${query}001`, subtitle: 'Tracking ID' },
        { type: 'Zone', title: 'Dhaka Center', subtitle: 'Delivery Zone' },
      ];
      setSearchResults(mockResults);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Search Bar */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search parcels, zones, tracking IDs..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-10">
                  {searchResults.map((result, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{result.title}</p>
                          <p className="text-xs text-gray-500">{result.subtitle}</p>
                        </div>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">{result.type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            {/* Notification */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">
              <MdNotifications className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            {/* Online/Offline Toggle */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium text-gray-700">{isOnline ? 'Online' : 'Offline'}</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {userProfile?.fullName?.charAt(0) || 'R'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{userProfile?.fullName || 'Rider'}</p>
                <p className="text-xs text-gray-500">Rider</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default RiderTopNavbar;
