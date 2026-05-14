const notificationService = require('../services/notificationService');

const getNotifications = async (req, res) => {
    try {
        const email = req.user.email;
        const notifications = await notificationService.getUserNotifications(email);
        res.send({ success: true, notifications });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await notificationService.markAsRead(id);
        res.send({ success: true, message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        const email = req.user.email;
        await notificationService.markAllAsRead(email);
        res.send({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

const clearNotifications = async (req, res) => {
    try {
        const email = req.user.email;
        await notificationService.clearReadNotifications(email);
        res.send({ success: true, message: 'Read notifications cleared' });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    clearNotifications
};
