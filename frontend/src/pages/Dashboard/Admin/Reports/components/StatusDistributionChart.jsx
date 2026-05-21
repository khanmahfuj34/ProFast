import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const StatusDistributionChart = ({ data = [] }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-200 hover:shadow-md transition-shadow duration-300">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Status Distribution</h3>
        <p className="text-sm text-gray-500 mb-6">Parcel status breakdown</p>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
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
            {data.map((entry, index) => (
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
            itemStyle={{ color: '#111827' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusDistributionChart;
