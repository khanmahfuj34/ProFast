import React from 'react';
import { MdStar, MdTrendingUp } from 'react-icons/md';

const AdminTopPerformingRiders = ({ riders = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-8 bg-gray-200 rounded w-40 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const topRiders = (riders || [])
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Top Performing Riders</h3>
      <div className="space-y-4">
        {topRiders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No riders data available</p>
        ) : (
          topRiders.map((rider, index) => (
            <div
              key={rider._id}
              className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                  #{index + 1}
                </div>

                {/* Rider Info */}
                <div>
                  <p className="font-semibold text-gray-900">{rider.name}</p>
                  <p className="text-sm text-gray-600">
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
                      className={`text-lg ${
                        i < Math.floor(rider.rating || 0)
                          ? 'text-amber-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 font-bold text-gray-900">{rider.rating || 0}</span>
                </div>

                {/* Online Status */}
                <div
                  className={`w-3 h-3 rounded-full ${
                    rider.onlineStatus ? 'bg-green-500' : 'bg-gray-400'
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
