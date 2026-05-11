import React, { useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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

const AdminAnalytics = ({ analyticsData = {}, isLoading = false, onFilterChange = null }) => {
  const [timeFilter, setTimeFilter] = useState('7d');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const deliveryTrendData = analyticsData.deliveryTrend || [];
  const parcelStatusData = analyticsData.parcelStatus || [];
  const revenueData = analyticsData.revenueByDay || [];

  const handleTimeFilterChange = useCallback((filter) => {
    setIsTransitioning(true);
    setTimeFilter(filter);
    
    // Call parent callback if provided for backend refetch
    if (onFilterChange) {
      onFilterChange(filter);
    }
    
    // Simulate transition
    setTimeout(() => setIsTransitioning(false), 300);
  }, [onFilterChange]);


  // Custom tooltip for modern look
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-100 backdrop-blur-sm">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
              {entry.name}: {entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom legend with animated indicators
  const CustomLegend = (props) => {
    const { payload } = props;
    return (
      <div className="flex justify-center gap-8 pt-4">
        {payload?.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 group cursor-pointer hover:scale-105 transition-transform">
            <div
              className="w-3 h-3 rounded-full shadow-sm"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-8 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 animate-pulse border border-gray-100">
          <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-48 mb-8"></div>
          <div className="h-80 bg-gradient-to-b from-gray-100 to-gray-50 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mb-8">
      {/* Time Filter Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {[
          { value: '7d', label: '7 Days' },
          { value: '30d', label: '30 Days' },
          { value: '3m', label: 'This Month' },
          { value: '1y', label: 'This Year' }
        ].map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleTimeFilterChange(filter.value)}
            className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
              timeFilter === filter.value
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
            }`}
            disabled={isTransitioning}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-8">
        {/* Delivery Trend Chart - Modern Analytics Style */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Delivery Trend</h3>
              <p className="text-sm text-gray-500 mt-1">Parcel delivery overview</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              {timeFilter === '7d' ? '7 Days' : timeFilter === '30d' ? '30 Days' : timeFilter === '3m' ? 'This Month' : 'This Year'}
            </span>
          </div>

          <ResponsiveContainer width="100%" height={400}>
            <AreaChart
              data={deliveryTrendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-60' : 'opacity-100'}`}
            >
              <defs>
                <linearGradient id="colorDelivered" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCancelled" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="0" 
                stroke="#f0f0f0" 
                vertical={false}
                style={{ opacity: 0.5 }}
              />
              <XAxis 
                dataKey="date" 
                stroke="#999"
                style={{ fontSize: '12px', fontWeight: 500 }}
                tick={{ fill: '#666' }}
              />
              <YAxis 
                stroke="#999"
                style={{ fontSize: '12px' }}
                tick={{ fill: '#666' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              
              {/* Delivered Line with Gradient */}
              <Area
                type="natural"
                dataKey="delivered"
                stroke="#10B981"
                strokeWidth={3}
                fill="url(#colorDelivered)"
                dot={false}
                activeDot={{ r: 6, fill: '#10B981', strokeWidth: 2 }}
                isAnimationActive
                animationDuration={800}
                name="Delivered"
              />
              
              {/* Pending Line with Gradient */}
              <Area
                type="natural"
                dataKey="pending"
                stroke="#F59E0B"
                strokeWidth={3}
                fill="url(#colorPending)"
                dot={false}
                activeDot={{ r: 6, fill: '#F59E0B', strokeWidth: 2 }}
                isAnimationActive
                animationDuration={800}
                name="Pending"
              />
              
              {/* Cancelled Line with Gradient */}
              <Area
                type="natural"
                dataKey="cancelled"
                stroke="#EF4444"
                strokeWidth={3}
                fill="url(#colorCancelled)"
                dot={false}
                activeDot={{ r: 6, fill: '#EF4444', strokeWidth: 2 }}
                isAnimationActive
                animationDuration={800}
                name="Cancelled"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Two Column Layout for Other Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue by Day Chart */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Revenue by Day</h3>
              <p className="text-sm text-gray-500 mb-6">Daily revenue distribution</p>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="0" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#999"
                  style={{ fontSize: '12px', fontWeight: 500 }}
                  tick={{ fill: '#666' }}
                />
                <YAxis 
                  stroke="#999"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#666' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value) => [`৳${value.toLocaleString()}`, 'Revenue']}
                  labelStyle={{ color: '#1f2937' }}
                />
                <Bar 
                  dataKey="revenue" 
                  fill="url(#colorRevenue)" 
                  radius={[12, 12, 0, 0]}
                  isAnimationActive
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Parcel Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Status Distribution</h3>
              <p className="text-sm text-gray-500 mb-6">Parcel status breakdown</p>
            </div>
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
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                  isAnimationActive
                  animationDuration={800}
                >
                  {parcelStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `${value} parcels`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '12px',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
