import React, { useState } from 'react';
import {
  RiMapPin2Line, RiTruckLine, RiBox3Line, RiGroupLine, RiBarChartBoxLine, RiSparklingLine,
  RiShieldCheckLine, RiRadarLine, RiRoadMapLine, RiBrainLine, RiArrowRightSLine,
  RiEyeLine, RiEdit2Line, RiFlashlightLine, RiGlobalLine, RiMapPinTimeLine
} from 'react-icons/ri';

const ZoneManager = () => {
  const [zones] = useState([
    {
      id: 1,
      name: 'Downtown Dhaka',
      status: 'active',
      coverage: 85,
      riders: 24,
      parcels: 342,
      efficiency: '96%',
      updated: '2 mins ago',
    },
    {
      id: 2,
      name: 'North Dhaka',
      status: 'active',
      coverage: 72,
      riders: 18,
      parcels: 256,
      efficiency: '89%',
      updated: '10 mins ago',
    },
    {
      id: 3,
      name: 'South Dhaka',
      status: 'inactive',
      coverage: 45,
      riders: 8,
      parcels: 92,
      efficiency: '61%',
      updated: '1 hour ago',
    },
  ]);

  const totalZones = zones.length;
  const activeZones = zones.filter(z => z.status === 'active').length;
  const totalRiders = zones.reduce((acc, z) => acc + z.riders, 0);
  const avgCoverage = Math.round(zones.reduce((acc, z) => acc + z.coverage, 0) / zones.length);

  const futureFeatures = [
    { title: 'AI Rider Assignment', desc: 'Automatically match the best available rider to each zone based on workload and proximity.', icon: RiBrainLine, color: 'emerald' },
    { title: 'Smart Routing', desc: 'Machine-learning optimized delivery routes for maximum throughput and minimum travel time.', icon: RiRoadMapLine, color: 'cyan' },
    { title: 'Live Zone Heatmap', desc: 'Real-time visualisation of delivery demand density across every operational zone.', icon: RiRadarLine, color: 'purple' },
    { title: 'Auto Zone Coverage', desc: 'Dynamic zone boundary adjustment as delivery demand patterns shift across the city.', icon: RiGlobalLine, color: 'blue' },
  ];

  return (
    <div className="space-y-8 pb-12">

      {/* ── Hero Header ── */}
      <div className="relative overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 border border-slate-700/60 shadow-2xl">
        <div className="pointer-events-none absolute -top-20 -right-20 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                <RiMapPin2Line className="text-emerald-400" size={30} />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white">Smart Zone System Coming Soon</h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                    Under Development
                  </span>
                  <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[10px] font-black uppercase tracking-widest">
                    Preview Mode
                  </span>
                </div>
              </div>
            </div>
            <p className="text-slate-400 max-w-2xl leading-relaxed font-medium">
              Future enterprise-grade delivery zone management system — powering smart logistics
              coverage, rider balancing, automated routing, and real-time operational monitoring.
            </p>
          </div>

          <button className="flex-shrink-0 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-sm hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 shadow-lg shadow-emerald-500/20 flex items-center gap-2">
            <RiFlashlightLine size={16} />
            Add New Zone
          </button>
        </div>

        {/* Stats Row */}
        <div className="relative z-10 grid grid-cols-2 xl:grid-cols-4 gap-4 mt-10">
          {[
            { label: 'Total Zones', value: totalZones, icon: RiMapPin2Line, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
            { label: 'Active Zones', value: activeZones, icon: RiShieldCheckLine, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Avg Coverage', value: `${avgCoverage}%`, icon: RiRadarLine, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
            { label: 'Total Riders', value: totalRiders, icon: RiGroupLine, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className={`rounded-2xl border ${bg} bg-white/5 backdrop-blur-sm p-5 hover:scale-[1.02] transition-all duration-200`}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-slate-400 text-sm font-semibold">{label}</p>
                <Icon className={color} size={18} />
              </div>
              <h2 className="text-3xl font-black text-white">{value}</h2>
            </div>
          ))}
        </div>
      </div>

      {/* ── Zone Cards ── */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-2xl font-black text-slate-900">Active Delivery Zones</h2>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">{zones.length} zones</span>
        </div>

        <div className="space-y-5">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="group relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-7 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300"
            >
              <div className="pointer-events-none absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full opacity-0 group-hover:opacity-100 blur-3xl transition-all duration-500" />

              <div className="relative z-10 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-8">
                {/* Left side */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 flex-shrink-0 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
                      <RiMapPin2Line className="text-emerald-600" size={26} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="text-2xl font-black text-slate-900">{zone.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${zone.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                          {zone.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm font-medium">Enterprise Zone ID · #{zone.id}</p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-100 text-cyan-700 text-[10px] font-bold">Live Tracking</span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 text-[10px] font-bold">Smart Routing</span>
                        <span className="px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-100 text-orange-700 text-[10px] font-bold">Auto Assignment</span>
                      </div>
                    </div>
                  </div>

                  {/* Coverage Progress */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-bold text-slate-600">Coverage Performance</p>
                      <p className={`text-sm font-black ${zone.coverage >= 70 ? 'text-emerald-600' : 'text-amber-500'}`}>{zone.coverage}%</p>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${zone.coverage}%` }}
                        className={`h-full rounded-full transition-all duration-700 ${zone.coverage >= 70 ? 'bg-gradient-to-r from-emerald-400 to-cyan-400' : 'bg-gradient-to-r from-amber-400 to-orange-400'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 xl:min-w-[580px]">
                  {[
                    { label: 'Active Riders', value: zone.riders, icon: RiTruckLine, color: 'text-cyan-600', bg: 'bg-cyan-50 border-cyan-100' },
                    { label: 'Parcels', value: zone.parcels, icon: RiBox3Line, color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100' },
                    { label: 'Efficiency', value: zone.efficiency, icon: RiBarChartBoxLine, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
                    { label: 'Updated', value: zone.updated, icon: RiMapPinTimeLine, color: 'text-purple-500', bg: 'bg-purple-50 border-purple-100', small: true },
                  ].map(({ label, value, icon: Icon, color, bg, small }) => (
                    <div key={label} className={`rounded-2xl border ${bg} p-4`}>
                      <Icon className={`${color} mb-3`} size={20} />
                      <p className="text-slate-400 text-xs font-bold mb-1">{label}</p>
                      <p className={`font-black text-slate-900 ${small ? 'text-xs leading-tight mt-1' : 'text-xl'}`}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 mt-7 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-2.5 text-sm text-slate-500 font-medium">
                  <div className={`w-2.5 h-2.5 rounded-full ${zone.status === 'active' ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-400'}`} />
                  {zone.status === 'active' ? 'Service available in this zone' : 'Zone temporarily inactive'}
                </div>
                <div className="flex gap-3">
                  <button className="px-5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all text-sm font-bold flex items-center gap-2">
                    <RiEdit2Line size={15} /> Edit
                  </button>
                  <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:opacity-90 hover:shadow-lg hover:shadow-emerald-500/30 transition-all text-sm font-bold flex items-center gap-2">
                    <RiEyeLine size={15} /> View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Smart Zone Coming Soon ── */}
      <div className="rounded-[40px] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-10 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <RiSparklingLine className="text-amber-500" size={20} />
              </div>
              <h2 className="text-2xl font-black text-slate-900">Smart Zone System</h2>
            </div>
            <p className="text-slate-500 font-medium">Next-generation enterprise intelligence — arriving soon</p>
          </div>
          <span className="self-start md:self-auto px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-black uppercase tracking-widest">
            Coming Soon
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {futureFeatures.map(({ title, desc, icon: Icon }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-[24px] border border-slate-200 bg-white p-6 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-default"
            >
              <div className="pointer-events-none absolute -top-8 -right-8 w-32 h-32 rounded-full bg-emerald-50 opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <div className="relative z-10 w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-all duration-300">
                <Icon className="text-emerald-600" size={22} />
              </div>
              <h3 className="relative z-10 font-black text-slate-900 text-lg leading-snug mb-2">{title}</h3>
              <p className="relative z-10 text-slate-500 text-sm leading-relaxed mb-6">{desc}</p>
              <div className="relative z-10 flex items-center gap-1.5 text-emerald-600 text-sm font-bold">
                Preview Feature <RiArrowRightSLine size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </div>
          ))}
        </div>

        {/* Roadmap progress */}
        <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-black text-slate-700">Development Roadmap</p>
            <span className="text-sm font-bold text-emerald-600">Phase 1 · 35% Complete</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
            <div className="h-full w-[35%] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
          </div>
          <div className="flex flex-wrap justify-between gap-4 mt-5 text-xs font-bold text-slate-400">
            <span className="text-emerald-600">✓ Zone Data Layer</span>
            <span className="text-emerald-600">✓ Coverage Analytics</span>
            <span>⏳ AI Assignment Engine</span>
            <span>⏳ Live Heatmap</span>
            <span>⏳ Smart Routing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneManager;
