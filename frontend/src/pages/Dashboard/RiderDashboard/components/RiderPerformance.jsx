import React from 'react';
import { MdStar, MdTrendingUp } from 'react-icons/md';

const RiderPerformance = ({ performance = {}, isLoading }) => {
  const metrics = [
    {
      label: 'Success Rate',
      value: `${performance.successRate || 0}%`,
      target: '98%',
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      textColor: 'text-green-700 dark:text-green-400',
      barColor: 'bg-green-500',
      icon: '✅'
    },
    {
      label: 'Avg Delivery Time',
      value: `${performance.avgDeliveryTime || 0} min`,
      target: '< 30 min',
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-700 dark:text-blue-400',
      barColor: 'bg-blue-500',
      icon: '⏱️'
    },
    {
      label: 'Customer Rating',
      value: `${performance.customerRating || 0}`,
      target: '/ 5.0',
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      textColor: 'text-yellow-700 dark:text-yellow-400',
      barColor: 'bg-yellow-500',
      icon: '⭐'
    },
    {
      label: 'Completed Today',
      value: `${performance.completedToday || 0}`,
      target: 'deliveries',
      iconBg: 'bg-purple-100 dark:bg-purple-900/30',
      textColor: 'text-purple-700 dark:text-purple-400',
      barColor: 'bg-purple-500',
      icon: '📦'
    }
  ];

  return (
    <div className="bg-white dark:bg-[#0b1120] rounded-xl border border-gray-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/60">
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Your Performance</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <span className="loading loading-spinner loading-md text-blue-500"></span>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-slate-700/60">
          {metrics.map((metric, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${metric.iconBg} text-lg`}>
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-slate-300">{metric.label}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">Target: {metric.target}</p>
                  </div>
                </div>
                <p className={`text-lg font-bold ${metric.textColor}`}>{metric.value}</p>
              </div>
              {/* Progress Bar */}
              <div className="mt-3 h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${metric.barColor} rounded-full transition-all duration-700`}
                  style={{
                    width: `${Math.min(
                      parseFloat(metric.value) / parseFloat(metric.target.split(' ')[0]) * 100 || 0,
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
