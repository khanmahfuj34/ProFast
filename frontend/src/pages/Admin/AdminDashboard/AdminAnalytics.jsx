import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const AdminAnalytics = ({ analyticsData = {}, isLoading = false }) => {
  const [timeFilter, setTimeFilter] = useState('7d');

  const deliveryTrendData = analyticsData.deliveryTrend || [];
  const parcelStatusData = analyticsData.parcelStatus || [];
  const revenueData = analyticsData.revenueByDay || [];

  const handleTimeFilterChange = (filter) => {
    setTimeFilter(filter);
    // In real implementation, this would refetch data with new time range
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="h-72 bg-gray-100 rounded"></div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="h-72 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mb-8">
      {/* Time Filter Buttons */}
      <div className="flex gap-3 justify-center">
        {['7d', '30d', '3m', '1y'].map((filter) => (
          <button
            key={filter}
            onClick={() => handleTimeFilterChange(filter)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              timeFilter === filter
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {filter === '7d'
              ? '7 Days'
              : filter === '30d'
              ? '30 Days'
              : filter === '3m'
              ? '3 Months'
              : '1 Year'}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Delivery Trend Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Delivery Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={deliveryTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}
                formatter={(value) => [`${value}`, 'Deliveries']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="deliveries"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Day Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Revenue by Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="day" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}
                formatter={(value) => [`৳${value.toLocaleString()}`, 'Revenue']}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Parcel Status Distribution */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Parcel Status Distribution</h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={parcelStatusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value, percent }) =>
                `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
              }
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {parcelStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => `${value} parcels`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdminAnalytics;
