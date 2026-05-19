import React from 'react';
import { MdSearch, MdFilterList } from 'react-icons/md';

const tabs = [
  'All Requests',
  'Pending Acceptance',
  'Accepted',
  'Picked Up',
  'On The Way',
  'Delivered',
  'Cancelled'
];

const FiltersBar = ({ 
  activeTab, setActiveTab, 
  searchQuery, setSearchQuery,
  districtFilter, setDistrictFilter,
  statusFilter, setStatusFilter,
  paymentFilter, setPaymentFilter
}) => {
  return (
    <div className="flex flex-col border-b border-slate-200 dark:border-slate-800">
      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide px-4 pt-4 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex space-x-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 p-4 items-center bg-white dark:bg-slate-900">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Tracking ID, Receiver, Sender..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto">
          <select 
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
          >
            <option value="All">All District</option>
            <option value="Dhaka">Dhaka</option>
            <option value="Chittagong">Chittagong</option>
            {/* Can make dynamic based on unique districts in requests */}
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
          >
            <option value="All">All Status</option>
            <option value="pending">Pending</option>
            <option value="driver_accepted">Accepted</option>
            <option value="picked-up">Picked Up</option>
            <option value="on_the_way">On The Way</option>
            <option value="delivered">Delivered</option>
          </select>

          <select 
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
          >
            <option value="All">All Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-650 rounded-lg text-sm font-semibold transition-colors">
            <MdFilterList className="w-4 h-4 text-slate-650 dark:text-slate-300" />
            Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
