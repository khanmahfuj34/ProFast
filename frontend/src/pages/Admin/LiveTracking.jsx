import React from 'react';

const LiveTracking = () => {
  const activeDeliveries = [
    {
      id: 'ORD001',
      rider: 'Ahmed Hassan',
      status: 'in-progress',
      lat: 23.8103,
      lng: 90.4125,
      progress: 65,
      eta: '15 mins',
    },
    {
      id: 'ORD002',
      rider: 'Sarah Khan',
      status: 'in-progress',
      lat: 23.8043,
      lng: 90.3598,
      progress: 45,
      eta: '25 mins',
    },
    {
      id: 'ORD003',
      rider: 'John Doe',
      status: 'pending',
      lat: 23.7957,
      lng: 90.3674,
      progress: 10,
      eta: '40 mins',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Live Tracking</h1>
        <p className="text-slate-400">Monitor active deliveries in real-time</p>
      </div>

      {/* Map Placeholder */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden h-96">
        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
          <div className="text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-16 h-16 text-slate-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.553-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 16.382V5.618a1 1 0 00-1.553-.894L15 7m0 13V7m0 0L9 4"
              />
            </svg>
            <p className="text-slate-400">Map Integration Coming Soon</p>
            <p className="text-slate-500 text-sm mt-2">Real-time GPS tracking will be displayed here</p>
          </div>
        </div>
      </div>

      {/* Active Deliveries */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Active Deliveries ({activeDeliveries.length})</h2>
        <div className="grid gap-4">
          {activeDeliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-white font-bold">{delivery.rider}</h3>
                  <p className="text-slate-400 text-sm">Order: {delivery.id}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    delivery.status === 'in-progress'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {delivery.status === 'in-progress' ? '🚴 In Transit' : '⏳ Pending'}
                </span>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">Progress</span>
                  <span className="text-white font-semibold">{delivery.progress}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                    style={{ width: `${delivery.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                  <p className="text-slate-400 text-xs mb-1">Location</p>
                  <p className="text-slate-300 font-mono text-xs">
                    {delivery.lat.toFixed(3)}, {delivery.lng.toFixed(3)}
                  </p>
                </div>
                <div className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/30">
                  <p className="text-slate-400 text-xs mb-1">ETA</p>
                  <p className="text-white font-semibold">{delivery.eta}</p>
                </div>
                <button className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/30 transition-all font-semibold">
                  View
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
