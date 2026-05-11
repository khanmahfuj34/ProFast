import React from 'react';

const Reports = () => {
  const stats = [
    {
      title: 'Total Revenue',
      value: '$124,500',
      change: '+12.5%',
      icon: '💰',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Total Deliveries',
      value: '2,849',
      change: '+8.2%',
      icon: '📦',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Active Riders',
      value: '156',
      change: '+5.1%',
      icon: '🏍️',
      color: 'from-orange-500 to-red-500',
    },
    {
      title: 'Customer Satisfaction',
      value: '4.8/5',
      change: '+2.3%',
      icon: '⭐',
      color: 'from-amber-500 to-yellow-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
        <p className="text-slate-400">View detailed analytics and system reports</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{stat.icon}</span>
              <span className="text-xs font-semibold text-emerald-400">{stat.change}</span>
            </div>
            <h3 className="text-slate-400 text-sm mb-2">{stat.title}</h3>
            <p className="text-white text-2xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Revenue Trend</h2>
          <div className="h-64 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-lg flex items-end justify-around px-4 py-8 border border-slate-600/30">
            {[65, 45, 78, 55, 92, 71, 88].map((height, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div
                  className="w-8 bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg transition-all hover:from-emerald-400"
                  style={{ height: `${height}%` }}
                />
                <span className="text-slate-500 text-xs">Day {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Chart */}
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Delivery Performance</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">On-time Delivery</span>
                <span className="text-white font-bold">94%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '94%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Successful Deliveries</span>
                <span className="text-white font-bold">98.5%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '98.5%' }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300">Customer Satisfaction</span>
                <span className="text-white font-bold">96%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '96%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Export Reports</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-6 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition-all">
            📊 Export as PDF
          </button>
          <button className="px-6 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition-all">
            📈 Export as Excel
          </button>
          <button className="px-6 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition-all">
            📧 Email Report
          </button>
          <button className="px-6 py-2 bg-slate-700 text-slate-300 font-semibold rounded-lg hover:bg-slate-600 transition-all">
            🔄 Schedule Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
