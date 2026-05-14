/**
 * Set up Socket.IO listeners for notifications
 */
const setupNotificationSocket = (io) => {
    io.on('connection', (socket) => {
        // User joins their own private room based on email to receive targeted notifications
        socket.on('join_notification_room', (email) => {
            if (email) {
                socket.join(email);
                console.log(`👤 User joined private notification room: ${email}`);
            }
        });

        // Optional: Leave room
        socket.on('leave_notification_room', (email) => {
            if (email) {
                socket.leave(email);
                console.log(`👤 User left private notification room: ${email}`);
            }
        });
    });
};

module.exports = setupNotificationSocket;
