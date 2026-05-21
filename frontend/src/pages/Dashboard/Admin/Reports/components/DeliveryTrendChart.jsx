import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium flex justify-between gap-4">
            <span>{entry.name}:</span>
            <span>{entry.value?.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomLegend = (props) => {
  const { payload } = props;
  return (
    <div className="flex justify-center flex-wrap gap-6 pt-4">
      {payload?.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full shadow-sm"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-700">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const DeliveryTrendChart = ({ data = [], isTransitioning = false }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Delivery Trend</h3>
        <p className="text-sm text-gray-500">Parcel delivery overview</p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-60' : 'opacity-100'}`}
        >
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
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
            strokeDasharray="3 3" 
            stroke="#e5e7eb" 
            vertical={false}
          />
          <XAxis 
            dataKey="date" 
            stroke="#6b7280"
            style={{ fontSize: '12px', fontWeight: 500 }}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
            allowDecimals={false}
          />
          <Tooltip content={CustomTooltip} />
          <Legend content={CustomLegend} />
          
          <Area
            type="monotone"
            dataKey="total"
            stroke="#3B82F6"
            strokeWidth={3}
            fill="url(#colorTotal)"
            dot={false}
            activeDot={{ r: 6, fill: '#3B82F6', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={800}
            name="Total"
          />
          <Area
            type="monotone"
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
          <Area
            type="monotone"
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
          <Area
            type="monotone"
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
  );
};

export default DeliveryTrendChart;
