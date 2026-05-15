let riderCollection;
let io;

const riderService = {
    init: (db, socketIo) => {
        riderCollection = db.collection("rider");
        io = socketIo;
    },

    updateOnlineStatus: async (email, isOnline, socketId = null) => {
        if (!riderCollection) throw new Error("Rider collection not initialized");

        const updateDoc = {
            $set: {
                isOnline: isOnline,
                lastSeen: new Date(),
                ...(socketId && { socketId: socketId })
            }
        };

        const result = await riderCollection.findOneAndUpdate(
            { email: email },
            updateDoc,
            { returnDocument: 'after' }
        );

        if (result) {
            // Broadcast to admins/others that a rider's status changed
            io.emit('rider_status_changed', {
                email: email,
                isOnline: isOnline,
                riderId: result._id
            });
        }

        return result;
    },

    handleDisconnect: async (socketId) => {
        if (!riderCollection) return;

        const rider = await riderCollection.findOne({ socketId: socketId });
        if (rider) {
            await riderCollection.updateOne(
                { socketId: socketId },
                { 
                    $set: { 
                        isOnline: false, 
                        lastSeen: new Date(),
                        socketId: null 
                    } 
                }
            );

            io.emit('rider_status_changed', {
                email: rider.email,
                isOnline: false,
                riderId: rider._id
            });
            
            console.log(`🏍️ Rider ${rider.email} marked offline due to disconnect`);
        }
    },

    getRiderByEmail: async (email) => {
        return await riderCollection.findOne({ email: email });
    },

    acceptParcel: async (riderEmail, parcelId) => {
        if (!riderCollection || !parcelsCollection) throw new Error("Collections not initialized");

        // 1. Check if rider is approved and online
        const rider = await riderCollection.findOne({ email: riderEmail, status: 'Approved', isOnline: true });
        if (!rider) throw new Error("Rider not authorized or offline");

        // 2. Atomically attempt to accept the parcel (only if it's still pending_rider_response)
        const result = await parcelsCollection.findOneAndUpdate(
            { 
                _id: new ObjectId(parcelId), 
                status: 'pending_rider_response' 
            },
            { 
                $set: { 
                    status: 'picked-up', // Or 'assigned' depending on flow
                    riderId: riderEmail,
                    assignedAt: new Date(),
                    updatedAt: new Date()
                } 
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            throw new Error("Parcel already accepted by another rider or not available");
        }

        // 3. Broadcast update
        io.emit('parcel_assigned', {
            parcelId: parcelId,
            riderEmail: riderEmail,
            trackingId: result.trackingId,
            status: 'picked-up'
        });

        return result;
    }
};

module.exports = riderService;
