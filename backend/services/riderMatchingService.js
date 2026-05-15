let riderCollection;
let parcelsCollection;
let io;

const riderMatchingService = {
    init: (db, socketIo) => {
        riderCollection = db.collection("rider");
        parcelsCollection = db.collection("parcels");
        io = socketIo;
    },

    findMatchingRiders: async (parcel) => {
        if (!riderCollection || !parcelsCollection) throw new Error("Collections not initialized");

        const { senderDivision, senderDistrict } = parcel;

        // 1. Find potential riders: Online, Approved, Available, and in the right location
        // Note: Rider stores 'region' which maps to 'senderDivision'
        const potentialRiders = await riderCollection.find({
            isOnline: true,
            status: 'Approved',
            workStatus: 'Available',
            region: senderDivision,
            district: senderDistrict
        }).toArray();

        if (potentialRiders.length === 0) {
            console.log(`ℹ️ [RiderMatching] No available riders found in ${senderDistrict}, ${senderDivision}`);
            return [];
        }

        // 2. Load Balancing: Get active delivery count for each potential rider
        const ridersWithLoad = await Promise.all(potentialRiders.map(async (rider) => {
            const activeDeliveries = await parcelsCollection.countDocuments({
                riderId: rider.email, // Using email as identifier if ID isn't used everywhere
                deliveryStatus: { $in: ['pending', 'picked-up', 'in-transit'] }
            });
            return { ...rider, activeDeliveries };
        }));

        // 3. Sort by workload (least active deliveries first)
        const sortedRiders = ridersWithLoad.sort((a, b) => a.activeDeliveries - b.activeDeliveries);

        console.log(`🎯 [RiderMatching] Found ${sortedRiders.length} matching riders for parcel ${parcel.trackingId}`);
        return sortedRiders;
    },

    notifyRiders: async (riders, parcel) => {
        if (!io) return;

        const notificationData = {
            type: 'DELIVERY_REQUEST',
            parcelId: parcel._id,
            trackingId: parcel.trackingId,
            senderName: parcel.senderName,
            pickupAddress: parcel.senderAddress,
            receiverDistrict: parcel.receiverDistrict,
            totalPrice: parcel.totalPrice,
            timestamp: new Date()
        };

        // Notify each matching rider via their personal room (email-based)
        riders.forEach(rider => {
            io.to(rider.email).emit('new_delivery_request', notificationData);
            console.log(`🔔 [RiderMatching] Notified rider ${rider.email} about ${parcel.trackingId}`);
        });

        // Also notify admins for monitoring
        io.emit('admin_matching_update', {
            parcelId: parcel._id,
            trackingId: parcel.trackingId,
            matchedRidersCount: riders.length,
            status: 'matching_notified'
        });
    }
};

module.exports = riderMatchingService;
