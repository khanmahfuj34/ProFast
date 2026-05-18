import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiFilter, FiDownload, FiChevronLeft, FiChevronRight, FiBox, FiUser } from "react-icons/fi";

export default function EarningsHistoryTable({
  deliveries = [],
  pagination = {},
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  onPageChange,
  onExportTable
}) {
  const { page = 1, totalPages = 1 } = pagination;

  const getStatusBadge = (status = "Paid") => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "processing":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-6">
      {/* Table Header Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Earnings History</h3>
          <p className="text-slate-500 text-xs mt-0.5">Comprehensive audit log of your completed deliveries</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:flex-initial min-w-[200px]">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input
              type="text"
              placeholder="Search tracking ID or customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 rounded-xl font-medium text-xs md:text-sm focus:outline-none focus:border-emerald-600 transition"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs md:text-sm font-bold text-slate-700">
            <FiFilter className="text-slate-400 mr-2 text-sm" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent border-none outline-none font-semibold text-slate-800 cursor-pointer pr-1"
            >
              <option value="all">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
            </select>
          </div>

          {/* Export Table Button */}
          <button
            onClick={onExportTable}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs md:text-sm hover:bg-slate-50 transition shadow-2xs cursor-pointer"
          >
            <FiDownload className="text-slate-600" />
            Download
          </button>
        </div>
      </div>

      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
              <th className="py-3.5 px-4 rounded-l-xl">Date</th>
              <th className="py-3.5 px-4">Order ID</th>
              <th className="py-3.5 px-4">Customer</th>
              <th className="py-3.5 px-4">Parcel Details</th>
              <th className="py-3.5 px-4">Delivery Type</th>
              <th className="py-3.5 px-4 text-right">Earnings</th>
              <th className="py-3.5 px-4 text-center rounded-r-xl">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-xs md:text-sm font-medium text-slate-700">
            {deliveries.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400 font-semibold">
                  No matching deliveries found.
                </td>
              </tr>
            ) : (
              deliveries.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-4 px-4 font-semibold text-slate-900 whitespace-nowrap">{item.date}</td>
                  <td className="py-4 px-4 font-mono font-bold text-emerald-600 whitespace-nowrap">{item.trackingId}</td>
                  <td className="py-4 px-4 text-slate-800 font-bold whitespace-nowrap">{item.customerName || item.customer}</td>
                  <td className="py-4 px-4 text-slate-600 max-w-[180px] truncate">{item.parcelName}</td>
                  <td className="py-4 px-4">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-wide">
                      {item.deliveryType}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-black text-slate-900 whitespace-nowrap">৳{item.earnings}</td>
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black border ${getStatusBadge(item.paymentStatus)} uppercase tracking-wider`}>
                      {item.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Cards View (Hidden on desktop) */}
      <div className="block md:hidden space-y-4">
        {deliveries.length === 0 ? (
          <div className="py-12 text-center text-slate-400 font-semibold text-xs">
            No matching deliveries found.
          </div>
        ) : (
          deliveries.map((item) => (
            <div
              key={item.id}
              className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <div className="font-mono font-bold text-emerald-600 text-xs">{item.trackingId}</div>
                <div className="text-xs font-semibold text-slate-500">{item.date}</div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <FiUser className="text-slate-400" /> {item.customerName || item.customer}
                </div>
                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <FiBox className="text-slate-400" /> {item.parcelName} ({item.deliveryType})
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Earnings</div>
                  <div className="text-base font-black text-slate-900 mt-0.5">৳{item.earnings}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${getStatusBadge(item.paymentStatus)} uppercase`}>
                  {item.paymentStatus}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 text-xs md:text-sm font-semibold text-slate-600">
          <div>
            Showing page <span className="font-black text-slate-900">{page}</span> of <span className="font-black text-slate-900">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 flex items-center justify-center transition cursor-pointer text-slate-700 font-bold"
            >
              <FiChevronLeft />
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pNum = idx + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => onPageChange(pNum)}
                  className={`w-8 h-8 rounded-xl font-black text-xs transition cursor-pointer ${
                    page === pNum
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              disabled={page === totalPages}
              onClick={() => onPageChange(page + 1)}
              className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:hover:bg-slate-100 flex items-center justify-center transition cursor-pointer text-slate-700 font-bold"
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
