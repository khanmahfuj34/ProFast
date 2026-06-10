import React from 'react';
import { MdStar, MdTrendingUp } from 'react-icons/md';

const AdminTopPerformingRiders = ({ riders = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-40 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700/50 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const topRiders = (riders || [])
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-colors duration-300">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">Top Performing Riders</h3>
      <div className="space-y-4">
        {topRiders.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8 transition-colors">No riders data available</p>
        ) : (
          topRiders.map((rider, index) => (
            <div
              key={rider._id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-lg hover:shadow-md transition-all duration-300 border border-transparent dark:border-gray-700/50"
            >
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 flex items-center justify-center text-white font-bold shadow-sm">
                  #{index + 1}
                </div>

                {/* Rider Info */}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 transition-colors">{rider.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors">
                    {rider.totalDeliveries || 0} deliveries • {rider.district}
                  </p>
                </div>
              </div>

              {/* Rating & Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <MdStar
                      key={i}
                      className={`text-lg transition-colors ${
                        i < Math.floor(rider.rating || 0)
                          ? 'text-amber-400 dark:text-amber-500'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-bold text-gray-900 dark:text-gray-100 transition-colors">{rider.rating || 0}</span>
                </div>

                {/* Online Status */}
                <div
                  className={`w-3 h-3 rounded-full shadow-sm transition-colors ${
                    rider.onlineStatus ? 'bg-green-500 dark:bg-green-400' : 'bg-gray-400 dark:bg-gray-500'
                  }`}
                  title={rider.onlineStatus ? 'Online' : 'Offline'}
                ></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTopPerformingRiders;
