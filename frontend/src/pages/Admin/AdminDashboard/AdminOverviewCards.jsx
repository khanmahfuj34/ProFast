import React from 'react';
import { MdTrendingUp } from 'react-icons/md';

const AdminOverviewCards = ({ stats = {}, isLoading = false }) => {
  const cards = [
    {
      id: 1,
      label: 'Total Parcels',
      value: stats.totalParcels || 0,
      subtext: 'All time deliveries',
      icon: '📦',
      color: 'from-emerald-500 to-teal-600',
      trend: '+12% this month'
    },
    {
      id: 2,
      label: 'Pending Parcels',
      value: stats.pendingParcels || 0,
      subtext: 'Awaiting delivery',
      icon: '⏳',
      color: 'from-amber-500 to-orange-600',
      trend: '+5 today'
    },
    {
      id: 3,
      label: 'Delivered',
      value: stats.deliveredParcels || 0,
      subtext: 'Successfully completed',
      icon: '✓',
      color: 'from-green-500 to-emerald-600',
      trend: '+28 today'
    },
    {
      id: 4,
      label: 'Total Revenue',
      value: `৳${(stats.totalRevenue || 0).toLocaleString()}`,
      subtext: 'All time earnings',
      icon: '💰',
      color: 'from-blue-500 to-cyan-600',
      trend: '+8% this month'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.id}
          className={`bg-gradient-to-br ${card.color} rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
        >
          {isLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-white/20 rounded w-24"></div>
              <div className="h-8 bg-white/20 rounded w-16"></div>
              <div className="h-3 bg-white/20 rounded w-32"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">{card.icon}</div>
                <MdTrendingUp className="text-xl opacity-75" />
              </div>
              <p className="text-sm font-semibold opacity-90">{card.label}</p>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs opacity-75">{card.subtext}</p>
                <span className="text-xs font-semibold bg-white/20 px-2 py-1 rounded">
                  {card.trend}
                </span>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default AdminOverviewCards;
