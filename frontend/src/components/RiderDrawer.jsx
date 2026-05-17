import { 
  FiCheckCircle, 
  FiClock, 
  FiMapPin, 
  FiUser, 
  FiInfo, 
  FiX,
  FiCalendar
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

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

const statusConfig = {
  driver_assigned: {
    label: "Assigned",
    color: "#4B5563",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
    actionLabel: "Start Pickup",
  },
  driver_accepted: {
    label: "Pending Pickup",
    color: "#D97706",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
    actionLabel: "Start Pickup",
  },
  picked_up: {
    label: "Picked Up",
    color: "#7C3AED",
    bg: "bg-violet-50",
    border: "border-violet-200",
    text: "text-violet-700",
    actionLabel: "Start Delivery",
  },
  on_the_way: {
    label: "On The Way",
    color: "#059669",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
    actionLabel: "Mark Delivered",
  },
  delivered: {
    label: "Delivered",
    color: "#0891B2",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
    actionLabel: "View Summary",
  },
};

const standardizeParcel = (d) => {
  if (!d) return null;

  const id = d.id || d._id || "";
  const parcelName = d.parcelName || d.name || "Package";
  const trackingId = d.trackingId || "";
  const type = (d.parcelType || d.type || d.category || "STANDARD").toUpperCase();
  const weight = d.parcelWeight ? `${d.parcelWeight} kg` : (d.weight || "1.0 kg");
  const status = d.deliveryStatus || d.statusRaw || (d.status ? d.status.toLowerCase().replace(/ /g, "_") : "driver_accepted");
  
  const pickupDistrict = d.senderDistrict || d.pickupDistrict || d.pickup || "N/A";
  const pickupAddress = d.senderAddress || d.pickupAddress || "N/A";
  const deliveryDistrict = d.receiverDistrict || d.deliveryDistrict || d.delivery || "N/A";
  const deliveryAddress = d.receiverAddress || d.deliveryAddress || "N/A";
  
  const earnings = d.earnings || d.earning || Math.round((d.totalPrice || 0) * 0.7);
  const deliveryFee = d.deliveryFee || d.totalPrice || 0;
  const paymentStatus = d.paymentStatus === "paid" ? "PREPAID" : "COD";
  
  const requestedAt = d.createdAt
    ? new Date(d.createdAt).toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : d.requestedAt || "N/A";

  const deliveredAt = d.deliveredAt || d.deliveredDateFormatted 
    ? (d.deliveredAt ? new Date(d.deliveredAt).toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        day: "numeric",
        month: "short",
        year: "numeric",
      }) : `${d.deliveredDateFormatted} ${d.deliveredTimeFormatted || ""}`)
    : "N/A";

  const senderName = d.senderName || "N/A";
  const senderPhone = d.senderPhone || d.phoneNumber || "N/A";
  const senderDivision = d.senderDivision || d.division || "N/A";
  
  const receiverName = d.receiverName || "N/A";
  const receiverPhone = d.receiverPhone || d.receiverPhoneNumber || "N/A";
  const receiverDivision = d.receiverDivision || "N/A";
  
  const fragile = d.parcelType === "fragile" || d.fragile === true || d.fragile === "Yes" ? "Yes" : "No";
  const note = d.note || "No instruction note";

  // Coordinates lookup for distance calculation fallback
  const resolveCoordsLocal = (dist, addr, isRec = false) => {
    const searchString = `${dist || ""} ${addr || ""}`.toLowerCase();
    const matchedKey = Object.keys(districtCoords).find((k) =>
      searchString.includes(k.toLowerCase())
    );
    if (matchedKey) return districtCoords[matchedKey];
    if (isRec) return [23.832, 90.435];
    return [23.785, 90.385];
  };

  const getDistanceValLocal = (p1, p2) => {
    if (!p1 || !p2) return 5.2;
    const dx = (p1[0] - p2[0]) * 111;
    const dy = (p1[1] - p2[1]) * 111;
    const rawDist = Math.sqrt(dx * dx + dy * dy);
    return rawDist > 0 ? rawDist : 3.5;
  };

  const p1 = resolveCoordsLocal(pickupDistrict, pickupAddress, false);
  const p2 = resolveCoordsLocal(deliveryDistrict, deliveryAddress, true);
  const distVal = getDistanceValLocal(p1, p2);
  const distance = d.distance || `${distVal.toFixed(1)} KM`;
  const eta = d.eta || (status === "delivered" ? "Delivered" : `${Math.round(distVal * 4 + 10)} MIN`);

  // Timeline builder
  const isCreated = true;
  const isAssigned = ["driver_assigned", "driver_accepted", "picked_up", "on_the_way", "delivered"].includes(status);
  const isPending = ["driver_accepted", "picked_up", "on_the_way", "delivered"].includes(status);
  const isPickedUp = ["picked_up", "on_the_way", "delivered"].includes(status);
  const isOnTheWay = ["on_the_way", "delivered"].includes(status);
  const isDelivered = status === "delivered";

  const timeline = [
    {
      step: "Parcel Created",
      time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      done: isCreated,
    },
    {
      step: "Rider Assigned",
      time: d.updatedAt ? new Date(d.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
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
      time: status === "delivered" ? new Date(d.updatedAt || d.deliveredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
      done: isDelivered,
      active: status === "delivered",
    },
  ];

  return {
    id,
    parcelName,
    trackingId,
    type,
    weight,
    status,
    pickupDistrict,
    pickupAddress,
    deliveryDistrict,
    deliveryAddress,
    earnings,
    deliveryFee,
    paymentStatus,
    requestedAt,
    deliveredAt,
    senderName,
    senderPhone,
    senderDivision,
    receiverName,
    receiverPhone,
    receiverDivision,
    fragile,
    note,
    timeline,
    distance,
    eta
  };
};

export default function RiderDrawer({ isOpen, onClose, parcel, onAction, loadingAction }) {
  const d = standardizeParcel(parcel);

  if (!d) return null;
  const cfg = statusConfig[d.status] || statusConfig["driver_accepted"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900 z-50 backdrop-blur-sm"
          />

          {/* SLIDE-OUT PANEL */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.32 }}
            className="fixed top-0 right-0 h-full bg-white z-50 flex flex-col shadow-2xl w-full sm:w-[460px] border-l border-slate-100"
          >
            <div className="flex flex-col h-full overflow-hidden bg-white text-slate-800">
              
              {/* DRAWER HEADER */}
              <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white sticky top-0 z-10">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{d.status === "delivered" ? "Delivery Summary" : "Delivery Details"}</h2>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">#{d.trackingId}</p>
                </div>
                <button 
                  className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer"
                  onClick={onClose}
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              {/* DRAWER SCROLL CONTENT */}
              <div className="grow overflow-y-auto p-6 space-y-6 scrollbar-none">
                
                {/* COMPLETION SUMMARY BANNER (IF DELIVERED) */}
                {d.status === "delivered" && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase tracking-wider">
                      <FiCheckCircle className="text-base" />
                      <span>Delivery Completion Summary</span>
                    </div>
                    <p className="text-xs text-emerald-700 leading-relaxed">
                      This shipment was successfully delivered to the recipient. A rider payout of <span className="font-extrabold">৳{d.earnings}</span> (70% of delivery fee) has been credited to your rider account.
                    </p>
                    <div className="pt-2 border-t border-emerald-100/50 flex justify-between items-center text-[10px] text-emerald-600 font-bold">
                      <span>Finalized At:</span>
                      <span>{d.deliveredAt}</span>
                    </div>
                  </div>
                )}

                {/* PARCEL SUMMARY TOP */}
                <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl flex-shrink-0">
                    📦
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">{d.parcelName}</h3>
                    <div className="flex gap-2 mt-2 items-center">
                      <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-wide uppercase">
                        {d.type}
                      </span>
                      <span className="bg-slate-100 border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg text-[9px] font-bold tracking-wide uppercase">
                        {d.weight}
                      </span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${cfg?.bg} ${cfg?.border} ${cfg?.text}`}>
                        {cfg?.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* FINANCIAL OVERVIEW */}
                <div className="grid grid-cols-3 gap-3 bg-slate-50/50 border border-slate-100 rounded-xl p-4">
                  <div className="text-center border-r border-slate-200/50">
                    <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">EARNINGS</div>
                    <div className="text-base font-black text-emerald-600 mt-1">৳{d.earnings}</div>
                  </div>
                  <div className="text-center border-r border-slate-200/50">
                    <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">DELIVERY FEE</div>
                    <div className="text-base font-bold text-slate-700 mt-1">৳{d.deliveryFee}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">PAYMENT</div>
                    <div className={`text-base font-black mt-1 ${d.paymentStatus === "PREPAID" ? "text-emerald-600" : "text-amber-600"}`}>
                      {d.paymentStatus}
                    </div>
                  </div>
                </div>

                {/* ROUTE DETAIL SECTION (NO MAP, CLEAN TEXT ONLY) */}
                <RiderDrawerSection icon={<FiMapPin className="text-indigo-600" />} title="Delivery Route">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">PICKUP</div>
                        <div className="text-xs text-slate-700 font-bold mt-0.5">{d.pickupDistrict}</div>
                        <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{d.pickupAddress}</div>
                      </div>
                    </div>
                    <div className="w-[1px] h-4 bg-slate-200 ml-[11px]" />
                    <div className="flex gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">DROP-OFF</div>
                        <div className="text-xs text-slate-700 font-bold mt-0.5">{d.deliveryDistrict}</div>
                        <div className="text-xs text-slate-500 mt-0.5 leading-relaxed">{d.deliveryAddress}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs text-slate-500 font-bold">
                      <span>📍 Distance: {d.distance}</span>
                      <span>⏱ Estimated: {d.eta}</span>
                    </div>
                  </div>
                </RiderDrawerSection>

                {/* SENDER INFO */}
                <RiderDrawerSection icon={<FiUser className="text-slate-700" />} title="Sender Information">
                  <InfoRow label="Name" val={d.senderName} />
                  <InfoRow label="Phone" val={d.senderPhone} />
                  <InfoRow label="Division" val={d.senderDivision} />
                  <InfoRow label="District" val={d.pickupDistrict} />
                  <InfoRow label="Address" val={d.pickupAddress} />
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    {d.senderPhone !== "N/A" && (
                      <button 
                        className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-xl transition cursor-pointer"
                        onClick={() => window.open(`tel:${d.senderPhone}`)}
                      >
                        📞 Call Sender
                      </button>
                    )}
                    <button 
                      className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-xl transition cursor-pointer"
                      onClick={() => {
                        const address = `${d.pickupAddress}, ${d.pickupDistrict}, Bangladesh`;
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
                      }}
                    >
                      🧭 Google Map
                    </button>
                  </div>
                </RiderDrawerSection>

                {/* RECEIVER INFO */}
                <RiderDrawerSection icon={<FiUser className="text-slate-700" />} title="Receiver Information">
                  <InfoRow label="Name" val={d.receiverName} />
                  <InfoRow label="Phone" val={d.receiverPhone} />
                  <InfoRow label="Division" val={d.receiverDivision} />
                  <InfoRow label="District" val={d.deliveryDistrict} />
                  <InfoRow label="Address" val={d.deliveryAddress} />
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    {d.receiverPhone !== "N/A" && (
                      <button 
                        className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-xl transition cursor-pointer"
                        onClick={() => window.open(`tel:${d.receiverPhone}`)}
                      >
                        📞 Call Receiver
                      </button>
                    )}
                    <button 
                      className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-xs rounded-xl transition cursor-pointer"
                      onClick={() => {
                        const address = `${d.deliveryAddress}, ${d.deliveryDistrict}, Bangladesh`;
                        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, "_blank");
                      }}
                    >
                      🧭 Google Map
                    </button>
                  </div>
                </RiderDrawerSection>

                {/* PARCEL METADATA */}
                <RiderDrawerSection icon={<FiInfo className="text-slate-700" />} title="Parcel Specification">
                  <InfoRow label="Parcel Type" val={d.type} />
                  <InfoRow label="Weight" val={d.weight} />
                  <InfoRow label="Fragile Item" val={d.fragile} />
                  <InfoRow label="COD Amount" val={d.paymentStatus === "COD" ? `৳${d.deliveryFee}` : "৳0 (Paid)"} />
                  {d.status === "delivered" && <InfoRow label="Delivered Time" val={d.deliveredAt} />}
                  <InfoRow label="Instructions Note" val={d.note} />
                  <InfoRow label="Assigned Date" val={d.requestedAt} />
                </RiderDrawerSection>

                {/* VERTICAL TIMELINE */}
                <RiderDrawerSection icon={<FiClock className="text-slate-700" />} title="Delivery Timeline">
                  <div className="flex flex-col relative pl-2">
                    {d.timeline.map((step, i) => (
                      <div key={i} className="flex gap-4 min-h-[56px] relative">
                        
                        {/* TIMELINE CONNECTOR */}
                        <div className="flex flex-col items-center w-4 flex-shrink-0">
                          <div 
                            className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              step.done 
                                ? step.active 
                                  ? "bg-slate-900 border-slate-900 shadow-sm" 
                                  : "bg-emerald-600 border-emerald-600" 
                                : "bg-white border-slate-200"
                            }`}
                          >
                            {step.done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                          {i < d.timeline.length - 1 && (
                            <div 
                              className={`w-[1.5px] flex-grow my-1 ${
                                step.done ? "bg-emerald-500" : "bg-slate-100"
                              }`}
                            />
                          )}
                        </div>

                        {/* TIMELINE CONTENT */}
                        <div className="timeline-content pb-4">
                          <div className={`text-xs font-bold ${step.done ? "text-slate-800" : "text-slate-400"}`}>
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
                </RiderDrawerSection>

              </div>

              {/* DRAWER FOOTER / TRANSITION ACTIONS */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/30 sticky bottom-0 z-10 space-y-3">
                {d.status !== "delivered" && onAction ? (
                  <button
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer text-sm"
                    onClick={onAction}
                    disabled={loadingAction}
                  >
                    {loadingAction && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin flex-shrink-0" />}
                    {loadingAction ? "Updating status..." : `${cfg?.actionLabel} 🚀`}
                  </button>
                ) : (
                  <button
                    className="w-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-1.5 cursor-pointer hover:bg-emerald-100/80 transition"
                    onClick={onClose}
                  >
                    <FiCheckCircle /> View Summary (Delivered)
                  </button>
                )}
                
                {d.receiverPhone !== "N/A" && (
                  <button
                    className="w-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-sm"
                    onClick={() => window.open(`tel:${d.receiverPhone}`)}
                  >
                    📞 Call Receiver
                  </button>
                )}
              </div>

            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function RiderDrawerSection({ icon, title, children }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm space-y-3">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
        {icon} <span>{title}</span>
      </div>
      <div className="pt-1">{children}</div>
    </div>
  );
}

function InfoRow({ label, val }) {
  return (
    <div className="flex justify-between items-start text-xs py-2 border-b border-slate-50 last:border-0 gap-4">
      <span className="text-slate-400 font-semibold">{label}</span>
      <span className="text-slate-700 text-right font-medium leading-relaxed">{val}</span>
    </div>
  );
}
