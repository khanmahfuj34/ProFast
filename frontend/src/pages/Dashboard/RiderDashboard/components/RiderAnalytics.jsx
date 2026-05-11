import React, { useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RiderAnalytics = ({ analyticsData = {}, isLoading }) => {
  const [timeFilter, setTimeFilter] = useState('7D');

  // Mock data for charts
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

  return (
    <div className="space-y-6">
      {/* Time Filter */}
      <div className="flex gap-2">
        {['7D', '30D', '3M', '1Y'].map((filter) => (
          <button
            key={filter}
            onClick={() => setTimeFilter(filter)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
              timeFilter === filter
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Delivery Trend Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Delivery Trend</h3>
        {isLoading ? (
          <div className="flex justify-center h-64">
            <span className="loading loading-spinner loading-lg text-emerald-500"></span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={deliveryTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="deliveries" stroke="#10B981" strokeWidth={2} name="Deliveries" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Earnings Overview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Earnings Overview</h3>
        {isLoading ? (
          <div className="flex justify-center h-64">
            <span className="loading loading-spinner loading-lg text-emerald-500"></span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={deliveryTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="earnings" fill="#3B82F6" name="Earnings (৳)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Parcel Status Distribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Parcel Status Distribution</h3>
        {isLoading ? (
          <div className="flex justify-center h-64">
            <span className="loading loading-spinner loading-lg text-emerald-500"></span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={parcelStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {parcelStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default RiderAnalytics;
