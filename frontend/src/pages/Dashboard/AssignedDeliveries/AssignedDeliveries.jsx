import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { 
  FiRefreshCw, 
  FiAlertCircle, 
  FiPhone, 
  FiCopy, 
  FiMapPin, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiNavigation, 
  FiUser, 
  FiChevronRight, 
  FiInfo, 
  FiTrendingUp, 
  FiDollarSign,
  FiX,
  FiCalendar
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import useAuth from "../../../hooks/useAuth";
import useAxiosSecure from "../../../hooks/useAxiosSecure";
import { useNotifications } from "../../../contexts/NotificationContext";
import RiderDrawer from "../../../components/RiderDrawer";

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
  driver_accepted: {
    label: "Pending Pickup",
    color: "#D97706", // amber-600
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    actionLabel: "Start Pickup",
  },
  picked_up: {
    label: "Picked Up",
    color: "#7C3AED", // violet-600
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    actionLabel: "Start Delivery",
  },
  on_the_way: {
    label: "On The Way",
    color: "#059669", // emerald-600
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    actionLabel: "Mark Delivered",
  },
  delivered: {
    label: "Delivered",
    color: "#0891B2", // cyan-600
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    actionLabel: "View Summary", // Replace all actions for delivered status with "View Summary"
  },
};

const filterTabs = [
  { key: "all", label: "All" },
  { key: "driver_accepted", label: "Pending Pickup" },
  { key: "picked_up", label: "Picked Up" },
  { key: "on_the_way", label: "On The Way" },
  { key: "delivered", label: "Delivered" },
];

export default function AssignedDeliveries() {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const { socket } = useNotifications();

  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch assigned deliveries
  const {
    data: parcels = [],
    isLoading: isParcelsLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["assigned-deliveries", user?.email],
    queryFn: async () => {
      const res = await axiosSecure.get("/parcels/assigned");
      return res.data || [];
    },
    enabled: !!user?.email,
  });

  // Handle Socket.IO real-time updates
  useEffect(() => {
    if (!socket || !user?.email) return;

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["assigned-deliveries", user?.email] });
    };

    socket.on("delivery_accepted", handleUpdate);
    socket.on("delivery_updated", handleUpdate);
    socket.on("rider_stats_updated", (data) => {
      if (data.email === user?.email) handleUpdate();
    });

    return () => {
      socket.off("delivery_accepted", handleUpdate);
      socket.off("delivery_updated", handleUpdate);
      socket.off("rider_stats_updated");
    };
  }, [socket, user?.email, queryClient]);

  // Mutation for updating status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ parcelId, status }) => {
      return axiosSecure.patch(`/rider/delivery/${parcelId}/status`, {
        deliveryStatus: status,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assigned-deliveries", user?.email] });
      queryClient.invalidateQueries({ queryKey: ["rider-dashboard-stats"] });
      toast.success("Delivery status updated successfully!", { icon: "✅" });

      // Live update drawer content if it's currently open
      if (selectedDelivery && selectedDelivery.id === variables.parcelId) {
        setSelectedDelivery((prev) => {
          const updatedStatus = variables.status;
          return {
            ...prev,
            status: updatedStatus,
            timeline: prev.timeline.map((step) => {
              if (step.step === "Picked Up" && updatedStatus === "picked_up") {
                return { ...step, done: true, active: true };
              }
              if (step.step === "On The Way" && updatedStatus === "on_the_way") {
                return { ...step, done: true, active: true };
              }
              if (step.step === "Delivered" && updatedStatus === "delivered") {
                return { ...step, done: true, active: true };
              }
              return { ...step, active: false };
            }),
          };
        });
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status", {
        icon: "❌",
      });
    },
  });

  const getTimeline = (d) => {
    const s = d.deliveryStatus;
    const isCreated = true;
    const isAssigned = ["driver_assigned", "driver_accepted", "picked_up", "on_the_way", "delivered"].includes(s);
    const isPending = ["driver_accepted", "picked_up", "on_the_way", "delivered"].includes(s);
    const isPickedUp = ["picked_up", "on_the_way", "delivered"].includes(s);
    const isOnTheWay = ["on_the_way", "delivered"].includes(s);
    const isDelivered = s === "delivered";

    return [
      {
        step: "Parcel Created",
        time: d.createdAt
          ? new Date(d.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        done: isCreated,
      },
      {
        step: "Rider Assigned",
        time: d.updatedAt
          ? new Date(d.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        done: isAssigned,
      },
      {
        step: "Pending Pickup",
        time: s === "driver_accepted" ? "Active" : "",
        done: isPending,
        active: s === "driver_accepted",
      },
      {
        step: "Picked Up",
        time: s === "picked_up" ? "Active" : "",
        done: isPickedUp,
        active: s === "picked_up",
      },
      {
        step: "On The Way",
        time: s === "on_the_way" ? "Active" : "",
        done: isOnTheWay,
        active: s === "on_the_way",
      },
      {
        step: "Delivered",
        time: s === "delivered"
          ? new Date(d.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "",
        done: isDelivered,
        active: s === "delivered",
      },
    ];
  };

  const mapParcelData = (d) => {
    const p1 = resolveCoords(d.senderDistrict, d.pickupAddress || d.senderAddress, false);
    const p2 = resolveCoords(d.receiverDistrict, d.receiverAddress, true);
    const distVal = getDistanceVal(p1, p2);
    const etaVal = d.deliveryStatus === "delivered" ? "Delivered" : `${Math.round(distVal * 4 + 10)} MIN`;

    return {
      _id: d._id,
      id: d._id,
      parcelName: d.parcelName || "Package",
      trackingId: d.trackingId || `TRK-${d._id?.slice(-6)?.toUpperCase()}`,
      type: d.parcelType ? d.parcelType.toUpperCase() : "STANDARD",
      weight: d.parcelWeight ? `${d.parcelWeight} kg` : "1.0 kg",
      status: d.deliveryStatus,
      pickupDistrict: d.senderDistrict || d.pickupDistrict || "N/A",
      pickupAddress: d.senderAddress || d.pickupAddress || "N/A",
      deliveryDistrict: d.receiverDistrict || d.deliveryDistrict || "N/A",
      deliveryAddress: d.receiverAddress || d.deliveryAddress || "N/A",
      distance: `${distVal.toFixed(1)} KM`,
      eta: etaVal,
      earnings: Math.round((d.totalPrice || 0) * 0.7),
      deliveryFee: d.totalPrice || 0,
      paymentStatus: d.paymentStatus === "paid" ? "PREPAID" : "COD",
      requestedAt: d.createdAt
        ? new Date(d.createdAt).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "N/A",
      deliveredAt: d.deliveryStatus === "delivered" && d.updatedAt
        ? new Date(d.updatedAt).toLocaleString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "N/A",
      senderName: d.senderName || "N/A",
      senderPhone: d.senderPhone || "N/A",
      senderDivision: d.senderDivision || "N/A",
      senderDistrict: d.senderDistrict || "N/A",
      receiverName: d.receiverName || "N/A",
      receiverPhone: d.receiverPhone || "N/A",
      receiverDivision: d.receiverDivision || "N/A",
      receiverDistrict: d.receiverDistrict || "N/A",
      receiverAddress: d.receiverAddress || "N/A",
      fragile: d.parcelType === "fragile" || d.fragile === true || d.fragile === "Yes" ? "Yes" : "No",
      note: d.note || "No instruction note",
      timeline: getTimeline(d),
    };
  };

  const handleAction = async (delivery, nextStatus) => {
    if (!nextStatus) return;
    updateStatusMutation.mutate({ parcelId: delivery.id || delivery._id, status: nextStatus });
  };

  const getNextStatus = (status) => {
    const map = {
      driver_accepted: "picked_up",
      picked_up: "on_the_way",
      on_the_way: "delivered",
    };
    return map[status] || null;
  };

  const filtered = useMemo(() => {
    const statusPriority = {
      driver_accepted: 1,
      picked_up: 2,
      on_the_way: 3,
      delivered: 4,
    };

    const baseList = activeFilter === "all"
      ? parcels
      : parcels.filter((d) => d.deliveryStatus === activeFilter);

    return [...baseList].sort((a, b) => {
      const priorityA = statusPriority[a.deliveryStatus] || 99;
      const priorityB = statusPriority[b.deliveryStatus] || 99;
      return priorityA - priorityB;
    });
  }, [parcels, activeFilter]);

  const counts = useMemo(() => {
    return {
      all: parcels.length,
      driver_accepted: parcels.filter((d) => d.deliveryStatus === "driver_accepted").length,
      picked_up: parcels.filter((d) => d.deliveryStatus === "picked_up").length,
      on_the_way: parcels.filter((d) => d.deliveryStatus === "on_the_way").length,
      delivered: parcels.filter((d) => d.deliveryStatus === "delivered").length,
    };
  }, [parcels]);

  const completedToday = useMemo(() => {
    return parcels.filter((d) => d.deliveryStatus === "delivered").length;
  }, [parcels]);

  const activeOrders = useMemo(() => {
    return parcels.filter(
      (d) => d.deliveryStatus !== "delivered" && d.deliveryStatus !== "delivery_failed"
    ).length;
  }, [parcels]);

  const progress = useMemo(() => {
    if (parcels.length === 0) return 0;
    return Math.round((completedToday / parcels.length) * 100);
  }, [parcels, completedToday]);

  const totalEarnings = useMemo(() => {
    return parcels
      .filter((d) => d.deliveryStatus === "delivered")
      .reduce((sum, d) => sum + Math.round((d.totalPrice || 0) * 0.7), 0);
  }, [parcels]);

  const openDrawer = (d) => {
    setSelectedDelivery(d);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedDelivery(null), 300);
  };

  if (isParcelsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-100 min-h-[400px] shadow-sm">
        <span className="loading loading-spinner loading-lg text-slate-800"></span>
        <p className="text-slate-500 mt-4 font-semibold text-sm">Loading assigned deliveries...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-slate-100 min-h-[400px] p-6 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100">
          <FiAlertCircle className="text-red-600 text-2xl" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Failed to load assigned deliveries</h3>
        <p className="text-slate-500 mt-2 mb-6 max-w-sm text-sm">
          Something went wrong while connecting to the server. Please try again.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold text-sm transition shadow-sm"
        >
          <FiRefreshCw /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION WITH REFRESH */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Assigned Deliveries</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Manage and track your accepted shipment requests in real time
            </p>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isParcelsLoading}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold text-xs md:text-sm hover:bg-slate-50 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <FiRefreshCw className={`text-slate-800 ${isParcelsLoading ? "animate-spin" : ""}`} />
            {isParcelsLoading ? "Refreshing..." : "Refresh Queue"}
          </button>
        </header>

        {/* STATISTICS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            {
              label: "ACTIVE ORDERS",
              value: activeOrders,
              sub: "Ongoing deliveries",
              icon: <FiTruck className="text-indigo-600" />,
              bg: "bg-indigo-50",
            },
            {
              label: "TODAY'S EARNINGS",
              value: `৳${totalEarnings}`,
              sub: "Rider payout (70%)",
              icon: <FiDollarSign className="text-emerald-600" />,
              bg: "bg-emerald-50",
            },
            {
              label: "COMPLETED TODAY",
              value: completedToday,
              sub: "Successful drops",
              icon: <FiCheckCircle className="text-cyan-600" />,
              bg: "bg-cyan-50",
            },
            {
              label: "DELIVERY PROGRESS",
              value: `${progress}%`,
              sub: "Completion ratio",
              icon: <FiTrendingUp className="text-amber-600" />,
              bg: "bg-amber-50",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md">
              <div>
                <div className="text-[10px] md:text-xs font-bold text-slate-400 tracking-wider uppercase">{s.label}</div>
                <div className="text-xl md:text-2xl font-black text-slate-800 mt-1">{s.value}</div>
                <div className="text-[10px] md:text-xs text-slate-400 mt-0.5">{s.sub}</div>
              </div>
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${s.bg} flex items-center justify-center text-lg md:text-xl flex-shrink-0`}>
                {s.icon}
              </div>
            </div>
          ))}
        </div>

        {/* FILTER NAVIGATION TABS */}
        <div className="flex gap-2 flex-wrap items-center justify-between bg-white border border-slate-100 p-1.5 rounded-2xl shadow-sm">
          <div className="flex gap-1 overflow-x-auto scrollbar-none w-full">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  activeFilter === tab.key 
                    ? "bg-green-500 text-white shadow-sm" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}
                onClick={() => setActiveFilter(tab.key)}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                  activeFilter === tab.key 
                    ? "bg-white/20 text-white" 
                    : "bg-slate-100 text-slate-600"
                }`}>
                  {counts[tab.key]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* CARD CONTAINER */}
        <div className="flex flex-col gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 px-6 text-center shadow-sm"
              >
                <div className="text-4xl mb-4">📦</div>
                <h3 className="text-base font-bold text-slate-700">No assigned deliveries found</h3>
                <p className="text-slate-400 mt-2 max-w-sm mx-auto text-xs md:text-sm">
                  {activeFilter === "all"
                    ? "New delivery requests assigned to you will appear here."
                    : `No active deliveries match the "${statusConfig[activeFilter]?.label || activeFilter}" filter.`}
                </p>
              </motion.div>
            ) : (
              filtered.map((d, i) => {
                const item = mapParcelData(d);
                const cfg = statusConfig[item.status];
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, delay: i * 0.05 }}
                    className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-slate-200/80 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* LEFT SECTION - PARCEL TYPE */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl text-slate-500 flex-shrink-0">
                        📦
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-800">{item.parcelName}</h4>
                        <div className="font-mono text-xs text-slate-400 mt-0.5">#{item.trackingId}</div>
                        <div className="flex gap-2 mt-2">
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase">
                            {item.type}
                          </span>
                          <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase">
                            {item.weight}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* CENTER SECTION - ROUTE & ETA ONLY */}
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] font-bold text-amber-600 tracking-wider uppercase">● PICKUP ADDRESS</div>
                          <div className="text-slate-800 text-xs mt-1 leading-relaxed">
                            <span className="font-bold text-slate-900 block">{item.pickupDistrict}</span>
                            {item.pickupAddress}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-emerald-600 tracking-wider uppercase">● DELIVERY ADDRESS</div>
                          <div className="text-slate-800 text-xs mt-1 leading-relaxed">
                            <span className="font-bold text-slate-900 block">{item.deliveryDistrict}</span>
                            {item.deliveryAddress}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pt-1">
                        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg font-bold">
                          📍 {item.distance}
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1">
                          <FiClock className="text-slate-400" /> {item.eta}
                        </span>
                      </div>
                    </div>

                    {/* RIGHT SECTION - EARNINGS AND ACTIONS */}
                    <div className="flex flex-row md:flex-col justify-between md:items-end items-center gap-3 border-t md:border-t-0 border-slate-50 pt-4 md:pt-0">
                      <div className="text-left md:text-right">
                        <div className="text-[9px] font-bold text-slate-400 tracking-widest uppercase">EARNINGS</div>
                        <div className="text-xl font-black text-emerald-600 mt-0.5">৳{item.earnings}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          item.paymentStatus === "PREPAID"
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : "bg-amber-50 border-amber-100 text-amber-700"
                        }`}>
                          {item.paymentStatus}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2.5">
                        <span className={`hidden sm:inline-block text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${cfg?.bg} ${cfg?.border} ${cfg?.text}`}>
                          {cfg?.label}
                        </span>
                        <button
                          onClick={() => openDrawer(item)}
                          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs md:text-sm px-4.5 py-2.5 rounded-xl transition shadow-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          {cfg?.actionLabel} <FiChevronRight />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

        {/* DETAILS DRAWER WITH SMOOTH FRAMER-MOTION SLIDER */}
        <RiderDrawer
          isOpen={drawerOpen}
          onClose={closeDrawer}
          parcel={selectedDelivery}
          onAction={() => handleAction(selectedDelivery, getNextStatus(selectedDelivery.status))}
          loadingAction={updateStatusMutation.isPending && updateStatusMutation.variables?.parcelId === selectedDelivery.id}
        />

      </div>
    </div>
  );
}
