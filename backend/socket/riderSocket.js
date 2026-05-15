const riderService = require('../services/riderService');

const setupRiderSocket = (io) => {
    io.on('connection', (socket) => {
        // When a rider connects, they should join a special room or update their status
        socket.on('rider_online', async (data) => {
            const { email } = data;
            if (email) {
                socket.join(email); // Join private room for targeted notifications
                console.log(`🔌 [Socket] Rider ${email} came online and joined private room`);
                await riderService.updateOnlineStatus(email, true, socket.id);
            }
        });

        // Handle manual offline toggle via socket if preferred, 
        // though we use REST for persistence and socket for notification
        socket.on('rider_offline', async (data) => {
            const { email } = data;
            if (email) {
                console.log(`🔌 [Socket] Rider ${email} went offline manually`);
                await riderService.updateOnlineStatus(email, false, null);
            }
        });

        // CRITICAL: Handle disconnect
        socket.on('disconnect', async () => {
            console.log(`🔌 [Socket] Connection lost: ${socket.id}`);
            await riderService.handleDisconnect(socket.id);
        });
    });
};

module.exports = setupRiderSocket;
