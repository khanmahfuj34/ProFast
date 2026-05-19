import React from 'react';
import { motion } from 'framer-motion';
import { MdPerson } from 'react-icons/md';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const RiderStatusPanel = ({ riderStatus, isLoading }) => {
  if (isLoading || !riderStatus) {
    return (
      <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl p-5 h-[400px] animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/2 mb-6"></div>
        <div className="h-40 bg-slate-700 rounded-full w-40 mx-auto mb-6"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 bg-slate-700 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const { totalRiders = 0, onlineRiders = 0, busyRiders = 0, offlineRiders = 0, topRiders = [] } = riderStatus;

  const data = [
    { name: 'Online', value: onlineRiders, color: '#10B981' },
    { name: 'Busy', value: busyRiders, color: '#F59E0B' },
    { name: 'Offline', value: offlineRiders, color: '#64748B' }
  ];

  return (
    <div className="bg-[#1E293B] border border-slate-700/50 rounded-xl overflow-hidden shadow-xl">
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Rider Live Status</h2>
          <span className="text-sm text-slate-400">Total Riders: {totalRiders}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="w-24 h-24 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #334155' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-sm text-slate-300 w-16">{item.name}</span>
                <span className="text-sm font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700 hover:text-white">
          View All Riders
        </button>
      </div>

      <div className="p-5">
        <h3 className="text-sm font-medium text-slate-300 mb-4">Top Active Riders Today</h3>
        <div className="space-y-4">
          {topRiders.map((rider, index) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={rider.email} 
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-sm font-mono">{index + 1}</span>
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center relative">
                  <MdPerson className="text-slate-400" />
                  {rider.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#1E293B] rounded-full"></span>
                  )}
                </div>
                <div className="text-sm text-slate-200">{rider.name}</div>
              </div>
              <div className="text-xs text-emerald-400 font-medium bg-emerald-500/10 px-2 py-1 rounded">
                {rider.totalDeliveries || 0} Deliveries
              </div>
            </motion.div>
          ))}
        </div>
        
        <button className="w-full mt-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700 hover:text-white">
          View Leaderboard
        </button>
      </div>
    </div>
  );
};

export default RiderStatusPanel;
