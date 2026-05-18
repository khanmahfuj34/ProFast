import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-800 text-center">
        <p className="text-xs text-slate-300 font-medium">{data.date}</p>
        <p className="text-sm font-black text-emerald-400 mt-0.5">৳{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function EarningsAnalyticsChart({ analyticsData = {} }) {
  const [timeframe, setTimeframe] = useState("daily"); // daily, weekly, monthly

  const chartData = analyticsData[timeframe] || [
    { date: "May 01", amount: 200 },
    { date: "May 06", amount: 480 },
    { date: "May 11", amount: 620 },
    { date: "May 16", amount: 680 },
    { date: "May 21", amount: 890 },
    { date: "May 26", amount: 760 },
    { date: "May 31", amount: 510 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Earnings Overview</h3>
          <p className="text-slate-500 text-xs mt-0.5">Dynamic income progression over time</p>
        </div>

        {/* Timeframe selector matching screenshot */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 border border-slate-200/60 rounded-xl self-stretch sm:self-auto">
          {[
            { id: "daily", label: "By Day" },
            { id: "weekly", label: "By Week" },
            { id: "monthly", label: "By Month" }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeframe(t.id)}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                timeframe === t.id
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-[280px] sm:h-[320px] w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
              tickFormatter={(v) => `৳${v}`}
              dx={-10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#emeraldGradient)"
              activeDot={{ r: 6, stroke: "#ffffff", strokeWidth: 3, fill: "#059669" }}
              dot={{ r: 4, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
