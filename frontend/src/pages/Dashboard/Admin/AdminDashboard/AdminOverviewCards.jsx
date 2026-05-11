import React from 'react';
import { MdTrendingUp } from 'react-icons/md';

const AdminOverviewCards = ({ stats = {}, isLoading = false, error = null }) => {
  // Extract stats with fallback values
  const {
    totalParcels = 0,
    deliveredParcels = 0,
    pendingParcels = 0,
    totalRevenue = 0,
    activeRiders = 0,
    onlineRiders = 0,
    totalUsers = 0,
    cancelledParcels = 0,
    todayDeliveries = 0
  } = stats;

  // Calculate trends/metrics
  const deliveryRate = totalParcels > 0 ? Math.round((deliveredParcels / totalParcels) * 100) : 0;
  const avgParcelValue = totalParcels > 0 ? Math.round(totalRevenue / deliveredParcels) || 0 : 0;

  const cards = [
    {
      id: 1,
      label: 'Total Parcels',
      value: totalParcels.toLocaleString(),
      subtext: 'All time shipments',
      icon: '📦',
      color: 'from-emerald-500 to-teal-600',
      trend: `${deliveryRate}% delivered`,
      change: 'positive'
    },
    {
      id: 2,
      label: 'Pending Parcels',
      value: pendingParcels.toLocaleString(),
      subtext: 'Awaiting delivery',
      icon: '⏳',
      color: 'from-amber-500 to-orange-600',
      trend: `${todayDeliveries} delivered today`,
      change: 'neutral'
    },
    {
      id: 3,
      label: 'Delivered',
      value: deliveredParcels.toLocaleString(),
      subtext: 'Successfully completed',
      icon: '✓',
      color: 'from-green-500 to-emerald-600',
      trend: `${cancelledParcels} cancelled`,
      change: 'positive'
    },
    {
      id: 4,
      label: 'Total Revenue',
      value: `৳${totalRevenue.toLocaleString()}`,
      subtext: 'All time earnings',
      icon: '💰',
      color: 'from-blue-500 to-cyan-600',
      trend: `৳${avgParcelValue}/avg`,
      change: 'positive'
    },
    {
      id: 5,
      label: 'Active Riders',
      value: activeRiders.toLocaleString(),
      subtext: 'Currently delivering',
      icon: '🏍️',
      color: 'from-purple-500 to-pink-600',
      trend: `${onlineRiders} online`,
      change: 'positive'
    },
    {
      id: 6,
      label: 'Total Users',
      value: totalUsers.toLocaleString(),
      subtext: 'Registered customers',
      icon: '👥',
      color: 'from-indigo-500 to-blue-600',
      trend: 'Active members',
      change: 'positive'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {error && (
        <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error loading dashboard stats</p>
          <p className="text-red-600 text-sm mt-1">{error?.message}</p>
        </div>
      )}
      
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
              <div className="h-3 bg-white/20 rounded w-20"></div>
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
                <span className={`text-xs font-semibold px-2 py-1 rounded ${
                  card.change === 'positive' ? 'bg-white/20' : 'bg-white/10'
                }`}>
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
