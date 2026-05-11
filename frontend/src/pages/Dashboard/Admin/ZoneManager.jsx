import React, { useState } from 'react';

const ZoneManager = () => {
  const [zones, setZones] = useState([
    {
      id: 1,
      name: 'Downtown Dhaka',
      status: 'active',
      coverage: '85%',
      riders: 24,
      parcels: 342,
    },
    {
      id: 2,
      name: 'North Dhaka',
      status: 'active',
      coverage: '72%',
      riders: 18,
      parcels: 256,
    },
    {
      id: 3,
      name: 'South Dhaka',
      status: 'inactive',
      coverage: '45%',
      riders: 8,
      parcels: 92,
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Zone Manager</h1>
          <p className="text-slate-400">Manage delivery zones and coverage areas</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-emerald-500/50 transition-all"
        >
          Add New Zone
        </button>
      </div>

      {/* Add Zone Form */}
      {showForm && (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Create New Zone</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Zone Name"
              className="px-4 py-2 bg-slate-600/50 border border-slate-500/50 text-white rounded-lg placeholder-slate-500"
            />
            <select className="px-4 py-2 bg-slate-600/50 border border-slate-500/50 text-white rounded-lg">
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <input
              type="text"
              placeholder="Coverage Area"
              className="px-4 py-2 bg-slate-600/50 border border-slate-500/50 text-white rounded-lg placeholder-slate-500"
            />
            <input
              type="number"
              placeholder="Number of Riders"
              className="px-4 py-2 bg-slate-600/50 border border-slate-500/50 text-white rounded-lg placeholder-slate-500"
            />
          </div>
          <div className="flex gap-4 mt-4">
            <button className="px-6 py-2 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all">
              Create Zone
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-6 py-2 bg-slate-600 text-slate-300 font-semibold rounded-lg hover:bg-slate-700 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Zones Grid */}
      <div className="grid gap-4">
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-slate-600 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{zone.name}</h3>
                <p className="text-slate-400 text-sm mt-1">Zone ID: #{zone.id}</p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  zone.status === 'active'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}
              >
                {zone.status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <p className="text-slate-400 text-xs mb-1">Coverage</p>
                <p className="text-white font-bold text-lg">{zone.coverage}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <p className="text-slate-400 text-xs mb-1">Active Riders</p>
                <p className="text-white font-bold text-lg">{zone.riders}</p>
              </div>
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <p className="text-slate-400 text-xs mb-1">Total Parcels</p>
                <p className="text-white font-bold text-lg">{zone.parcels}</p>
              </div>
              <div className="flex gap-2 items-end">
                <button className="flex-1 px-4 py-2 bg-slate-600 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition-all text-sm">
                  Edit
                </button>
                <button className="flex-1 px-4 py-2 bg-slate-600 text-slate-300 font-medium rounded-lg hover:bg-slate-700 transition-all text-sm">
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZoneManager;
