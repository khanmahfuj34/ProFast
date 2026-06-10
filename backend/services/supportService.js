let ticketsCollection;
let socketIo;

/**
 * Initialize the support service with the database connection
 */
const init = (db, io) => {
    if (!db) {
        console.error("❌ Support Service Init: No DB provided");
        return;
    }
    ticketsCollection = db.collection("support_tickets");
    socketIo = io;
    console.log("✅ Support Service Initialized");
};

/**
 * Generate a unique ticket ID (Format: TKT-XXXXXX)
 */
const generateTicketId = () => {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `TKT-${random}`;
};

/**
 * Create a new support ticket
 */
const createTicket = async (userId, userEmail, ticketData) => {
    if (!ticketsCollection) throw new Error("Support collection not initialized");

    const ticket = {
        ticketId: generateTicketId(),
        userId,
        userEmail,
        subject: ticketData.subject,
        category: ticketData.category,
        priority: ticketData.priority,
        description: ticketData.description,
        attachment: ticketData.attachment || null,
        status: 'open', // Default status
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    const result = await ticketsCollection.insertOne(ticket);
    const newTicket = { ...ticket, _id: result.insertedId };

    // Emit real-time event to admins
    if (socketIo) {
        socketIo.emit('new_support_ticket', newTicket);
    }

    return newTicket;
};

/**
 * Get all tickets for a specific user with filtering
 */
const getUserTickets = async (userId, filters = {}) => {
    if (!ticketsCollection) throw new Error("Support collection not initialized");

    const query = { userId };

    // Apply status filter if provided
    if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
    }

    // Apply search query if provided (search in subject or ticketId)
    if (filters.search) {
        query.$or = [
            { subject: { $regex: filters.search, $options: 'i' } },
            { ticketId: { $regex: filters.search, $options: 'i' } }
        ];
    }

    return await ticketsCollection
        .find(query)
        .sort({ createdAt: -1 }) // Newest first
        .toArray();
};

/**
 * Get a single ticket by ID
 */
const getTicketById = async (ticketId, userId = null) => {
    if (!ticketsCollection) throw new Error("Support collection not initialized");
    const query = { ticketId };
    if (userId) query.userId = userId;
    return await ticketsCollection.findOne(query);
};

/**
 * Get all tickets across the platform (Admin)
 */
const getAllTickets = async (filters = {}) => {
    if (!ticketsCollection) throw new Error("Support collection not initialized");

    const query = {};

    // Apply status filter if provided
    if (filters.status && filters.status !== 'all') {
        query.status = filters.status;
    }

    // Apply search query if provided (search in subject, ticketId, userName, or userEmail)
    if (filters.search) {
        query.$or = [
            { subject: { $regex: filters.search, $options: 'i' } },
            { ticketId: { $regex: filters.search, $options: 'i' } },
            { userName: { $regex: filters.search, $options: 'i' } },
            { userEmail: { $regex: filters.search, $options: 'i' } }
        ];
    }

    return await ticketsCollection
        .find(query)
        .sort({ createdAt: -1 }) // Newest first
        .toArray();
};

/**
 * Update the status of a ticket (Admin)
 */
const updateTicketStatus = async (ticketId, status) => {
    if (!ticketsCollection) throw new Error("Support collection not initialized");

    const result = await ticketsCollection.findOneAndUpdate(
        { ticketId },
        {
            $set: {
                status,
                updatedAt: new Date().toISOString()
            }
        },
        { returnDocument: 'after' }
    );

    const updatedTicket = result.value || result; // Handle both driver versions

    // Emit real-time event
    if (socketIo && updatedTicket) {
        socketIo.emit('support_ticket_updated', updatedTicket);
    }

    return updatedTicket;
};

/**
 * Reply to a ticket (Admin)
 */
const replyToTicket = async (ticketId, replyText, adminEmail, adminName) => {
    if (!ticketsCollection) throw new Error("Support collection not initialized");

    const reply = {
        replyId: `REP-${Math.floor(100000 + Math.random() * 900000)}`,
        text: replyText,
        adminEmail,
        adminName,
        createdAt: new Date().toISOString()
    };

    const result = await ticketsCollection.findOneAndUpdate(
        { ticketId },
        {
            $push: { replies: reply },
            $set: {
                status: 'in-progress', // Auto change status to in-progress when replied
                updatedAt: new Date().toISOString()
            }
        },
        { returnDocument: 'after' }
    );

    const updatedTicket = result.value || result;

    // Emit real-time event
    if (socketIo && updatedTicket) {
        socketIo.emit('support_ticket_replied', { ticketId, reply });
        socketIo.emit('support_ticket_updated', updatedTicket);
    }

    return updatedTicket;
};

module.exports = {
    init,
    createTicket,
    getUserTickets,
    getTicketById,
    getAllTickets,
    updateTicketStatus,
    replyToTicket
};
