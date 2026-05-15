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
    }
};

module.exports = riderService;
