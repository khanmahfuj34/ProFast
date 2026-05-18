import React from "react";
import { FiCalendar, FiDownload, FiRefreshCw } from "react-icons/fi";

export default function EarningsHeader({ dateRange, setDateRange, onExport, isLoading, onRefresh }) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Rider Earnings</h1>
          {isLoading && (
            <span className="loading loading-spinner loading-xs text-emerald-600"></span>
          )}
        </div>
        <p className="text-slate-500 text-xs md:text-sm mt-1">
          Track your earnings, payouts and delivery performance
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Date Selector Dropdown */}
        <div className="relative flex-1 md:flex-initial min-w-[220px]">
          <div className="flex items-center gap-2.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs md:text-sm shadow-sm">
            <FiCalendar className="text-emerald-600 text-base flex-shrink-0" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-800 font-semibold w-full cursor-pointer pr-2"
            >
              <option value="30d">May 01, 2025 - May 31, 2025</option>
              <option value="7d">Last 7 Days</option>
              <option value="3m">Last 3 Months</option>
              <option value="1y">All Time</option>
            </select>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center justify-center p-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition shadow-sm cursor-pointer disabled:opacity-50"
          title="Refresh Data"
        >
          <FiRefreshCw className={`text-slate-700 ${isLoading ? "animate-spin" : ""}`} />
        </button>

        {/* Export Earnings Button */}
        <button
          onClick={onExport}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-bold text-xs md:text-sm transition shadow-sm cursor-pointer w-full sm:w-auto"
        >
          <FiDownload className="text-lg" />
          Export Earnings
        </button>
      </div>
    </header>
  );
}
