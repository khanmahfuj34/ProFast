import React from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function EarningsBreakdownChart({ breakdown = {} }) {
  const {
    baseFare = 3360,
    distanceFare = 960,
    surgeBonus = 420,
    otherIncentives = 150,
    total = 4890
  } = breakdown;

  const data = [
    { name: "Base Fare", value: baseFare, color: "#10b981", bg: "bg-emerald-500", pct: "68.7%" },
    { name: "Distance Fare", value: distanceFare, color: "#3b82f6", bg: "bg-blue-500", pct: "19.6%" },
    { name: "Surge / Bonus", value: surgeBonus, color: "#1e293b", bg: "bg-slate-800", pct: "8.6%" },
    { name: "Other Incentives", value: otherIncentives, color: "#f59e0b", bg: "bg-amber-500", pct: "3.1%" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between space-y-6"
    >
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">Earnings Breakdown</h3>
        <p className="text-slate-500 text-xs mt-0.5">Component distribution of your revenue</p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-2">
        {/* Donut Chart with Center Text */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val) => [`৳${val.toLocaleString()}`, "Amount"]}
                contentStyle={{ backgroundColor: "#0f172a", borderRadius: "10px", borderColor: "#1e293b", color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Centered Total Text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-black text-slate-900 tracking-tight">৳{total.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 w-full space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2.5 text-slate-700 font-bold">
                <span className={`w-2.5 h-2.5 rounded-full ${item.bg}`} />
                {item.name}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-slate-900">৳{item.value.toLocaleString()}</span>
                <span className="text-[11px] text-slate-400 font-bold w-10 text-right">{item.pct}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Summary Bar */}
      <div className="bg-emerald-50/80 border border-emerald-100/80 rounded-xl px-5 py-3.5 flex items-center justify-between text-emerald-800">
        <span className="text-xs font-bold uppercase tracking-wider">Total Revenue</span>
        <span className="text-base font-black tracking-tight">৳{total.toLocaleString()}</span>
      </div>
    </motion.div>
  );
}
