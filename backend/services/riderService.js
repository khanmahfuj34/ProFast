const { ObjectId } = require('mongodb');
const notificationService = require('./notificationService');

let riderCollection;
let parcelsCollection;
let parcelRequestsCollection;
let io;
const disconnectTimeouts = new Map();

const riderService = {
    init: (db, socketIo, requestsCollection) => {
        riderCollection = db.collection("rider");
        parcelsCollection = db.collection("parcels");
        parcelRequestsCollection = requestsCollection || db.collection("parcel_requests");
        io = socketIo;
    },

    updateOnlineStatus: async (email, isOnline, socketId = null) => {
        if (!riderCollection) throw new Error("Rider collection not initialized");

        // If rider is coming online, cancel any pending disconnect timeout
        if (isOnline && disconnectTimeouts.has(email)) {
            clearTimeout(disconnectTimeouts.get(email));
            disconnectTimeouts.delete(email);
            console.log(`✅ [Grace Period] Cancelled offline transition for ${email} (reconnected)`);
        }

        const updateDoc = {
            $set: {
                isOnline: isOnline,
                lastSeen: new Date(),
                ...(socketId !== undefined && { socketId: socketId }) // Allow null to clear it
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
            console.log(`⏳ [Grace Period] Rider ${rider.email} disconnected. Waiting 15s before marking offline...`);
            
            // Clear any existing timeout for this email just in case
            if (disconnectTimeouts.has(rider.email)) {
                clearTimeout(disconnectTimeouts.get(rider.email));
            }

            const timeout = setTimeout(async () => {
                await riderCollection.updateOne(
                    { email: rider.email, socketId: socketId }, // Ensure it's still the same session
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
                
                disconnectTimeouts.delete(rider.email);
                console.log(`🏍️ [Grace Period] Rider ${rider.email} marked offline after 15s timeout`);
            }, 15000); // 15 seconds grace period

            disconnectTimeouts.set(rider.email, timeout);
        }
    },

    getRiderByEmail: async (email) => {
        return await riderCollection.findOne({ email: email });
    },

    acceptParcel: async (riderEmail, parcelId) => {
        if (!riderCollection || !parcelsCollection) throw new Error("Collections not initialized");

        // 1. Check if rider is approved and online
        const rider = await riderCollection.findOne({ email: riderEmail, status: 'Approved', isOnline: { $ne: false } });
        if (!rider) throw new Error("Rider not authorized or offline");

        // 2. Atomically attempt to accept the parcel
        // Accept if the parcel is still waiting for a rider
        const result = await parcelsCollection.findOneAndUpdate(
            { 
                _id: new ObjectId(parcelId), 
                status: { $in: ['pending_rider', 'pending_rider_response', 'pending', 'paid', 'pending-pickup'] },
                $or: [
                    { riderEmail: { $exists: false } },
                    { riderEmail: null },
                    { riderEmail: '' }
                ]
            },
            { 
                $set: { 
                    status: 'driver_accepted',
                    deliveryStatus: 'driver_accepted',
                    riderId: rider._id.toString(), // Fix: use rider._id instead of email
                    riderEmail: riderEmail,
                    assignedRider: riderEmail,
                    riderName: rider.fullName || rider.name || 'Rider',
                    assignmentStatus: 'assigned',
                    acceptedAt: new Date(),
                    assignedAt: new Date(),
                    updatedAt: new Date()
                },
                $push: {
                    activityLog: {
                        status: 'driver_accepted',
                        timestamp: new Date(),
                        updatedBy: riderEmail,
                        role: 'rider',
                        message: `Parcel accepted by rider: ${rider.fullName || 'Rider'}`
                    }
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            const checkParcel = await parcelsCollection.findOne({ _id: new ObjectId(parcelId) });
            if (checkParcel && checkParcel.riderEmail && checkParcel.riderEmail !== riderEmail) {
                await parcelRequestsCollection.updateOne(
                    { parcelId: new ObjectId(parcelId), riderEmail: riderEmail },
                    { $set: { status: 'closed', closedAt: new Date() } }
                );
                throw new Error("This request has already been accepted by another rider");
            }
            throw new Error("Delivery request is no longer available");
        }

        // 3. Update related parcel requests
        await parcelRequestsCollection.updateOne(
            { parcelId: new ObjectId(parcelId), riderEmail: riderEmail },
            { $set: { status: 'accepted', acceptedAt: new Date() } }
        );
        
        await parcelRequestsCollection.updateMany(
            { parcelId: new ObjectId(parcelId), riderEmail: { $ne: riderEmail }, status: 'pending' },
            { $set: { status: 'closed', closedAt: new Date() } }
        );

        // 4. Update Rider Work Status
        await riderCollection.updateOne(
            { email: riderEmail },
            { $set: { workStatus: 'in_delivery', updatedAt: new Date() } }
        );

        // 5. Notify the User (Sender)
        try {
            await notificationService.createNotification({
                recipientEmail: result.senderEmail,
                type: 'parcel',
                title: 'Rider Assigned',
                message: `Rider ${rider.fullName || 'Rider'} has accepted your parcel and is heading to pickup.`,
                relatedId: result._id,
                metadata: { 
                    status: 'driver_accepted', 
                    riderName: rider.fullName, 
                    trackingId: result.trackingId,
                    stage: 'Heading to Pickup'
                }
            });
        } catch (nError) {
            console.error('❌ [RiderService] Failed to notify user:', nError.message);
        }

        // 6. Broadcast Real-time Updates
        // Hide request from other riders
        io.emit('delivery_request_closed', {
            parcelId: parcelId,
            trackingId: result.trackingId,
            status: 'assigned'
        });

        // Notify user dashboard / tracking page
        io.to(result.senderEmail).emit('parcel_status_updated', {
            parcelId: result._id,
            trackingId: result.trackingId,
            status: 'driver_accepted',
            message: 'Rider is on the way to pick up your parcel'
        });

        // Notify admins
        io.emit('admin_matching_update', {
            parcelId: parcelId,
            trackingId: result.trackingId,
            status: 'assigned_successfully',
            assignedTo: riderEmail
        });

        // Notify current rider to update their local stats/UI
        io.to(riderEmail).emit('delivery_accepted', {
            parcelId: result._id,
            trackingId: result.trackingId,
            parcel: result
        });

        // Broadcast to update general stats
        io.emit('rider_stats_updated', {
            email: riderEmail,
            totalDeliveries: true // Flag to trigger recount
        });

        return result;
    }
};

module.exports = riderService;
