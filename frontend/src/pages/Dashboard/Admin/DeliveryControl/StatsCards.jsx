import React from 'react';
import { MdPendingActions, MdCheckCircle, MdDirectionsBike, MdLocalShipping, MdDoneAll, MdCancel } from 'react-icons/md';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, value, title, subtitle, colorClass, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-4 flex flex-col gap-3 shadow-lg hover:border-slate-600 transition-colors"
  >
    <div className="flex justify-between items-start">
      <div className={`p-2.5 rounded-lg bg-opacity-10 ${colorClass.bg} ${colorClass.text}`}>
        <Icon className="w-6 h-6" />
      </div>
      {/* Optional: Add small refresh icon or live dot here */}
    </div>
    
    <div>
      <div className="text-3xl font-bold text-white mb-1">{value || 0}</div>
      <div className="text-sm font-medium text-slate-300">{title}</div>
      <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>
    </div>
  </motion.div>
);

const StatsCards = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-800 animate-pulse rounded-xl border border-slate-700/50"></div>
        ))}
      </div>
    );
  }

  const cardData = [
    {
      icon: MdPendingActions,
      title: "Pending Acceptance",
      subtitle: "Waiting for rider",
      value: stats.pending,
      colorClass: { bg: 'bg-blue-500', text: 'text-blue-400' }
    },
    {
      icon: MdCheckCircle,
      title: "Accepted",
      subtitle: "Rider accepted",
      value: stats.accepted,
      colorClass: { bg: 'bg-emerald-500', text: 'text-emerald-400' }
    },
    {
      icon: MdDirectionsBike,
      title: "Picked Up",
      subtitle: "Parcel picked up",
      value: stats.pickedUp,
      colorClass: { bg: 'bg-purple-500', text: 'text-purple-400' }
    },
    {
      icon: MdLocalShipping,
      title: "On The Way",
      subtitle: "In delivery",
      value: stats.onTheWay,
      colorClass: { bg: 'bg-amber-500', text: 'text-amber-400' }
    },
    {
      icon: MdDoneAll,
      title: "Delivered Today",
      subtitle: "Successfully delivered",
      value: stats.deliveredToday,
      colorClass: { bg: 'bg-green-500', text: 'text-green-400' }
    },
    {
      icon: MdCancel,
      title: "Cancelled Today",
      subtitle: "Cancelled deliveries",
      value: stats.cancelledToday,
      colorClass: { bg: 'bg-red-500', text: 'text-red-400' }
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cardData.map((card, index) => (
        <StatCard key={card.title} {...card} index={index} />
      ))}
    </div>
  );
};

export default StatsCards;
