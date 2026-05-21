import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const RevenueChart = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Revenue by Day</h3>
        <p className="text-sm text-gray-500 mb-6">Daily revenue distribution</p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.9} />
              <stop offset="95%" stopColor="#059669" stopOpacity={0.7} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis 
            dataKey="day" 
            stroke="#6b7280"
            style={{ fontSize: '12px', fontWeight: 500 }}
            tick={{ fill: '#6b7280' }}
          />
          <YAxis 
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            tick={{ fill: '#6b7280' }}
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
            labelStyle={{ color: '#111827' }}
          />
          <Bar 
            dataKey="revenue" 
            fill="url(#colorRevenue)" 
            radius={[8, 8, 0, 0]}
            isAnimationActive
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
