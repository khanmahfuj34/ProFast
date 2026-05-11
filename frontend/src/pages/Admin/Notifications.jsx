import React from 'react';

const Notifications = () => {
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'New Order',
      message: 'Order #12345 has been placed by John Doe',
      time: '2 hours ago',
      icon: '✓',
    },
    {
      id: 2,
      type: 'warning',
      title: 'Pending Approval',
      message: '5 new riders awaiting approval',
      time: '4 hours ago',
      icon: '⚠',
    },
    {
      id: 3,
      type: 'info',
      title: 'System Update',
      message: 'Scheduled maintenance at 10:00 PM',
      time: '1 day ago',
      icon: 'ℹ',
    },
    {
      id: 4,
      type: 'error',
      title: 'Failed Delivery',
      message: 'Order #12340 delivery failed - Rider unavailable',
      time: '2 days ago',
      icon: '✕',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
        <p className="text-slate-400">Stay updated with system events and alerts</p>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="flex items-start gap-4 p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg hover:border-slate-500/50 transition-all"
            >
              <div
                className={`text-2xl p-2 rounded-lg ${
                  notif.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : notif.type === 'warning'
                    ? 'bg-amber-500/20 text-amber-400'
                    : notif.type === 'error'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-blue-500/20 text-blue-400'
                }`}
              >
                {notif.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold">{notif.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{notif.message}</p>
                <p className="text-slate-500 text-xs mt-2">{notif.time}</p>
              </div>
              <button className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-emerald-300 text-sm">
        <p>💡 Tip: Enable push notifications in settings to get real-time alerts</p>
      </div>
    </div>
  );
};

export default Notifications;
