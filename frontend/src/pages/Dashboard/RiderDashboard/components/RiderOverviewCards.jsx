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
      gradient: 'from-blue-500 to-cyan-600',
      trend: '+2 from last week'
    },
    {
      id: 2,
      label: 'Pending Pickups',
      value: stats.pendingPickups || 0,
      subtext: 'Awaiting pickup',
      icon: '🔔',
      gradient: 'from-amber-500 to-orange-500',
      trend: 'Ready to pick'
    },
    {
      id: 3,
      label: 'Completed Today',
      value: stats.completedToday || 0,
      subtext: 'Deliveries done',
      icon: '✅',
      gradient: 'from-emerald-500 to-green-600',
      trend: 'Great progress!'
    },
    {
      id: 4,
      label: "Today's Earnings",
      value: `৳${(stats.todayEarnings || 0).toLocaleString()}`,
      subtext: 'Commission earned',
      icon: '💰',
      gradient: 'from-purple-500 to-pink-600',
      trend: 'Keep it up!'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`bg-gradient-to-br ${card.gradient} rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-semibold opacity-90 uppercase tracking-wider">{card.label}</p>
              <p className="text-3xl font-bold mt-2">
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm opacity-75"></span>
                ) : (
                  card.value
                )}
              </p>
            </div>
            <div className="text-3xl opacity-90">{card.icon}</div>
          </div>
          <div className="flex items-center justify-between text-xs opacity-80">
            <span>{card.subtext}</span>
            <span className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full font-semibold">
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
