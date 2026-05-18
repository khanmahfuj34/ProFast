import React from "react";
import { motion } from "framer-motion";

export default function SettingsCard({ icon: Icon, title, description, children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-xs hover:shadow-md transition-all duration-300 ${className}`}
    >
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
        {/* Left Section (Icon & Info) */}
        <div className="lg:w-1/4 flex flex-col items-start space-y-3 pb-6 lg:pb-0 border-b lg:border-b-0 lg:border-r border-slate-100 pr-0 lg:pr-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-2xs">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-black text-slate-900 tracking-tight">{title}</h3>
            <p className="text-slate-500 text-xs md:text-sm mt-1 leading-relaxed">{description}</p>
          </div>
        </div>

        {/* Right Section (Content Fields) */}
        <div className="lg:w-3/4 flex flex-col justify-center">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
