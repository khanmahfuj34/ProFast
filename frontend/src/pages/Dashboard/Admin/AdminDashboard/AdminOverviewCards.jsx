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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {error && (
        <div className="col-span-full bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 font-semibold">Error loading dashboard stats</p>
          <p className="text-red-600 text-sm mt-1">{error?.message}</p>
        </div>
      )}
      
      {cards.map((card) => (
        <div
          key={card.id}
          className={`bg-gradient-to-br ${card.color} rounded-lg shadow-md p-4 lg:p-3.5 xl:p-4 text-white hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
        >
          {isLoading ? (
            <div className="animate-pulse space-y-2">
              <div className="h-3.5 bg-white/20 rounded w-20"></div>
              <div className="h-6 bg-white/20 rounded w-16"></div>
              <div className="h-2.5 bg-white/20 rounded w-28"></div>
              <div className="h-2.5 bg-white/20 rounded w-16"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-2xl">{card.icon}</div>
                <MdTrendingUp className="text-lg opacity-75 shrink-0" />
              </div>
              <p className="text-xs font-semibold opacity-90 truncate" title={card.label}>{card.label}</p>
              <p className="text-2xl lg:text-xl xl:text-2xl font-bold mt-1.5 truncate" title={card.value}>{card.value}</p>
              <div className="mt-2.5 flex flex-col sm:flex-row sm:items-center lg:flex-col xl:flex-row xl:items-center justify-between gap-1">
                <p className="text-[10px] sm:text-xs opacity-75 truncate" title={card.subtext}>{card.subtext}</p>
                <span className={`text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded whitespace-nowrap self-start sm:self-auto lg:self-start xl:self-auto ${
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
