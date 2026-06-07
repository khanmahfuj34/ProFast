const notificationSettingsService = require('../services/notificationSettingsService');

/**
 * Controller for managing user notification preferences
 */
const getSettings = async (req, res) => {
    try {
        const email = req.user.email;
        const settings = await notificationSettingsService.getSettings(email);
        res.send({ success: true, settings });
    } catch (error) {
        console.error('❌ Get Settings Error:', error.message);
        res.status(500).send({ success: false, message: 'Failed to fetch settings' });
    }
};

const updateSettings = async (req, res) => {
    try {
        const email = req.user.email;
        const data = req.body;

        // 🛡️ Security: Allowed field filtering
        const allowedFields = [
            'parcelUpdate',
            'payment',
            'announcement',
            'promotion',
            'emailNotifications',
            'smsNotifications',
            'newParcel',
            'riderApplication',
            'supportTicket',
            'deliveryComplete',
            'broadcast'
        ];

        const updateData = {};
        allowedFields.forEach(field => {
            if (data[field] !== undefined) {
                updateData[field] = !!data[field]; // Coerce to boolean
            }
        });

        if (Object.keys(updateData).length === 0) {
            return res.status(400).send({ success: false, message: 'No valid fields to update' });
        }

        const result = await notificationSettingsService.updateSettings(email, updateData);

        if (result.matchedCount > 0 || result.upsertedCount > 0 || result.modifiedCount > 0) {
            res.send({ 
                success: true, 
                message: 'Notification settings updated',
                settings: updateData 
            });
        } else {
            res.status(404).send({ success: false, message: 'Settings update failed' });
        }
    } catch (error) {
        console.error('❌ Update Settings Error:', error.message);
        res.status(500).send({ success: false, message: 'Internal server error' });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
