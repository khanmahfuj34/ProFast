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

const getNormalizedStatus = (req) => {
  const status = (req?.deliveryStatus || req?.status || '').toLowerCase();
  
  if (['pending', 'pending_rider', 'pending_rider_response', 'pending-pickup', 'awaiting-payment'].includes(status)) {
    return 'pending';
  }
  if (['accepted', 'driver_accepted', 'driver_assigned'].includes(status)) {
    return 'accepted';
  }
  if (['picked-up', 'picked_up'].includes(status)) {
    return 'picked_up';
  }
  if (status === 'on_the_way') {
    return 'on_the_way';
  }
  if (status === 'delivered') {
    return 'delivered';
  }
  if (status === 'cancelled') {
    return 'cancelled';
  }
  return status;
};

const FiltersBar = ({ 
  activeTab, setActiveTab, 
  searchQuery, setSearchQuery,
  districtFilter, setDistrictFilter,
  statusFilter, setStatusFilter,
  paymentFilter, setPaymentFilter,
  requests = []
}) => {
  const getTabCount = (tabName) => {
    switch (tabName) {
      case 'All Requests':
        return requests.length;
      case 'Pending Acceptance':
        return requests.filter(req => getNormalizedStatus(req) === 'pending').length;
      case 'Accepted':
        return requests.filter(req => getNormalizedStatus(req) === 'accepted').length;
      case 'Picked Up':
        return requests.filter(req => getNormalizedStatus(req) === 'picked_up').length;
      case 'On The Way':
        return requests.filter(req => getNormalizedStatus(req) === 'on_the_way').length;
      case 'Delivered':
        return requests.filter(req => getNormalizedStatus(req) === 'delivered').length;
      case 'Cancelled':
        return requests.filter(req => getNormalizedStatus(req) === 'cancelled').length;
      default:
        return 0;
    }
  };

  return (
    <div className="flex flex-col border-b border-slate-200">
      {/* Tabs */}
      <div className="flex overflow-x-auto scrollbar-hide px-4 pt-4 bg-slate-50/50">
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const count = getTabCount(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-semibold rounded-t-lg transition-all duration-200 whitespace-nowrap flex items-center gap-2 border-b-2 ${
                  activeTab === tab
                    ? 'bg-white text-emerald-600 border-emerald-500 shadow-sm'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                }`}
              >
                <span>{tab}</span>
                <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full transition-all duration-200 ${
                  activeTab === tab
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200/40'
                    : 'bg-slate-100 text-slate-500 border border-slate-200/20'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col md:flex-row gap-4 p-4 items-center bg-white">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by Tracking ID, Receiver, Sender..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto">
          <select 
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="All">All District</option>
            <option value="Dhaka">Dhaka</option>
            <option value="Chittagong">Chittagong</option>
            {/* Can make dynamic based on unique districts in requests */}
          </select>

          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
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
            className="bg-slate-50 border border-slate-300 rounded-lg px-4 py-2 text-sm text-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="All">All Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-sm font-semibold transition-colors">
            <MdFilterList className="w-4 h-4 text-slate-650" />
            Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FiltersBar;
