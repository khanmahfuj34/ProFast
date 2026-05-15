let ticketsCollection;

/**
 * Initialize the support service with the database connection
 */
const init = (db) => {
    if (!db) {
        console.error("❌ Support Service Init: No DB provided");
        return;
    }
    ticketsCollection = db.collection("support_tickets");
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
    return { ...ticket, _id: result.insertedId };
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
const getTicketById = async (ticketId, userId) => {
    if (!ticketsCollection) throw new Error("Support collection not initialized");
    return await ticketsCollection.findOne({ ticketId, userId });
};

module.exports = {
    init,
    createTicket,
    getUserTickets,
    getTicketById
};
