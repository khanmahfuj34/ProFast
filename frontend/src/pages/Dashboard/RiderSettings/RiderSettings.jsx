import React from "react";
import { motion } from "framer-motion";
import { FiSettings, FiClock, FiShield, FiBell } from "react-icons/fi";

export default function RiderSettings() {
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 font-sans flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-2xl w-full bg-white border border-slate-100 rounded-3xl p-8 md:p-12 text-center shadow-sm"
      >
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
          <FiSettings className="w-10 h-10 animate-spin-slow" />
        </div>

        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Rider Settings Coming Soon
        </h2>
        <p className="text-slate-500 text-sm md:text-base mt-2 max-w-md mx-auto leading-relaxed">
          We are currently building a premium, custom settings suite tailored specifically for courier management, preferences, and payouts.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-8 border-t border-slate-100">
          <div className="p-4 rounded-2xl bg-slate-50 text-slate-700 flex flex-col items-center">
            <FiClock className="text-emerald-600 text-lg mb-1.5" />
            <span className="text-xs font-bold">Shift Preferences</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 text-slate-700 flex flex-col items-center">
            <FiShield className="text-emerald-600 text-lg mb-1.5" />
            <span className="text-xs font-bold">Security & PIN</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 text-slate-700 flex flex-col items-center">
            <FiBell className="text-emerald-600 text-lg mb-1.5" />
            <span className="text-xs font-bold">Payout Alerts</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
