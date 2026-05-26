import React, { useState, useEffect } from 'react';
import {
  RiMapPin2Line, RiTruckLine, RiSparklingLine, RiShieldCheckLine, RiRadarLine,
  RiRoadMapLine, RiArrowRightSLine, RiEyeLine, RiCloseLine,
  RiSearch2Line, RiFilter3Line, RiMapPinTimeLine, RiAlertLine, RiUserLine,
  RiPhoneLine, RiPlayLine, RiPauseLine, RiRefreshLine, RiBaseStationLine,
  RiCheckboxCircleLine, RiInformationLine, RiCompass3Line, RiRoadMapFill
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const LiveTracking = () => {
  // --- Component State ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState(15);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAutoRefreshPaused, setIsAutoRefreshPaused] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  // --- Mock Dataset ---
  const initialDeliveries = [
    {
      id: 'PF-TRK-78491',
      rider: {
        name: 'Rahat Al-Momin',
        phone: '+880 1712-345678',
        status: 'Online', // Online, Busy, Offline
        vehicle: 'Yamaha FZs V3',
        rating: '4.9',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
      },
      status: 'In Transit', // Assigned, Picked Up, In Transit, Delayed
      progress: 72,
      eta: '14 mins',
      delay: false,
      sender: { name: 'Acme Corp BD', district: 'Gulshan, Dhaka', address: 'House 14, Road 2, Gulshan-1' },
      receiver: { name: 'Mr. Rafiqul Islam', district: 'Dhanmondi, Dhaka', address: 'Flat 4B, House 89, Road 8A' },
      timeline: [
        { name: 'Created', done: true, time: '10:15 AM' },
        { name: 'Picked Up', done: true, time: '10:45 AM' },
        { name: 'In Transit', done: true, time: '11:00 AM' },
        { name: 'Delivered', done: false, time: null }
      ]
    },
    {
      id: 'PF-TRK-90218',
      rider: {
        name: 'Nabil Chowdhury',
        phone: '+880 1819-987654',
        status: 'Busy',
        vehicle: 'Suzuki Gixxer',
        rating: '4.7',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120'
      },
      status: 'Delayed',
      progress: 45,
      eta: '32 mins',
      delay: true,
      delayReason: 'Heavy gridlock at Banani Crossing',
      sender: { name: 'LafargeHolcim', district: 'Tejgaon, Dhaka', address: 'Plot 23, Tejgaon Industrial Area' },
      receiver: { name: 'Dr. Tanvir Ahmed', district: 'Uttara, Dhaka', address: 'Sector 4, Road 11, House 3' },
      timeline: [
        { name: 'Created', done: true, time: '09:30 AM' },
        { name: 'Picked Up', done: true, time: '10:05 AM' },
        { name: 'In Transit', done: true, time: '10:20 AM' },
        { name: 'Delivered', done: false, time: null }
      ]
    },
    {
      id: 'PF-TRK-11024',
      rider: {
        name: 'Sumon Talukder',
        phone: '+880 1911-223344',
        status: 'Online',
        vehicle: 'Runner Turbo 125',
        rating: '4.8',
        avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=120'
      },
      status: 'Picked Up',
      progress: 25,
      eta: '48 mins',
      delay: false,
      sender: { name: 'Sheba XYZ', district: 'Mirpur, Dhaka', address: 'Section 10, Block C, House 25' },
      receiver: { name: 'Mrs. Khaleda Begum', district: 'Banani, Dhaka', address: 'House 56, Road 18, Banani' },
      timeline: [
        { name: 'Created', done: true, time: '10:40 AM' },
        { name: 'Picked Up', done: true, time: '11:15 AM' },
        { name: 'In Transit', done: false, time: null },
        { name: 'Delivered', done: false, time: null }
      ]
    },
    {
      id: 'PF-TRK-38501',
      rider: {
        name: 'Mahbub Hasan',
        phone: '+880 1673-889900',
        status: 'Offline',
        vehicle: 'Vespa VXL 150',
        rating: '4.5',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=120'
      },
      status: 'Assigned',
      progress: 10,
      eta: '55 mins',
      delay: false,
      sender: { name: 'ProFast Hub 1', district: 'Motijheel, Dhaka', address: '28 Dilkusha C/A' },
      receiver: { name: 'Ekushey Book Stall', district: 'Savar, Dhaka', address: 'Jahangirnagar University Campus' },
      timeline: [
        { name: 'Created', done: true, time: '11:20 AM' },
        { name: 'Picked Up', done: false, time: null },
        { name: 'In Transit', done: false, time: null },
        { name: 'Delivered', done: false, time: null }
      ]
    }
  ];

  const recentLogs = [
    { time: '11:28 AM', trackingId: 'PF-TRK-11024', text: 'Sumon Talukder picked up parcel from Mirpur' },
    { time: '11:15 AM', trackingId: 'PF-TRK-78491', text: 'Rahat Al-Momin entered Dhanmondi Zone' },
    { time: '11:02 AM', trackingId: 'PF-TRK-38501', text: 'System auto-assigned Mahbub Hasan to parcel' },
    { time: '10:50 AM', trackingId: 'PF-TRK-90218', text: 'Delayed status triggered due to Banani crossing traffic' }
  ];

  // --- Auto-Refresh Logic ---
  useEffect(() => {
    if (isAutoRefreshPaused) return;

    const timer = setInterval(() => {
      setAutoRefreshSeconds((prev) => {
        if (prev <= 1) {
          triggerRefresh();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoRefreshPaused]);

  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success('Live Tracking feeds synchronized successfully.', {
        icon: '🔄',
        style: {
          borderRadius: '12px',
          background: '#ffffff',
          color: '#1e293b',
          border: '1px solid #e2e8f0',
          fontWeight: '600',
          fontSize: '13px'
        }
      });
    }, 800);
  };

  const handleActionClick = (featureName) => {
    setComingSoonFeature(featureName);
    setIsComingSoonOpen(true);
    toast.success(`Opening preview detail for ${featureName}...`, {
      icon: '✨',
      style: {
        borderRadius: '12px',
        background: '#0f172a',
        color: '#ffffff',
        fontWeight: '600',
        fontSize: '13px'
      }
    });
  };

  // --- Filtering Logic ---
  const filteredDeliveries = initialDeliveries.filter((del) => {
    const matchesSearch = del.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      del.rider.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDistrict = selectedDistrict === 'All' || 
      del.sender.district.includes(selectedDistrict) || 
      del.receiver.district.includes(selectedDistrict);
    
    return matchesSearch && matchesDistrict;
  });

  // Stats calculation
  const totalActive = initialDeliveries.length;
  const ridersOnline = initialDeliveries.filter(d => d.rider.status === 'Online').length;
  const ridersBusy = initialDeliveries.filter(d => d.rider.status === 'Busy').length;
  const ridersOffline = initialDeliveries.filter(d => d.rider.status === 'Offline').length;
  const totalDelayed = initialDeliveries.filter(d => d.delay).length;

  return (
    <div className="space-y-6 pb-12 text-slate-800 bg-slate-50 min-h-screen">
      
      {/* ─── Hero Header & Refresh Controls ─── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Live Delivery Monitoring</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
              Beta
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-[10px] font-black uppercase tracking-wider">
              Preview
            </span>
          </div>
          <p className="text-slate-500 font-medium">Real-time GPS telemetry & logistics dispatch overview.</p>
        </div>

        {/* Auto Refresh Circle & Button */}
        <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/60 self-start md:self-auto">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsAutoRefreshPaused(!isAutoRefreshPaused)}
              className="p-2 bg-white rounded-xl border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:shadow-sm active:scale-95 transition-all"
              title={isAutoRefreshPaused ? 'Resume Auto-refresh' : 'Pause Auto-refresh'}
            >
              {isAutoRefreshPaused ? <RiPlayLine size={16} /> : <RiPauseLine size={16} />}
            </button>
            <button 
              onClick={triggerRefresh}
              className={`p-2 bg-white rounded-xl border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:shadow-sm active:scale-95 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RiRefreshLine size={16} />
            </button>
          </div>
          
          <div className="h-6 w-[1px] bg-slate-200" />
          
          <div className="flex items-center gap-2 pr-2">
            <div className="relative flex items-center justify-center w-8 h-8">
              {/* Circular progress simulated */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="16" cy="16" r="12" stroke="#e2e8f0" strokeWidth="2.5" fill="transparent" />
                <circle cx="16" cy="16" r="12" stroke="#0ea5e9" strokeWidth="2.5" fill="transparent"
                  strokeDasharray={2 * Math.PI * 12}
                  strokeDashoffset={2 * Math.PI * 12 * (1 - autoRefreshSeconds / 15)}
                  className="transition-all duration-1000"
                />
              </svg>
              <span className="absolute text-[10px] font-black text-slate-700">{autoRefreshSeconds}</span>
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Sync Countdown</span>
          </div>
        </div>
      </div>

      {/* ─── Stats Overview Cards ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            title: 'Active Deliveries',
            value: totalActive,
            sub: 'In transit city-wide',
            icon: RiTruckLine,
            color: 'text-sky-500 bg-sky-50 border-sky-100',
            extra: 'All hubs active'
          },
          {
            title: 'Active Riders Status',
            value: ridersOnline + ridersBusy,
            sub: `Online: ${ridersOnline} | Busy: ${ridersBusy}`,
            icon: RiUserLine,
            color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
            extra: `${ridersOffline} Riders Offline`
          },
          {
            title: 'Delayed Alerts',
            value: totalDelayed,
            sub: 'Requires attention',
            icon: RiAlertLine,
            color: totalDelayed > 0 ? 'text-amber-600 bg-amber-50 border-amber-200 animate-pulse' : 'text-slate-400 bg-slate-50 border-slate-200',
            extra: totalDelayed > 0 ? 'Traffic / Route delay' : 'All running on schedule'
          },
          {
            title: 'Average Fleet ETA',
            value: '37 min',
            sub: 'Target: under 45m',
            icon: RiMapPinTimeLine,
            color: 'text-indigo-500 bg-indigo-50 border-indigo-100',
            extra: 'Optimized via AI'
          }
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:scale-[1.02] transition-transform duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">{stat.title}</span>
                <div className={`p-2.5 rounded-xl border ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-1">{stat.value}</h2>
              <p className="text-slate-600 text-xs font-bold">{stat.sub}</p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                <RiInformationLine size={12} />
                <span>{stat.extra}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Search & Filters Bar ─── */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <RiSearch2Line className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search active tracking ID or assigned rider name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-300 transition-all text-slate-800"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase">
            <RiFilter3Line size={16} />
            <span>Zone:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['All', 'Gulshan', 'Dhanmondi', 'Banani', 'Uttara', 'Mirpur'].map((district) => (
              <button
                key={district}
                onClick={() => {
                  setSelectedDistrict(district);
                  toast.success(`Filter applied: ${district} district`, {
                    style: { borderRadius: '10px', fontSize: '12px' }
                  });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedDistrict === district
                    ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {district}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Delayed Alert Banner ─── */}
      {totalDelayed > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 shadow-inner flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl text-amber-600 self-start">
              <RiAlertLine size={24} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Delayed Dispatch Alert</h3>
              <p className="text-slate-600 text-sm font-medium mt-0.5">
                Rider <span className="font-bold text-slate-800">Nabil Chowdhury</span> reporting delays due to: <span className="italic">"Heavy gridlock at Banani Crossing"</span>.
              </p>
            </div>
          </div>
          <button 
            onClick={() => handleActionClick('Rider Delay Resolution')}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:scale-105 active:scale-95 transition-all shadow-md shadow-amber-600/10 flex items-center gap-1.5"
          >
            Resolve Delay <RiArrowRightSLine size={14} />
          </button>
        </div>
      )}

      {/* ─── Main Content Layout ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Active Delivery List (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Deliveries ({filteredDeliveries.length})</h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-2.5 py-1 rounded-lg border border-slate-200">
              Live Feed
            </span>
          </div>

          {filteredDeliveries.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <RiRadarLine className="text-slate-300" size={32} />
              </div>
              <h3 className="text-lg font-black text-slate-800">No active tracking records</h3>
              <p className="text-slate-400 text-sm mt-1">Try modifying your query or select a different district filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeliveries.map((delivery) => (
                <div
                  key={delivery.id}
                  className="group relative overflow-hidden bg-white border border-slate-200 rounded-[32px] p-6 shadow-sm hover:border-sky-300 hover:shadow-lg transition-all duration-300"
                >
                  {/* Subtle Top-border status accent */}
                  <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                    delivery.status === 'Delayed' ? 'bg-amber-400' :
                    delivery.status === 'In Transit' ? 'bg-sky-400' : 'bg-emerald-400'
                  }`} />

                  {/* Header Row */}
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-slate-900 text-base tracking-wide">{delivery.id}</span>
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 rounded text-[9px] font-bold">BETA</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-700 border border-sky-100 rounded text-[9px] font-extrabold uppercase tracking-wide">
                          GPS Enabled
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Live Badge */}
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        delivery.status === 'Delayed' ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse' :
                        delivery.status === 'In Transit' ? 'bg-sky-50 text-sky-700 border-sky-200' :
                        'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}>
                        {delivery.status}
                      </span>
                      {/* ETA */}
                      <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold">
                        <RiMapPinTimeLine size={14} />
                        <span className="font-extrabold text-slate-700">{delivery.eta}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sender & Receiver Info Snippet */}
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-5">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Sender Location</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{delivery.sender.name}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">{delivery.sender.district}</p>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Receiver Location</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{delivery.receiver.name}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">{delivery.receiver.district}</p>
                    </div>
                  </div>

                  {/* Delivery Progress Bar */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500">Dispatch Progress</span>
                      <span className="text-xs font-black text-slate-800">{delivery.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${delivery.progress}%` }}
                        className={`h-full rounded-full transition-all duration-700 ${
                          delivery.status === 'Delayed' ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                          'bg-gradient-to-r from-sky-400 to-emerald-400'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Rider Info Row & Detailed Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-100">
                    {/* Rider details */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
                        <img src={delivery.rider.avatar} alt="Rider" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-extrabold text-slate-800 leading-tight">{delivery.rider.name}</p>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            delivery.rider.status === 'Online' ? 'bg-emerald-400 animate-pulse' :
                            delivery.rider.status === 'Busy' ? 'bg-amber-400 animate-pulse' : 'bg-slate-300'
                          }`} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{delivery.rider.vehicle} · ⭐ {delivery.rider.rating}</p>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedDelivery(delivery)}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all shadow-sm flex items-center gap-1"
                      >
                        <RiEyeLine size={13} /> View Details
                      </button>
                      <button
                        onClick={() => handleActionClick(`Trace Live Path - ${delivery.id}`)}
                        className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider hover:border-slate-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-1"
                      >
                        <RiBaseStationLine size={13} /> Track live
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Smart Map Preview & Activity Logs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Smart Map Preview Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden flex flex-col h-[400px] relative">
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div>
                <h3 className="font-black text-slate-950 text-base leading-tight">Smart Map Preview</h3>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Rider telemetry overlay</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-black uppercase tracking-widest">
                Coming Soon
              </span>
            </div>

            {/* Stylized Vector Map Backdrop */}
            <div className="flex-1 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden relative p-4 flex flex-col justify-end">
              
              {/* Simulated Map lines / Roads */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute w-[2px] h-full bg-slate-600 left-1/3 top-0" />
                <div className="absolute w-[2px] h-full bg-slate-600 left-2/3 top-0" />
                <div className="absolute h-[2px] w-full bg-slate-600 top-1/4 left-0" />
                <div className="absolute h-[2px] w-full bg-slate-600 top-2/3 left-0" />
                {/* Diagonal lines */}
                <div className="absolute w-[2px] h-full bg-slate-600 rotate-45 top-0 left-1/2" />
                <div className="absolute w-[2px] h-full bg-slate-600 -rotate-45 top-0 left-1/2" />
              </div>

              {/* Simulated District labels */}
              <div className="absolute top-8 left-12 text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">Gulshan</div>
              <div className="absolute top-28 right-16 text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">Tejgaon</div>
              <div className="absolute bottom-24 left-8 text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">Dhanmondi</div>
              <div className="absolute bottom-12 right-20 text-[10px] font-black text-slate-400 uppercase tracking-widest select-none">Motijheel</div>

              {/* Pulsing Rider indicators on map */}
              <div className="absolute top-[35%] left-[28%] group">
                <span className="absolute w-5 h-5 bg-sky-500/30 rounded-full animate-ping -translate-x-[6px] -translate-y-[6px]" />
                <div className="w-2 h-2 rounded-full bg-sky-500 border border-white cursor-pointer relative" />
                <div className="absolute left-3 -top-2 bg-slate-900 text-white text-[8px] font-extrabold px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">PF-78491</div>
              </div>

              <div className="absolute bottom-[40%] right-[35%] group">
                <span className="absolute w-5 h-5 bg-amber-500/30 rounded-full animate-ping -translate-x-[6px] -translate-y-[6px]" />
                <div className="w-2 h-2 rounded-full bg-amber-500 border border-white cursor-pointer relative" />
                <div className="absolute left-3 -top-2 bg-slate-900 text-white text-[8px] font-extrabold px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">PF-90218</div>
              </div>

              <div className="absolute top-[55%] right-[22%] group">
                <span className="absolute w-5 h-5 bg-emerald-500/30 rounded-full animate-ping -translate-x-[6px] -translate-y-[6px]" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 border border-white cursor-pointer relative" />
                <div className="absolute left-3 -top-2 bg-slate-900 text-white text-[8px] font-extrabold px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">PF-11024</div>
              </div>

              {/* Glassmorphic Overlay in Center */}
              <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-md flex items-center justify-center p-6 text-center select-none z-10">
                <div className="max-w-[280px]">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <RiRadarLine size={24} className="text-white animate-spin" style={{ animationDuration: '6s' }} />
                  </div>
                  <h4 className="text-white text-base font-black tracking-tight mb-1">Live GPS Tracking Coming Soon</h4>
                  <p className="text-white/80 text-xs font-semibold leading-relaxed mb-4">
                    Real-time rider telemetry, telemetry routing, and route optimization engine in final verification stages.
                  </p>
                  <button
                    onClick={() => handleActionClick('Simulate Live Telemetry')}
                    className="w-full py-2 bg-white hover:bg-slate-50 text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider hover:scale-[1.02] active:scale-98 transition-all shadow"
                  >
                    Simulate Live Telemetry
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Tracking Activity Log */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="font-black text-slate-900 text-base leading-tight mb-4">Recent Tracking Activity</h3>
            <div className="space-y-4">
              {recentLogs.map((log, index) => (
                <div key={index} className="flex gap-3 text-xs">
                  <div className="flex flex-col items-center">
                    <span className="w-2 h-2 rounded-full bg-sky-500 mt-1 shrink-0" />
                    {index < recentLogs.length - 1 && <div className="w-[1px] flex-1 bg-slate-200 my-1" />}
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase">{log.time} · {log.trackingId}</span>
                    <p className="text-slate-600 font-semibold mt-0.5 leading-snug">{log.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => handleActionClick('Full Activity Log')}
              className="w-full mt-5 py-2.5 border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              Show Full Logistics Log
            </button>
          </div>
        </div>
      </div>

      {/* ─── Generic Coming Soon Popup / Modal ─── */}
      <AnimatePresence>
        {isComingSoonOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsComingSoonOpen(false)}
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[450px] overflow-hidden rounded-[32px] border border-slate-200 bg-white p-8 shadow-2xl text-slate-800 z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsComingSoonOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all text-slate-400 hover:text-slate-700"
              >
                <RiCloseLine size={18} />
              </button>

              {/* Icon & Message */}
              <div className="flex flex-col items-center text-center mt-3">
                <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center mb-5 text-sky-600">
                  <RiCompass3Line className="animate-spin" size={28} style={{ animationDuration: '4s' }} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-[9px] font-black uppercase tracking-wider">
                    Feature Preview
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[9px] font-black uppercase tracking-wider">
                    Beta
                  </span>
                </div>

                <h3 className="text-xl font-black tracking-tight text-slate-900 mb-2">
                  {comingSoonFeature || 'Live GPS Tracking'}
                </h3>
                
                <div className="w-8 h-1 rounded-full bg-sky-500 mb-5" />

                <div className="space-y-3 font-medium text-slate-600">
                  <p className="text-sm leading-relaxed">
                    Live tracking functionality is currently under development.
                  </p>
                  <p className="text-xs text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
                    ProFast telemetry services are being validated for city-wide routing operations.
                  </p>
                </div>

                <button
                  onClick={() => setIsComingSoonOpen(false)}
                  className="w-full mt-6 py-3 rounded-xl bg-slate-900 text-white font-bold text-xs uppercase tracking-wider hover:scale-[1.02] active:scale-98 hover:shadow-lg transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Detailed View Modal ─── */}
      <AnimatePresence>
        {selectedDelivery && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedDelivery(null)}
              className="absolute inset-0 bg-slate-950/30 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 25 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[36px] border border-slate-200 bg-white p-8 shadow-2xl text-slate-800 z-10 scrollbar-none"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDelivery(null)}
                className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all text-slate-400 hover:text-slate-700"
              >
                <RiCloseLine size={18} />
              </button>

              {/* Title Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-black tracking-tight text-slate-950">Active Parcel Oversight</h3>
                  <span className="px-2 py-0.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-[8px] font-black uppercase tracking-wider">
                    Telemetry Mode
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tracking Reference: {selectedDelivery.id}</p>
              </div>

              <div className="space-y-5">
                
                {/* Visual Route Header */}
                <div className="bg-sky-50/50 border border-sky-100 rounded-2xl p-4 flex justify-between items-center gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Origin</span>
                    <h4 className="text-sm font-bold text-slate-900">{selectedDelivery.sender.district}</h4>
                  </div>
                  <div className="flex-1 flex items-center justify-center px-4 relative">
                    <div className="w-full h-[2px] bg-sky-200 border-dashed" />
                    <RiRoadMapFill className="text-sky-500 absolute bg-sky-50 p-0.5 rounded-full" size={20} />
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Destination</span>
                    <h4 className="text-sm font-bold text-slate-900">{selectedDelivery.receiver.district}</h4>
                  </div>
                </div>

                {/* Sender/Receiver Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sender Info</span>
                    <h5 className="text-sm font-bold text-slate-800 mt-1">{selectedDelivery.sender.name}</h5>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedDelivery.sender.address}</p>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Receiver Info</span>
                    <h5 className="text-sm font-bold text-slate-800 mt-1">{selectedDelivery.receiver.name}</h5>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedDelivery.receiver.address}</p>
                  </div>
                </div>

                {/* Rider Telemetry Details */}
                <div className="border border-slate-200 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Dispatcher</span>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                      <img src={selectedDelivery.rider.avatar} alt="Rider avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{selectedDelivery.rider.name}</h4>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">{selectedDelivery.rider.vehicle} · ⭐ {selectedDelivery.rider.rating}</p>
                    </div>
                    <a 
                      href={`tel:${selectedDelivery.rider.phone}`}
                      onClick={(e) => {
                        e.preventDefault();
                        toast.success(`Dialing rider: ${selectedDelivery.rider.phone}`, {
                          style: { borderRadius: '10px' }
                        });
                      }}
                      className="p-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <RiPhoneLine size={16} />
                    </a>
                  </div>
                </div>

                {/* Delivery Timeline stages */}
                <div className="border border-slate-200 rounded-2xl p-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Milestone Chronology</span>
                  <div className="mt-4 space-y-4">
                    {selectedDelivery.timeline.map((step, idx) => (
                      <div key={idx} className={`flex items-start gap-3 ${!step.done ? 'opacity-40' : ''}`}>
                        <div className="flex flex-col items-center">
                          {step.done ? (
                            <RiCheckboxCircleLine className="text-emerald-500 shrink-0" size={16} />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
                          )}
                          {idx < selectedDelivery.timeline.length - 1 && (
                            <div className={`w-[2px] h-6 my-1 ${step.done ? 'bg-emerald-300' : 'bg-slate-200'}`} />
                          )}
                        </div>
                        <div className="flex-1 flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800">{step.name}</span>
                          <span className="font-mono text-slate-500">{step.time || '—'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Smart disclaimer popup */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-xs leading-relaxed text-amber-700">
                  <RiInformationLine size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Live GPS tracking functionality is currently under development.</span> Real-time telemetry positioning and rider trajectory tracing will be integrated in the upcoming phase.
                  </div>
                </div>
                
                {/* Footer action buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => handleActionClick(`Backup Dispatcher Request - ${selectedDelivery.id}`)}
                    className="flex-1 py-3 bg-slate-950 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 hover:scale-[1.02] active:scale-98 transition-all"
                  >
                    Deploy Backup Rider
                  </button>
                  <button
                    onClick={() => setSelectedDelivery(null)}
                    className="flex-1 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-black uppercase tracking-wider hover:scale-[1.02] active:scale-98 transition-all"
                  >
                    Close View
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LiveTracking;
