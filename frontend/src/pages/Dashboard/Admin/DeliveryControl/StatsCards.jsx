import React from 'react';
import { MdPendingActions, MdCheckCircle, MdDirectionsBike, MdLocalShipping, MdDoneAll, MdCancel } from 'react-icons/md';
import { motion } from 'framer-motion';

const StatCard = ({ icon: Icon, value, title, subtitle, colorClass, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col gap-3 shadow-lg hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-7 min-w-37.5 sm:min-w-42.500 transition-all duration-300 min-w-[150px] sm:min-w-[170px] lg:min-w-0 flex-1 shrink-0"
  >
    <div className="flex justify-between items-start">
      <div className={`p-2.5 rounded-lg bg-opacity-10 dark:bg-opacity-20 ${colorClass.bg} ${colorClass.text}`}>
        <Icon className="w-6 h-6" />
      </div>
      {/* Optional: Add small refresh icon or live dot here */}
    </div>
    
    <div>
      <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{value || 0}</div>
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 truncate" title={title}>{title}</div>
      <div className="text-xs text-slate-500 dark:text-slate-450 mt-0.5 truncate" title={subtitle}>{subtitle}</div>
    </div>
  </motion.div>
);

const StatsCards = ({ stats, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex flex-row overflow-x-auto flex-nowrap lg:grid lg:grid-cols-6 gap-4 pb-3 w-full scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl border border-slate-200 dark:border-slate-800 min-w-37.5 sm:min-w-42.5 lg:min-w-0 flex-1 shrink-0"></div>
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
      colorClass: { bg: 'bg-blue-500', text: 'text-blue-450' }
    },
    {
      icon: MdCheckCircle,
      title: "Accepted",
      subtitle: "Rider accepted",
      value: stats.accepted,
      colorClass: { bg: 'bg-emerald-500', text: 'text-emerald-450' }
    },
    {
      icon: MdDirectionsBike,
      title: "Picked Up",
      subtitle: "Parcel picked up",
      value: stats.pickedUp,
      colorClass: { bg: 'bg-purple-500', text: 'text-purple-455' }
    },
    {
      icon: MdLocalShipping,
      title: "On The Way",
      subtitle: "In delivery",
      value: stats.onTheWay,
      colorClass: { bg: 'bg-amber-500', text: 'text-amber-455' }
    },
    {
      icon: MdDoneAll,
      title: "Delivered Today",
      subtitle: "Successfully delivered",
      value: stats.deliveredToday,
      colorClass: { bg: 'bg-green-500', text: 'text-green-455' }
    },
    {
      icon: MdCancel,
      title: "Cancelled Today",
      subtitle: "Cancelled deliveries",
      value: stats.cancelledToday,
      colorClass: { bg: 'bg-red-500', text: 'text-red-455' }
    }
  ];

  return (
    <div className="flex flex-row overflow-x-auto flex-nowrap lg:grid lg:grid-cols-6 gap-4 pb-3 w-full scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent">
      {cardData.map((card, index) => (
        <StatCard key={card.title} {...card} index={index} />
      ))}
    </div>
  );
};

export default StatsCards;
