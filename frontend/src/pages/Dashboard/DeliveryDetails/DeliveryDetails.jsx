import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiPhone, 
  FiUser, 
  FiClock, 
  FiCheckCircle, 
  FiActivity, 
  FiDollarSign, 
  FiFileText,
  FiTruck,
  FiCalendar,
  FiInfo
} from 'react-icons/fi';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useTheme } from '../../../contexts/ThemeContext';

const districtCoords = {
  Dhaka: [23.8103, 90.4125],
  Mirpur: [23.8223, 90.3654],
  Banani: [23.7936, 90.4065],
  Uttara: [23.8746, 90.3980],
  Gulshan: [23.7925, 90.4078],
  Dhanmondi: [23.7465, 90.3740],
  Mohammadpur: [23.7536, 90.3595],
  Badda: [23.7805, 90.4250],
  Malibagh: [23.7423, 90.4125],
  Farmgate: [23.7562, 90.3907],
  Tejgaon: [23.7608, 90.3900],
  Shyamoli: [23.7747, 90.3655],
  Dumni: [23.8400, 90.4700],
  Wari: [23.7150, 90.4150],
  Lalmatia: [23.7550, 90.3700],
  Rampura: [23.7580, 90.4150],
  Bashundhara: [23.8195, 90.4360],
  Motijheel: [23.7333, 90.4167],
  Chittagong: [22.3569, 91.7832],
  Sylhet: [24.8949, 91.8687],
  Khulna: [22.8456, 89.5403],
  Rajshahi: [24.3745, 88.6042],
  Barisal: [22.7010, 90.3535],
  Rangpur: [25.7439, 89.2752],
  Mymensingh: [24.7471, 90.4203],
  Narayanganj: [23.6238, 90.5000],
  Gazipur: [23.9999, 90.4203],
};

const resolveCoords = (district, address, isReceiver = false) => {
  const searchString = `${district || ""} ${address || ""}`.toLowerCase();
  const matchedKey = Object.keys(districtCoords).find((k) =>
    searchString.includes(k.toLowerCase())
  );
  if (matchedKey) return districtCoords[matchedKey];
  if (isReceiver) return [23.832, 90.435];
  return [23.785, 90.385];
};

const getDistanceVal = (p1, p2) => {
  if (!p1 || !p2) return 5.2;
  const dx = (p1[0] - p2[0]) * 111;
  const dy = (p1[1] - p2[1]) * 111;
  const rawDist = Math.sqrt(dx * dx + dy * dy);
  return rawDist > 0 ? rawDist : 3.5;
};

const statusConfig = {
  driver_assigned: {
    label: "Assigned",
    bg: "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800",
    text: "text-slate-700 dark:text-slate-300",
    actionLabel: "Start Pickup",
    nextStatus: "picked_up"
  },
  driver_accepted: {
    label: "Pending Pickup",
    bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400",
    actionLabel: "Start Pickup",
    nextStatus: "picked_up"
  },
  accepted: {
    label: "Pending Pickup",
    bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400",
    actionLabel: "Start Pickup",
    nextStatus: "picked_up"
  },
  picked_up: {
    label: "Picked Up",
    bg: "bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/30 text-purple-700 dark:text-purple-400",
    actionLabel: "Start Delivery",
    nextStatus: "on_the_way"
  },
  on_the_way: {
    label: "On The Way",
    bg: "bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30 text-blue-700 dark:text-blue-400",
    actionLabel: "Mark Delivered",
    nextStatus: "delivered"
  },
  delivered: {
    label: "Delivered",
    bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400",
    actionLabel: "View Summary",
    nextStatus: null
  },
};

const DeliveryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { isDark: isDarkMode } = useTheme();

  // Fetch single delivery details
  const { data: delivery, isLoading, error, refetch } = useQuery({
    queryKey: ['rider-delivery', id],
    queryFn: async () => {
      const res = await axiosSecure.get(`/rider/delivery/${id}`);
      return res.data?.delivery || null;
    },
    enabled: !!id,
    retry: 1
  });

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ status }) => {
      return axiosSecure.patch(`/rider/delivery/${id}/status`, {
        deliveryStatus: status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rider-delivery', id] });
      queryClient.invalidateQueries({ queryKey: ['rider-deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['rider-dashboard-stats'] });
      toast.success("Delivery status updated successfully!", { icon: "✅" });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status", {
        icon: "❌",
      });
    },
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center transition-colors duration-300 ${isDarkMode ? 'bg-[#060a14]' : 'bg-slate-50'}`}>
        <span className="loading loading-spinner loading-lg text-[#FF6A13]"></span>
        <p className={`mt-4 font-semibold text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Loading delivery details...</p>
      </div>
    );
  }

  if (error || !delivery) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center p-6 transition-colors duration-300 ${isDarkMode ? 'bg-[#060a14]' : 'bg-slate-50'}`}>
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center mb-4 border border-red-100 dark:border-red-900/30">
          <FiInfo className="text-red-600 dark:text-red-400 text-2xl" />
        </div>
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Failed to load delivery details</h3>
        <p className="text-slate-500 mt-2 mb-6 max-w-sm text-center text-sm">
          {error?.response?.data?.message || 'This delivery does not exist, or you are not authorized to view it.'}
        </p>
        <button
          onClick={() => navigate('/dashboard/rider-dashboard')}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#FF6A13] hover:bg-[#e05a0b] text-white rounded-xl font-semibold text-sm transition shadow-sm"
        >
          <FiArrowLeft /> Back to Dashboard
        </button>
      </div>
    );
  }

  // Map coordinate values for display
  const p1 = resolveCoords(delivery.senderDistrict, delivery.senderAddress, false);
  const p2 = resolveCoords(delivery.receiverDistrict, delivery.receiverAddress, true);
  const distVal = getDistanceVal(p1, p2);
  const etaVal = delivery.deliveryStatus === "delivered" ? "Delivered" : `${Math.round(distVal * 4 + 10)} MIN`;
  const earningsVal = Math.round((delivery.totalPrice || 0) * 0.7);

  const status = delivery.deliveryStatus === "accepted" ? "driver_accepted" : delivery.deliveryStatus;
  const cfg = statusConfig[status] || statusConfig["driver_accepted"];

  // Timeline variables
  const isCreated = true;
  const isAssigned = ["driver_assigned", "driver_accepted", "picked_up", "on_the_way", "delivered"].includes(status);
  const isPending = ["driver_accepted", "picked_up", "on_the_way", "delivered"].includes(status);
  const isPickedUp = ["picked_up", "on_the_way", "delivered"].includes(status);
  const isOnTheWay = ["on_the_way", "delivered"].includes(status);
  const isDelivered = status === "delivered";

  const timeline = [
    {
      step: "Parcel Registered",
      time: delivery.createdAt ? new Date(delivery.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      done: isCreated,
    },
    {
      step: "Rider Assigned",
      time: delivery.updatedAt ? new Date(delivery.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      done: isAssigned,
    },
    {
      step: "Pending Pickup",
      time: status === "driver_accepted" ? "Active" : "",
      done: isPending,
      active: status === "driver_accepted",
    },
    {
      step: "Picked Up",
      time: status === "picked_up" ? "Active" : "",
      done: isPickedUp,
      active: status === "picked_up",
    },
    {
      step: "On The Way",
      time: status === "on_the_way" ? "Active" : "",
      done: isOnTheWay,
      active: status === "on_the_way",
    },
    {
      step: "Delivered",
      time: status === "delivered" ? new Date(delivery.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      done: isDelivered,
      active: status === "delivered",
    },
  ];

  const handleAction = () => {
    if (cfg.nextStatus) {
      updateStatusMutation.mutate({ status: cfg.nextStatus });
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-6 lg:p-8 transition-colors duration-300 font-sans ${isDarkMode ? 'bg-[#060a14] text-slate-100' : 'bg-slate-50/50 text-slate-800'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard/rider-dashboard')}
            className={`flex items-center gap-2 px-4 py-2 border rounded-xl font-bold text-xs md:text-sm transition cursor-pointer ${
              isDarkMode 
              ? 'bg-[#111827]/40 border-slate-800 hover:bg-[#111827] text-slate-300' 
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <FiArrowLeft /> Back to Dashboard
          </button>
          
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className={`flex items-center gap-1.5 px-4 py-2 border rounded-xl font-bold text-xs md:text-sm transition cursor-pointer ${
              isDarkMode 
              ? 'bg-[#111827]/40 border-slate-800 hover:bg-[#111827] text-slate-300' 
              : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            Refresh Data
          </button>
        </div>

        {/* Top Info Banner */}
        <div className={`border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 ${
          isDarkMode ? 'bg-[#111827]/60 border-slate-800/80' : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FF6A13]/10 border border-[#FF6A13]/20 flex items-center justify-center text-3xl flex-shrink-0">
              📦
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight">{delivery.parcelName || 'Unnamed Package'}</h1>
                <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-0.5 rounded-full border ${cfg.bg}`}>
                  {cfg.label}
                </span>
              </div>
              <div className="font-mono text-xs text-slate-400 mt-1">Tracking ID: #{delivery.trackingId}</div>
              <div className="flex gap-2 mt-2">
                <span className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase">
                  {(delivery.parcelType || 'STANDARD').toUpperCase()}
                </span>
                <span className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase">
                  {delivery.parcelWeight || 1.0} kg
                </span>
              </div>
            </div>
          </div>

          {/* Earnings card */}
          <div className={`rounded-xl p-4 min-w-[140px] text-center md:text-right border ${
            isDarkMode ? 'bg-[#1f2937]/25 border-slate-800' : 'bg-slate-50 border-slate-100'
          }`}>
            <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">YOUR COMMISSION (70%)</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-500 mt-0.5">৳{earningsVal}</div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">Total Fee: ৳{delivery.totalPrice}</div>
          </div>
        </div>

        {/* Timeline Progress Banner */}
        {delivery.deliveryStatus === "delivered" && (
          <div className="bg-emerald-50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
              <FiCheckCircle className="text-base" />
              <span>Delivery Completed Successfully</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
              This shipment was successfully dropped off at its destination. Your payout of ৳{earningsVal} has been recorded in your ledger.
            </p>
          </div>
        )}

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left / Center: Customer & Route Info */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Delivery Route */}
            <div className={`border rounded-2xl p-5 shadow-sm space-y-4 ${isDarkMode ? 'bg-[#111827]/60 border-slate-800/80' : 'bg-white border-slate-100'}`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <FiMapPin className="text-[#FF6A13]" /> <span>Delivery Route</span>
              </div>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">PICKUP FROM</div>
                    <div className="text-sm font-bold mt-0.5">{delivery.senderDistrict}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{delivery.senderAddress}</div>
                  </div>
                </div>
                <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-800 ml-[3px]" />
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">DROP-OFF TO</div>
                    <div className="text-sm font-bold mt-0.5">{delivery.receiverDistrict}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{delivery.receiverAddress}</div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-bold">
                  <span>📍 Distance: {distVal.toFixed(1)} KM</span>
                  <span>⏱ ETA: {etaVal}</span>
                </div>
              </div>
            </div>

            {/* Sender Details */}
            <div className={`border rounded-2xl p-5 shadow-sm space-y-3 ${isDarkMode ? 'bg-[#111827]/60 border-slate-800/80' : 'bg-white border-slate-100'}`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <FiUser /> <span>Sender Details</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-400">Name</span>
                  <span className="font-semibold">{delivery.senderName}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-mono font-semibold">{delivery.senderPhone}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-400">District</span>
                  <span className="font-semibold">{delivery.senderDistrict}</span>
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {delivery.senderPhone && (
                    <button 
                      className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      onClick={() => window.open(`tel:${delivery.senderPhone}`)}
                    >
                      <FiPhone /> Call Sender
                    </button>
                  )}
                  <button 
                    className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    onClick={() => {
                      const address = `${delivery.senderAddress}, ${delivery.senderDistrict}, Bangladesh`;
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
                    }}
                  >
                    Google Map
                  </button>
                </div>
              </div>
            </div>

            {/* Receiver Details */}
            <div className={`border rounded-2xl p-5 shadow-sm space-y-3 ${isDarkMode ? 'bg-[#111827]/60 border-slate-800/80' : 'bg-white border-slate-100'}`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <FiUser /> <span>Receiver Details</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-400">Name</span>
                  <span className="font-semibold">{delivery.receiverName}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-400">Phone</span>
                  <span className="font-mono font-semibold">{delivery.receiverPhone}</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span className="text-slate-400">District</span>
                  <span className="font-semibold">{delivery.receiverDistrict}</span>
                </div>
                
                <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  {delivery.receiverPhone && (
                    <button 
                      className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      onClick={() => window.open(`tel:${delivery.receiverPhone}`)}
                    >
                      <FiPhone /> Call Receiver
                    </button>
                  )}
                  <button 
                    className="flex-1 py-2.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                    onClick={() => {
                      const address = `${delivery.receiverAddress}, ${delivery.receiverDistrict}, Bangladesh`;
                      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
                    }}
                  >
                    Google Map
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Spec / Instructions */}
            <div className={`border rounded-2xl p-5 shadow-sm space-y-3 ${isDarkMode ? 'bg-[#111827]/60 border-slate-800/80' : 'bg-white border-slate-100'}`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <FiFileText /> <span>Instructions & Notes</span>
              </div>
              <div className="text-xs space-y-2">
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Payment Mode</span>
                  <span className={`font-bold uppercase ${delivery.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {delivery.paymentStatus === 'paid' ? 'Prepaid (Paid Online)' : 'COD (Collect Cash)'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Fragile Package</span>
                  <span className="font-semibold">{delivery.fragile || (delivery.parcelType === 'fragile' ? 'Yes' : 'No')}</span>
                </div>
                <div className="flex flex-col py-1 gap-1">
                  <span className="text-slate-400">Rider Instructions</span>
                  <span className="bg-slate-50 dark:bg-[#1f2937]/35 border border-slate-100 dark:border-slate-800 p-2.5 rounded-xl text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {delivery.note || 'No specific notes provided.'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Actions & Timeline */}
          <div className="space-y-6">
            
            {/* Transition Controls */}
            <div className={`border rounded-2xl p-5 shadow-sm space-y-4 ${isDarkMode ? 'bg-[#111827]/60 border-slate-800/80' : 'bg-white border-slate-100'}`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <FiActivity /> <span>Delivery Action</span>
              </div>
              {delivery.deliveryStatus !== 'delivered' && cfg.nextStatus ? (
                <button
                  className="w-full bg-[#FF6A13] hover:bg-[#e05a0b] text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
                  onClick={handleAction}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />
                  )}
                  {updateStatusMutation.isPending ? 'Updating Status...' : `${cfg.actionLabel} 🚀`}
                </button>
              ) : (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 text-center py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  <FiCheckCircle /> Complete Delivery
                </div>
              )}
            </div>

            {/* Timeline details */}
            <div className={`border rounded-2xl p-5 shadow-sm space-y-4 ${isDarkMode ? 'bg-[#111827]/60 border-slate-800/80' : 'bg-white border-slate-100'}`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <FiClock /> <span>Delivery Timeline</span>
              </div>
              
              <div className="flex flex-col relative pl-2">
                {timeline.map((step, i) => (
                  <div key={i} className="flex gap-4 min-h-[50px] relative">
                    
                    {/* Connector */}
                    <div className="flex flex-col items-center w-4 flex-shrink-0">
                      <div 
                        className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          step.done 
                            ? step.active 
                              ? 'bg-slate-900 border-slate-900 dark:bg-slate-200 dark:border-slate-200 shadow-sm' 
                              : 'bg-emerald-600 border-emerald-600' 
                            : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        {step.done && <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900" />}
                      </div>
                      {i < timeline.length - 1 && (
                        <div 
                          className={`w-[1.5px] flex-grow my-1 ${
                            step.done ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        />
                      )}
                    </div>

                    {/* Timeline Text */}
                    <div className="pb-3 text-xs">
                      <div className={`font-bold ${step.done ? (isDarkMode ? 'text-slate-200' : 'text-slate-800') : 'text-slate-400'}`}>
                        {step.step}
                      </div>
                      {step.time && (
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-bold">
                          <FiCalendar /> {step.time}
                        </div>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DeliveryDetails;
