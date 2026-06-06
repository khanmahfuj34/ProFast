import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../../../contexts/ThemeContext';

const RiderAnalytics = ({ analyticsData = {}, isLoading }) => {
  const [timeFilter, setTimeFilter] = useState('7D');
  const { theme } = useTheme();

  // Detect effective dark mode
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const chartColors = {
    grid: isDark ? '#1e293b' : '#e5e7eb',
    axis: isDark ? '#94a3b8' : '#6b7280',
    tooltip: isDark ? { bg: '#0f172a', border: '#334155', color: '#f1f5f9' } : { bg: '#ffffff', border: '#e5e7eb', color: '#111827' },
  };

  // Mock chart data
  const deliveryTrendData = [
    { day: 'Mon', deliveries: 12, earnings: 2400 },
    { day: 'Tue', deliveries: 15, earnings: 2800 },
    { day: 'Wed', deliveries: 10, earnings: 1800 },
    { day: 'Thu', deliveries: 18, earnings: 3200 },
    { day: 'Fri', deliveries: 20, earnings: 3800 },
    { day: 'Sat', deliveries: 16, earnings: 2900 },
    { day: 'Sun', deliveries: 14, earnings: 2600 }
  ];

  const parcelStatusData = [
    { name: 'Delivered', value: 145, fill: '#10B981' },
    { name: 'On Way', value: 32, fill: '#3B82F6' },
    { name: 'Pending', value: 18, fill: '#F59E0B' },
    { name: 'Cancelled', value: 5, fill: '#EF4444' }
  ];

  const tooltipStyle = {
    backgroundColor: chartColors.tooltip.bg,
    border: `1px solid ${chartColors.tooltip.border}`,
    borderRadius: '10px',
    color: chartColors.tooltip.color,
  };

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      <div className="flex gap-2">
        {['7D', '30D', '3M', '1Y'].map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
              timeFilter === filter
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Delivery Trend Chart */}
      <div className="bg-white dark:bg-[#0b1120] rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">Delivery Trend</h3>
        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <span className="loading loading-spinner loading-lg text-emerald-500"></span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={deliveryTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="day" stroke={chartColors.axis} tick={{ fill: chartColors.axis }} />
              <YAxis stroke={chartColors.axis} tick={{ fill: chartColors.axis }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Line type="monotone" dataKey="deliveries" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4 }} name="Deliveries" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Earnings Overview */}
      <div className="bg-white dark:bg-[#0b1120] rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">Earnings Overview</h3>
        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <span className="loading loading-spinner loading-lg text-emerald-500"></span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={deliveryTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis dataKey="day" stroke={chartColors.axis} tick={{ fill: chartColors.axis }} />
              <YAxis stroke={chartColors.axis} tick={{ fill: chartColors.axis }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend />
              <Bar dataKey="earnings" fill="#3B82F6" name="Earnings (৳)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Parcel Status Distribution */}
      <div className="bg-white dark:bg-[#0b1120] rounded-xl border border-gray-200 dark:border-slate-700/60 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">Parcel Status Distribution</h3>
        {isLoading ? (
          <div className="flex justify-center h-64 items-center">
            <span className="loading loading-spinner loading-lg text-emerald-500"></span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={parcelStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                dataKey="value"
              >
                {parcelStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RiderAnalytics;
