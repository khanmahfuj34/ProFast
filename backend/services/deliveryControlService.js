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

    const pending = await parcelsCollection.countDocuments({ status: 'pending' });
    const accepted = await parcelsCollection.countDocuments({ status: 'driver_accepted' });
    const pickedUp = await parcelsCollection.countDocuments({ status: 'picked-up' });
    const onTheWay = await parcelsCollection.countDocuments({ status: 'on_the_way' });
    const deliveredToday = await parcelsCollection.countDocuments({ 
        status: 'delivered', 
        deliveryDate: { $gte: startOfDay } 
    });
    const cancelledToday = await parcelsCollection.countDocuments({ 
        status: 'cancelled', 
        updatedAt: { $gte: startOfDay } 
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
        status: { $in: ['pending', 'driver_accepted', 'picked-up', 'on_the_way', 'delivered', 'cancelled'] }
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
    assignManually
};
