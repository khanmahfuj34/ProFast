const supportService = require('../services/supportService');

/**
 * Fetch all support tickets
 */
const getAllTickets = async (req, res) => {
    try {
        const { status, search } = req.query;
        const tickets = await supportService.getAllTickets({ status, search });
        res.status(200).send({ success: true, count: tickets.length, tickets });
    } catch (error) {
        console.error('❌ Admin Get Tickets Error:', error.message);
        res.status(500).send({ success: false, message: 'Failed to fetch tickets', error: error.message });
    }
};

/**
 * Update ticket status
 */
const updateTicketStatus = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).send({ success: false, message: 'Status is required' });
        }

        const ticket = await supportService.updateTicketStatus(ticketId, status);
        res.status(200).send({ success: true, message: 'Ticket status updated', ticket });
    } catch (error) {
        console.error('❌ Admin Update Ticket Error:', error.message);
        res.status(500).send({ success: false, message: 'Failed to update ticket', error: error.message });
    }
};

/**
 * Reply to ticket
 */
const replyToTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { text } = req.body;
        const { email, displayName } = req.user; // from verifyJWT/verifyAdmin

        if (!text) {
            return res.status(400).send({ success: false, message: 'Reply text is required' });
        }

        const ticket = await supportService.replyToTicket(ticketId, text, email, displayName || 'Admin');
        res.status(200).send({ success: true, message: 'Replied to ticket', ticket });
    } catch (error) {
        console.error('❌ Admin Reply Ticket Error:', error.message);
        res.status(500).send({ success: false, message: 'Failed to reply to ticket', error: error.message });
    }
};

module.exports = {
    getAllTickets,
    updateTicketStatus,
    replyToTicket
};
