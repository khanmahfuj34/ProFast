import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiCheckCircle, FiExternalLink, FiDownload } from "react-icons/fi";

export default function PayoutHistoryModal({ isOpen, onClose, payouts = [] }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh] relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Payout History</h3>
              <p className="text-xs text-slate-500 mt-1">Record of all completed earnings transfers</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* List Content */}
          <div className="overflow-y-auto py-6 space-y-4 flex-1 pr-1 scrollbar-thin">
            {payouts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-medium text-sm">
                No past payouts available yet.
              </div>
            ) : (
              payouts.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between gap-4 hover:border-slate-200 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg flex-shrink-0">
                      <FiCheckCircle />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">{p.method}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">#{p.id} • {p.date}</div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-4">
                    <div>
                      <div className="text-sm font-black text-slate-900">৳{p.amount.toLocaleString()}</div>
                      <span className="inline-block text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md mt-1 uppercase">
                        {p.status}
                      </span>
                    </div>
                    <button
                      className="p-2 text-slate-400 hover:text-slate-900 bg-white rounded-lg border border-slate-200 shadow-2xs transition"
                      title="Download Receipt"
                    >
                      <FiDownload className="text-sm" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs md:text-sm transition shadow-sm cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
