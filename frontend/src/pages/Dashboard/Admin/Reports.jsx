import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import RevenueChart from './Reports/components/RevenueChart';
import DeliveryTrendChart from './Reports/components/DeliveryTrendChart';
import StatusDistributionChart from './Reports/components/StatusDistributionChart';

const Reports = () => {
  const axiosSecure = useAxiosSecure();
  const [timeFilter, setTimeFilter] = useState('7d');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [activeFilter, setActiveFilter] = useState('7d'); // Which filter is currently fetching
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Fetch analytics data
  const { data: analyticsData = { deliveryTrend: [], parcelStatus: [], revenueByDay: [] }, isLoading, isFetching } = useQuery({
    queryKey: ['admin-reports-analytics', activeFilter, activeFilter === 'custom' ? customRange : null],
    queryFn: async () => {
      try {
        let url = `/admin/analytics?range=${activeFilter}`;
        if (activeFilter === 'custom' && customRange.start && customRange.end) {
          url += `&customStart=${customRange.start}&customEnd=${customRange.end}`;
        }
        const res = await axiosSecure.get(url);
        return res.data?.analytics || { deliveryTrend: [], parcelStatus: [], revenueByDay: [] };
      } catch (error) {
        console.error('Error fetching analytics reports:', error);
        return { deliveryTrend: [], parcelStatus: [], revenueByDay: [] };
      }
    },
    refetchInterval: 60000,
  });

  const handleTimeFilterChange = (filter) => {
    setIsTransitioning(true);
    setTimeFilter(filter);
    if (filter !== 'custom') {
      setActiveFilter(filter);
    }
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handleCustomApply = () => {
    if (customRange.start && customRange.end) {
      setIsTransitioning(true);
      setActiveFilter('custom');
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 p-6">
        <div className="bg-white rounded-2xl p-8 animate-pulse border border-gray-200 shadow-sm">
          <div className="h-8 bg-gray-200 rounded-lg w-48 mb-8"></div>
          <div className="h-80 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
        <p className="text-gray-500">View detailed analytics, revenue trends, and delivery performance</p>
      </div>

      {/* Date Filters */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex flex-wrap gap-3">
            {[
              { value: 'today', label: 'Today' },
              { value: '7d', label: '7 Days' },
              { value: '30d', label: '30 Days' },
              { value: '3m', label: 'This Month' },
              { value: '1y', label: 'This Year' },
              { value: 'custom', label: 'Custom Range' }
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => handleTimeFilterChange(filter.value)}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                  timeFilter === filter.value
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Custom Date Picker (shows only if 'custom' is selected) */}
          {timeFilter === 'custom' && (
            <div className="flex flex-wrap items-center gap-3 animate-fade-in-up">
              <input
                type="date"
                value={customRange.start}
                onChange={(e) => setCustomRange({ ...customRange, start: e.target.value })}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={customRange.end}
                onChange={(e) => setCustomRange({ ...customRange, end: e.target.value })}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <button
                onClick={handleCustomApply}
                disabled={!customRange.start || !customRange.end}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold rounded-lg transition-colors"
              >
                Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Analytics Indicator */}
      <div className="flex justify-end items-center">
        {isFetching && (
          <span className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full animate-pulse border border-emerald-100">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></span>
            Updating Real-Time...
          </span>
        )}
      </div>

      {/* Charts Area */}
      <div className={`space-y-8 transition-opacity duration-300 ${isTransitioning ? 'opacity-60' : 'opacity-100'}`}>
        {/* Full width Delivery Trend Chart */}
        <DeliveryTrendChart data={analyticsData.deliveryTrend} isTransitioning={isTransitioning} />

        {/* Two column grid for Revenue and Status Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RevenueChart data={analyticsData.revenueByDay} />
          <StatusDistributionChart data={analyticsData.parcelStatus} />
        </div>
      </div>
    </div>
  );
};

export default Reports;
