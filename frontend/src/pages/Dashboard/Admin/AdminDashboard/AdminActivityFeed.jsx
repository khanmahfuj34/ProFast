import React from 'react';
import {
  MdCheckCircle,
  MdAccessTime,
  MdClose,
  MdPersonAdd,
  MdAttachMoney,
  MdErrorOutline
} from 'react-icons/md';

const AdminActivityFeed = ({ activities = [], isLoading = false }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      delivery_completed: { icon: MdCheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
      rider_online: { icon: MdAccessTime, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
      payment_received: { icon: MdAttachMoney, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
      new_rider_application: { icon: MdPersonAdd, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
      delivery_failed: { icon: MdErrorOutline, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' }
    };
    return iconMap[type] || { icon: MdAccessTime, color: 'text-gray-500 dark:text-slate-400', bg: 'bg-gray-50 dark:bg-slate-700/40' };
  };

  const formatTime = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#0b1120] rounded-lg shadow-md p-6 border border-transparent dark:border-slate-700/60">
        <div className="h-8 bg-gray-200 dark:bg-slate-700/60 rounded w-32 mb-6 animate-pulse"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-10 h-10 bg-gray-200 dark:bg-slate-700/60 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-slate-700/60 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 dark:bg-slate-700/60 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0b1120] rounded-lg shadow-md p-6 border border-transparent dark:border-slate-700/60">
      <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100 mb-6">Recent Activity</h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-gray-500 dark:text-slate-500 text-center py-8">No recent activities</p>
        ) : (
          activities.map((activity) => {
            const { icon: IconComponent, color, bg } = getActivityIcon(activity.type);
            return (
              <div key={activity.id} className="flex gap-4 pb-4 border-b border-gray-100 dark:border-slate-700/40 last:border-b-0">
                <div className={`${bg} rounded-full p-2 h-fit`}>
                  <IconComponent className={`text-lg ${color}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-slate-200">{activity.title}</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{activity.description}</p>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{formatTime(activity.timestamp)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminActivityFeed;
