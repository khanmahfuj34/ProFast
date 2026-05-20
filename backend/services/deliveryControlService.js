let parcelsCollection;
let riderCollection;
let parcelRequestsCollection;
let io;

const init = (db, socketIo) => {
    parcelsCollection = db.collection("parcels");
    riderCollection = db.collection("rider");
    parcelRequestsCollection = db.collection("parcel_requests");
    io = socketIo;
};

const getStats = async () => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const pending = await parcelsCollection.countDocuments({
        $or: [
            { status: { $in: ['pending', 'pending_rider', 'pending_rider_response', 'pending-pickup', 'awaiting-payment'] } },
            { deliveryStatus: { $in: ['pending', 'pending_rider', 'pending_rider_response', 'pending-pickup', 'awaiting-payment'] } }
        ]
    });
    const accepted = await parcelsCollection.countDocuments({
        $or: [
            { status: { $in: ['accepted', 'driver_accepted', 'driver_assigned'] } },
            { deliveryStatus: { $in: ['accepted', 'driver_accepted', 'driver_assigned'] } }
        ]
    });
    const pickedUp = await parcelsCollection.countDocuments({
        $or: [
            { status: { $in: ['picked-up', 'picked_up'] } },
            { deliveryStatus: { $in: ['picked-up', 'picked_up'] } }
        ]
    });
    const onTheWay = await parcelsCollection.countDocuments({
        $or: [
            { status: 'on_the_way' },
            { deliveryStatus: 'on_the_way' }
        ]
    });
    const deliveredToday = await parcelsCollection.countDocuments({
        $and: [
            {
                $or: [
                    { status: 'delivered' },
                    { deliveryStatus: 'delivered' }
                ]
            },
            {
                $or: [
                    { deliveryDate: { $gte: startOfDay } },
                    { updatedAt: { $gte: startOfDay } }
                ]
            }
        ]
    });
    const cancelledToday = await parcelsCollection.countDocuments({
        $and: [
            {
                $or: [
                    { status: 'cancelled' },
                    { deliveryStatus: 'cancelled' }
                ]
            },
            { updatedAt: { $gte: startOfDay } }
        ]
    });

    return {
        pending,
        accepted,
        pickedUp,
        onTheWay,
        deliveredToday,
        cancelledToday
    };
};

const getRequests = async () => {
    return await parcelsCollection.find({
        $or: [
            { status: { $in: ['pending', 'accepted', 'driver_accepted', 'driver_assigned', 'picked-up', 'picked_up', 'on_the_way', 'delivered', 'cancelled', 'pending-pickup', 'pending_rider', 'pending_rider_response', 'awaiting-payment'] } },
            { deliveryStatus: { $in: ['pending', 'accepted', 'driver_accepted', 'driver_assigned', 'picked-up', 'picked_up', 'on_the_way', 'delivered', 'cancelled', 'pending-pickup', 'pending_rider', 'pending_rider_response', 'awaiting-payment'] } }
        ]
    }).sort({ createdAt: -1 }).limit(100).toArray();
};

const getFailedAssignments = async () => {
    // A failed assignment is a parcel that is still 'pending' and its createdAt is > 10 minutes ago
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000);
    return await parcelsCollection.find({
        status: 'pending',
        createdAt: { $lt: tenMinsAgo }
    }).sort({ createdAt: -1 }).toArray();
};

const getRiderDetails = async (riderEmail) => {
    if (!riderEmail) return null;
    const rider = await riderCollection.findOne({ email: riderEmail });
    if (!rider) return null;

    // Count active deliveries for this rider
    const activeDeliveries = await parcelsCollection.countDocuments({
        riderEmail: riderEmail,
        status: { $in: ['accepted', 'driver_accepted', 'picked-up', 'picked_up', 'on_the_way'] }
    });

    return {
        name: rider.fullName || rider.name || '',
        email: rider.email || '',
        phone: rider.phone || '',
        photo: rider.photo || rider.photoURL || '',
        isOnline: !!rider.isOnline,
        lastSeen: rider.lastSeen || null,
        bikeType: rider.bikeType || '',
        bikeRegistration: rider.bikeRegistration || '',
        drivingLicense: rider.drivingLicense || '',
        nidNumber: rider.nidNumber || '',
        nidVerified: rider.status === 'Approved',
        activeDeliveries,
        division: rider.division || '',
        district: rider.district || '',
    };
};

const assignManually = async (trackingId, riderEmail) => {
    const parcel = await parcelsCollection.findOne({ trackingId });
    if (!parcel) throw new Error("Parcel not found");

    const rider = await riderCollection.findOne({ email: riderEmail });
    if (!rider) throw new Error("Rider not found");

    await parcelsCollection.updateOne(
        { trackingId },
        { 
            $set: { 
                status: 'driver_accepted', 
                assignedRider: riderEmail,
                assignedRiderName: rider.name,
                assignedAt: new Date()
            } 
        }
    );

    if (io) {
        io.to(riderEmail).emit('parcel_manually_assigned', { trackingId, parcel });
        io.emit('dashboard_stats_updated');
    }

    return { message: "Parcel manually assigned successfully", trackingId };
};

module.exports = {
    init,
    getStats,
    getRequests,
    getFailedAssignments,
    getRiderDetails,
    assignManually
};
