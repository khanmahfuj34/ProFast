import React from 'react';
import { MdCheckCircle, MdAccessTime, MdClose } from 'react-icons/md';

const RiderActivityFeed = ({ activities = [], isLoading }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'delivered':
        return <MdCheckCircle className="text-green-600 dark:text-green-400 text-xl" />;
      case 'picked_up':
        return <MdAccessTime className="text-blue-600 dark:text-blue-400 text-xl" />;
      case 'cancelled':
        return <MdClose className="text-red-600 dark:text-red-400 text-xl" />;
      default:
        return <MdAccessTime className="text-gray-500 dark:text-slate-400 text-xl" />;
    }
  };

  const getActivityBg = (type) => {
    switch (type) {
      case 'delivered':
        return 'bg-green-100 dark:bg-green-900/30';
      case 'picked_up':
        return 'bg-blue-100 dark:bg-blue-900/30';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/30';
      default:
        return 'bg-gray-100 dark:bg-slate-700/50';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 60000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-[#0b1120] rounded-xl border border-gray-200 dark:border-slate-700/60 overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700/60">
        <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Recent Activity</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <span className="loading loading-spinner loading-md text-blue-500"></span>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📋</div>
          <p className="text-gray-600 dark:text-slate-400 font-medium">No recent activity</p>
          <p className="text-gray-500 dark:text-slate-500 text-sm mt-1">Your activity will appear here.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-slate-700/60 max-h-96 overflow-y-auto">
          {activities.map((activity, idx) => (
            <div key={idx} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
              <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getActivityBg(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-slate-200">{activity.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{activity.description}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-2">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RiderActivityFeed;
