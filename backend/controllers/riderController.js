const riderService = require('../services/riderService');

const riderController = {
    toggleStatus: async (req, res) => {
        try {
            const { isOnline } = req.body;
            const email = req.user.email;

            if (typeof isOnline !== 'boolean') {
                return res.status(400).send({ success: false, message: 'Invalid status type' });
            }

            const updatedRider = await riderService.updateOnlineStatus(email, isOnline);

            if (!updatedRider) {
                return res.status(404).send({ success: false, message: 'Rider profile not found' });
            }

            res.send({
                success: true,
                message: `Status updated to ${isOnline ? 'Online' : 'Offline'}`,
                isOnline: updatedRider.isOnline
            });
        } catch (error) {
            console.error('❌ Toggle status error:', error.message);
            res.status(500).send({ success: false, message: 'Internal server error' });
        }
    },

    getStatus: async (req, res) => {
        try {
            const email = req.user.email;
            const rider = await riderService.getRiderByEmail(email);

            if (!rider) {
                return res.status(404).send({ success: false, message: 'Rider not found' });
            }

            res.send({
                success: true,
                isOnline: !!rider.isOnline,
                lastSeen: rider.lastSeen
            });
        } catch (error) {
            console.error('❌ Get status error:', error.message);
            res.status(500).send({ success: false, message: 'Internal server error' });
        }
    },

    acceptParcel: async (req, res) => {
        try {
            const { parcelId } = req.params;
            const email = req.user.email;

            const result = await riderService.acceptParcel(email, parcelId);

            res.send({
                success: true,
                message: 'Parcel accepted successfully',
                parcel: result
            });
        } catch (error) {
            console.error('❌ Accept parcel error:', error.message);
            res.status(400).send({ success: false, message: error.message });
        }
    }
};

module.exports = riderController;
