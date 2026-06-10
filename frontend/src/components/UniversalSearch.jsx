import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../hooks/useAxiosSecure';
import { MdSearch, MdClose } from 'react-icons/md';
import { FiPackage, FiCreditCard } from 'react-icons/fi';

const UniversalSearch = ({ isMobileHidden = false }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const response = await axiosSecure.get(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(response.data);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [query, axiosSecure]);

  const handleResultClick = (result) => {
    setShowDropdown(false);
    setQuery('');
    
    if (result.type === 'parcel') {
      navigate(`/dashboard/track-parcel?id=${result.id}`);
    } else if (result.type === 'payment') {
      navigate('/dashboard/payment-history');
    }
  };

  return (
    <div className={`form-control ${isMobileHidden ? 'hidden sm:block' : ''}`} ref={dropdownRef}>
      <div className="relative">
        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search IDs, Phones..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (query.trim()) setShowDropdown(true); }}
          className="w-56 lg:w-72 pl-9 pr-8 py-1.5 text-sm bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 rounded-full transition-all"
        />
        {query && (
          <button 
            onClick={() => { setQuery(''); setShowDropdown(false); }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <MdClose className="h-4 w-4" />
          </button>
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full mt-2 w-full lg:w-80 right-0 sm:left-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden z-50">
            {isSearching ? (
              <div className="p-4 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="w-5 h-5 border-2 border-lime-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                <span className="text-sm">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-80 overflow-y-auto">
                {results.map((result, idx) => (
                  <button
                    key={`${result.type}-${result.id}-${idx}`}
                    onClick={() => handleResultClick(result)}
                    className="w-full text-left p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700/50 last:border-0 transition-colors flex items-start gap-3"
                  >
                    <div className="mt-1">
                      {result.type === 'parcel' ? (
                        <FiPackage className="text-lime-500 text-lg" />
                      ) : (
                        <FiCreditCard className="text-blue-500 text-lg" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {result.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No matching records found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UniversalSearch;
