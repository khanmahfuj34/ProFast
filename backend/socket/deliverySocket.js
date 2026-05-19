const setupDeliverySocket = (io) => {
    io.on('connection', (socket) => {
        // Riders or Admins can emit these events
        socket.on('delivery_status_update', (data) => {
            const { trackingId, status, riderEmail } = data;
            
            // Broadcast the update to admin dashboard
            io.emit('dashboard_stats_updated', {
                trackingId,
                status,
                riderEmail,
                timestamp: new Date()
            });

            // Also emit admin_matching_update just in case other components depend on it
            io.emit('admin_matching_update', {
                trackingId,
                status,
                timestamp: new Date()
            });
        });
    });
};

module.exports = setupDeliverySocket;
