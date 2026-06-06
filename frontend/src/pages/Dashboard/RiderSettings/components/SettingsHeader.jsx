import React from "react";
import { FiSettings } from "react-icons/fi";

export default function SettingsHeader({ title = "Rider Settings", subtitle = "Manage your account, preferences and security settings" }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 md:p-8 flex items-center gap-5 shadow-xs transition-colors duration-300">
      <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-100 dark:border-emerald-900/30 shadow-inner">
        <FiSettings className="w-7 h-7 animate-spin-slow" />
      </div>
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h1>
        <p className="text-slate-500 dark:text-slate-300 text-xs md:text-sm mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
