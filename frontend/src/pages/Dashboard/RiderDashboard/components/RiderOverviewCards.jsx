import React from 'react';
import { MdTrendingUp } from 'react-icons/md';

const RiderOverviewCards = ({ stats = {}, isLoading }) => {
  const cards = [
    {
      id: 1,
      label: 'Assigned Deliveries',
      value: stats.assignedCount || 0,
      subtext: 'Active assignments',
      icon: '📦',
      color: 'blue',
      trend: '+2 from last week'
    },
    {
      id: 2,
      label: 'Pending Pickups',
      value: stats.pendingPickups || 0,
      subtext: 'Awaiting pickup',
      icon: '🔔',
      color: 'amber',
      trend: 'Ready to pick'
    },
    {
      id: 3,
      label: 'Completed Today',
      value: stats.completedToday || 0,
      subtext: 'Deliveries done',
      icon: '✅',
      color: 'green',
      trend: 'Great progress!'
    },
    {
      id: 4,
      label: "Today's Earnings",
      value: `৳${(stats.todayEarnings || 0).toLocaleString()}`,
      subtext: 'Commission earned',
      icon: '💰',
      color: 'purple',
      trend: 'Keep it up!'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.id}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  card.value
                )}
              </p>
            </div>
            <div className="text-3xl">{card.icon}</div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-600">{card.subtext}</span>
            <span className="text-green-600 font-medium flex items-center gap-1">
              <MdTrendingUp className="text-sm" />
              {card.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RiderOverviewCards;
