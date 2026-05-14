const { ObjectId } = require('mongodb');

let notificationsCollection;
let io;

/**
 * Initialize the notification service with DB and IO instances
 */
const init = (db, socketIo) => {
    notificationsCollection = db.collection("notifications");
    io = socketIo;
    console.log("✅ Notification Service Initialized");
};

/**
 * Create a new notification and emit to user
 */
const createNotification = async (data) => {
    try {
        if (!notificationsCollection) return;

        const notification = {
            recipientEmail: data.recipientEmail,
            type: data.type || 'system', // 'parcel', 'payment', 'system', 'promotion'
            title: data.title,
            message: data.message,
            relatedId: data.relatedId || null,
            metadata: data.metadata || {},
            isRead: false,
            createdAt: new Date()
        };

        const result = await notificationsCollection.insertOne(notification);
        const savedNotification = { ...notification, _id: result.insertedId };

        // Emit real-time event to the specific user room
        if (io) {
            io.to(data.recipientEmail).emit('new_notification', savedNotification);
            console.log(`🔔 Notification emitted to ${data.recipientEmail}: ${data.title}`);
        }

        return savedNotification;
    } catch (error) {
        console.error('❌ Error creating notification:', error.message);
        throw error;
    }
};

/**
 * Get all notifications for a user
 */
const getUserNotifications = async (email) => {
    return await notificationsCollection
        .find({ recipientEmail: email })
        .sort({ createdAt: -1 })
        .toArray();
};

/**
 * Mark a single notification as read
 */
const markAsRead = async (id) => {
    return await notificationsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { isRead: true } }
    );
};

/**
 * Mark all notifications as read for a user
 */
const markAllAsRead = async (email) => {
    return await notificationsCollection.updateMany(
        { recipientEmail: email, isRead: false },
        { $set: { isRead: true } }
    );
};

/**
 * Delete all read notifications for a user
 */
const clearReadNotifications = async (email) => {
    return await notificationsCollection.deleteMany({
        recipientEmail: email,
        isRead: true
    });
};

module.exports = {
    init,
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    clearReadNotifications
};
