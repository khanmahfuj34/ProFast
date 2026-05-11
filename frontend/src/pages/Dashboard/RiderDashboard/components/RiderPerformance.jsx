import React from 'react';
import { MdStar, MdTrendingUp } from 'react-icons/md';

const RiderPerformance = ({ performance = {}, isLoading }) => {
  const metrics = [
    {
      label: 'Success Rate',
      value: `${performance.successRate || 0}%`,
      target: '98%',
      color: 'bg-green-100',
      textColor: 'text-green-700',
      icon: '✅'
    },
    {
      label: 'Avg Delivery Time',
      value: `${performance.avgDeliveryTime || 0} min`,
      target: '< 30 min',
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
      icon: '⏱️'
    },
    {
      label: 'Customer Rating',
      value: `${performance.customerRating || 0}`,
      target: '/ 5.0',
      color: 'bg-yellow-100',
      textColor: 'text-yellow-700',
      icon: '⭐'
    },
    {
      label: 'Completed Today',
      value: `${performance.completedToday || 0}`,
      target: 'deliveries',
      color: 'bg-purple-100',
      textColor: 'text-purple-700',
      icon: '📦'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Your Performance</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <span className="loading loading-spinner loading-md text-blue-500"></span>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {metrics.map((metric, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric.color} text-lg`}>
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                    <p className="text-xs text-gray-500 mt-1">Target: {metric.target}</p>
                  </div>
                </div>
                <p className={`text-lg font-bold ${metric.textColor}`}>{metric.value}</p>
              </div>
              {/* Progress Bar */}
              <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${metric.color}`}
                  style={{
                    width: `${Math.min(
                      parseFloat(metric.value) / parseFloat(metric.target.split(' ')[0]) * 100,
                      100
                    )}%`
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderPerformance;
