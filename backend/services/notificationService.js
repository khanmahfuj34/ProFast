const { ObjectId } = require('mongodb');
const notificationSettingsService = require('./notificationSettingsService');

let notificationsCollection;
let io;

let usersCollection;

/**
 * Initialize the notification service with DB and IO instances
 */
const init = (db, socketIo) => {
    notificationsCollection = db.collection("notifications");
    usersCollection = db.collection("users");
    io = socketIo;
    console.log("✅ Notification Service Initialized");
};

/**
 * Create a new notification and emit to user
 */
const createNotification = async (data) => {
    try {
        if (!notificationsCollection) return;

        // 🛡️ Check User Preferences
        const settings = await notificationSettingsService.getSettings(data.recipientEmail);
        
        // Map notification type to setting field
        const typeMapping = {
            'parcel': 'parcelUpdate',
            'payment': 'payment',
            'system': 'announcement',
            'promotion': 'promotion'
        };

        const settingField = typeMapping[data.type] || 'announcement';
        
        if (settings && settings[settingField] === false) {
            console.log(`🔇 Notification skipped for ${data.recipientEmail}: Type "${data.type}" is disabled in settings.`);
            return null;
        }

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

/**
 * Broadcast a notification to a specific audience
 */
const broadcastNotification = async (data) => {
    try {
        if (!notificationsCollection || !usersCollection) return { count: 0 };

        let query = {};
        if (data.audience === 'Users') query = { role: 'user' };
        else if (data.audience === 'Riders') query = { role: 'rider' };
        else if (data.audience === 'Everyone') query = { role: { $in: ['user', 'rider'] } };
        else return { count: 0 };

        const targetUsers = await usersCollection.find(query).toArray();
        if (targetUsers.length === 0) return { count: 0 };

        const notifications = targetUsers.map(user => ({
            recipientEmail: user.email,
            type: data.type || 'system',
            title: data.title,
            message: data.message,
            recipientRole: user.role,
            senderRole: 'admin',
            isRead: false,
            createdAt: new Date()
        }));

        const result = await notificationsCollection.insertMany(notifications);

        if (io) {
            targetUsers.forEach((user, index) => {
                const notif = { ...notifications[index], _id: result.insertedIds[index] };
                io.to(user.email).emit('new_notification', notif);
            });
        }

        console.log(`📣 Broadcast notification sent to ${targetUsers.length} users (${data.audience})`);
        return { count: targetUsers.length };
    } catch (error) {
        console.error('❌ Error broadcasting notification:', error.message);
        throw error;
    }
};

module.exports = {
    init,
    createNotification,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    clearReadNotifications,
    broadcastNotification
};
