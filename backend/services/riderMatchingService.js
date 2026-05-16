let riderCollection;
let parcelsCollection;
let parcelRequestsCollection;
let io;

const riderMatchingService = {
    init: (db, socketIo, requestsCollection) => {
        riderCollection = db.collection("rider");
        parcelsCollection = db.collection("parcels");
        parcelRequestsCollection = requestsCollection || db.collection("parcel_requests");
        io = socketIo;
    },

    findMatchingRiders: async (parcel) => {
        if (!riderCollection || !parcelsCollection) throw new Error("Collections not initialized");

        const { senderDivision, senderDistrict } = parcel;

        // ✅ Normalize both sides to prevent case mismatch (e.g. "Dhaka" !== "dhaka")
        const normalizedDivision = (senderDivision || '').trim().toLowerCase();
        const normalizedDistrict = (senderDistrict || '').trim().toLowerCase();

        console.log(`\n🔍 [RiderMatching] ==========================================`);
        console.log(`🔍 [RiderMatching] New parcel: ${parcel.trackingId}`);
        console.log(`🔍 [RiderMatching] senderDivision raw: "${senderDivision}" → normalized: "${normalizedDivision}"`);
        console.log(`🔍 [RiderMatching] senderDistrict raw: "${senderDistrict}" → normalized: "${normalizedDistrict}"`);

        if (!normalizedDivision || !normalizedDistrict) {
            console.log(`⚠️  [RiderMatching] Missing senderDivision or senderDistrict — cannot match riders`);
            return [];
        }

        // 1. Count ALL riders to diagnose DB state
        const totalRiders = await riderCollection.countDocuments({});
        const approvedRiders = await riderCollection.countDocuments({ status: 'Approved' });
        const onlineRiders = await riderCollection.countDocuments({ isOnline: true });
        const availableRiders = await riderCollection.countDocuments({ isOnline: true, status: 'Approved', workStatus: 'Available' });
        console.log(`📊 [RiderMatching] DB stats: total=${totalRiders}, approved=${approvedRiders}, online=${onlineRiders}, available+online+approved=${availableRiders}`);

        // 2. Find potential riders using case-insensitive regex on both division and legacy region
        const potentialRiders = await riderCollection.find({
            isOnline: { $ne: false },
            status: 'Approved',
            workStatus: 'Available',
            $or: [
                { division: { $regex: new RegExp(`^${normalizedDivision}$`, 'i') } },
                { region: { $regex: new RegExp(`^${normalizedDivision}$`, 'i') } }
            ],
            district: { $regex: new RegExp(`^${normalizedDistrict}$`, 'i') }
        }).toArray();

        console.log(`👥 [RiderMatching] Riders matching division="${normalizedDivision}" + district="${normalizedDistrict}": ${potentialRiders.length}`);
        if (potentialRiders.length > 0) {
            potentialRiders.forEach(r => {
                console.log(`   ✅ Rider: ${r.email} | division: "${r.division}" | district: "${r.district}" | online: ${r.isOnline} | workStatus: ${r.workStatus} | socketId: ${r.socketId}`);
            });
        } else {
            // Log a sample of approved riders to diagnose the mismatch
            const sampleRiders = await riderCollection.find({ status: 'Approved' }).limit(5).toArray();
            console.log(`   ⚠️  No match found. Sample of approved riders in DB:`);
            sampleRiders.forEach(r => {
                console.log(`      - ${r.email} | division: "${r.division||r.region}" | district: "${r.district}" | online: ${r.isOnline} | workStatus: ${r.workStatus}`);
            });
        }

        if (potentialRiders.length === 0) return [];

        // 3. Load balancing: sort by active delivery count (least busy first)
        const ridersWithLoad = await Promise.all(potentialRiders.map(async (rider) => {
            const activeDeliveries = await parcelsCollection.countDocuments({
                $or: [{ riderId: rider.email }, { riderEmail: rider.email }],
                deliveryStatus: { $in: ['pending', 'picked-up', 'in-transit', 'on_the_way', 'driver_assigned', 'driver_accepted'] }
            });
            return { ...rider, activeDeliveries };
        }));

        const sortedRiders = ridersWithLoad.sort((a, b) => a.activeDeliveries - b.activeDeliveries);
        console.log(`🎯 [RiderMatching] Returning ${sortedRiders.length} matched riders for parcel ${parcel.trackingId}`);
        console.log(`🔍 [RiderMatching] ==========================================\n`);
        return sortedRiders;
    },

    notifyRiders: async (riders, parcel) => {
        if (!io) {
            console.log('❌ [RiderMatching] Socket.IO (io) not initialized in service');
            return;
        }

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
        riders.forEach(async (rider) => {
            try {
                // Persist the request in database so it survives refresh
                await parcelRequestsCollection.updateOne(
                    { parcelId: parcel._id, riderEmail: rider.email },
                    { 
                        $set: { 
                            parcelId: parcel._id,
                            trackingId: parcel.trackingId,
                            riderEmail: rider.email,
                            status: 'pending',
                            notificationData: notificationData,
                            createdAt: new Date()
                            // No expiresAt — requests persist until accepted by a rider or closed by admin
                        } 
                    },
                    { upsert: true }
                );

                // Log exactly where we are emitting
                const roomSize = io.sockets.adapter.rooms.get(rider.email)?.size || 0;
                console.log(`🔔 [RiderMatching] Attempting to notify ${rider.email}. Room size: ${roomSize}`);
                
                io.to(rider.email).emit('new_delivery_request', notificationData);
                console.log(`✅ [RiderMatching] Emitted 'new_delivery_request' to ${rider.email} for ${parcel.trackingId}`);
            } catch (err) {
                console.error(`❌ [RiderMatching] Error persisting request for ${rider.email}:`, err.message);
            }
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
