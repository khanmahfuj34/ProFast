import React from "react";
import { motion } from "framer-motion";
import { FiDollarSign, FiCreditCard, FiClock, FiCalendar, FiChevronRight } from "react-icons/fi";

export default function PayoutSummaryCard({ stats = {}, onViewHistory }) {
  const {
    totalEarnings = 4890,
    totalPaidOut = 12450,
    pendingPayout = 1230,
    nextPayoutDate = "May 07, 2025"
  } = stats;

  const items = [
    {
      label: "Total Earnings",
      value: `৳${totalEarnings.toLocaleString()}`,
      icon: <FiDollarSign className="text-emerald-600 text-lg" />,
      bg: "bg-emerald-50 text-emerald-700"
    },
    {
      label: "Total Payouts",
      value: `৳${totalPaidOut.toLocaleString()}`,
      icon: <FiCreditCard className="text-purple-600 text-lg" />,
      bg: "bg-purple-50 text-purple-700"
    },
    {
      label: "Pending Payout",
      value: `৳${pendingPayout.toLocaleString()}`,
      icon: <FiClock className="text-amber-600 text-lg" />,
      bg: "bg-amber-50 text-amber-700"
    },
    {
      label: "Next Payout Date",
      value: nextPayoutDate,
      icon: <FiCalendar className="text-blue-600 text-lg" />,
      bg: "bg-blue-50 text-blue-700"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between space-y-6"
    >
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Payout Summary</h3>
        <p className="text-slate-500 text-xs mt-0.5">Overview of your bank and mobile banking transfers</p>
      </div>

      <div className="space-y-4 my-auto">
        {items.map((item) => (
          <div key={item.label} className="flex items-center justify-between pb-3.5 border-b border-slate-50 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.bg}`}>
                {item.icon}
              </div>
              <span className="text-xs font-bold text-slate-700">{item.label}</span>
            </div>
            <span className="text-sm font-black text-slate-900 tracking-tight">{item.value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onViewHistory}
        className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-xs md:text-sm transition shadow-sm flex items-center justify-center gap-2 cursor-pointer group"
      >
        View Payout History
        <FiChevronRight className="transition-transform group-hover:translate-x-1" />
      </button>
    </motion.div>
  );
}
