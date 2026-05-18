import React from "react";
import { motion } from "framer-motion";
import { FiDollarSign, FiPackage, FiClock, FiCreditCard, FiTrendingUp } from "react-icons/fi";

export default function EarningsStatsCards({ stats = {} }) {
  const {
    totalEarnings = 4890,
    earningsChange = 12.5,
    completedDeliveries = 28,
    deliveriesChange = 7,
    pendingPayout = 1230,
    nextPayoutDate = "May 07, 2025",
    totalPaidOut = 12450
  } = stats;

  const cards = [
    {
      title: "Total Earnings",
      value: `৳${totalEarnings.toLocaleString()}`,
      badge: `+${earningsChange}% vs Apr 01 - Apr 30`,
      badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-100",
      icon: <FiDollarSign className="text-emerald-600 text-xl" />,
      bg: "bg-emerald-50/80 border-emerald-100",
      delay: 0.05
    },
    {
      title: "Completed Deliveries",
      value: completedDeliveries.toLocaleString(),
      badge: `+${deliveriesChange} vs Apr 01 - Apr 30`,
      badgeColor: "text-slate-600 bg-slate-100 border-slate-200",
      icon: <FiPackage className="text-blue-600 text-xl" />,
      bg: "bg-blue-50/80 border-blue-100",
      delay: 0.1
    },
    {
      title: "Pending Payout",
      value: `৳${pendingPayout.toLocaleString()}`,
      subtitle: `Will be paid on ${nextPayoutDate}`,
      icon: <FiClock className="text-amber-600 text-xl" />,
      bg: "bg-amber-50/80 border-amber-100",
      delay: 0.15
    },
    {
      title: "Total Payouts",
      value: `৳${totalPaidOut.toLocaleString()}`,
      subtitle: "All time payouts",
      icon: <FiCreditCard className="text-purple-600 text-xl" />,
      bg: "bg-purple-50/80 border-purple-100",
      delay: 0.2
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {cards.map((card, idx) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: card.delay }}
          className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group"
        >
          {/* Subtle gradient light glow on hover */}
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {card.title}
              </div>
              <div className="text-2xl md:text-3xl font-black text-slate-800 mt-1.5 tracking-tight">
                {card.value}
              </div>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${card.bg} transition-transform group-hover:scale-105`}>
              {card.icon}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-50 flex items-center">
            {card.badge ? (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${card.badgeColor}`}>
                <FiTrendingUp /> {card.badge}
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-500">
                {card.subtitle}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
