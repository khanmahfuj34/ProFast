const supportService = require('../services/supportService');

/**
 * Controller to create a new support ticket
 */
const createTicket = async (req, res) => {
    try {
        const { uid, email } = req.user;
        const ticketData = req.body;

        // Basic validation
        if (!ticketData.subject || !ticketData.category || !ticketData.priority || !ticketData.description) {
            return res.status(400).send({
                success: false,
                message: 'All fields (subject, category, priority, description) are required'
            });
        }

        const ticket = await supportService.createTicket(uid, email, ticketData);
        
        res.status(201).send({
            success: true,
            message: 'Support ticket created successfully',
            ticket
        });
    } catch (error) {
        console.error('❌ Create Ticket Error:', error.message);
        res.status(500).send({
            success: false,
            message: 'Failed to create support ticket',
            error: error.message
        });
    }
};

/**
 * Controller to fetch all tickets for the logged-in user
 */
const getMyTickets = async (req, res) => {
    try {
        const { uid } = req.user;
        const { status, search } = req.query;

        const tickets = await supportService.getUserTickets(uid, { status, search });
        
        res.status(200).send({
            success: true,
            count: tickets.length,
            tickets
        });
    } catch (error) {
        console.error('❌ Get My Tickets Error:', error.message);
        res.status(500).send({
            success: false,
            message: 'Failed to fetch your support tickets',
            error: error.message
        });
    }
};

/**
 * Controller to fetch a single ticket detail
 */
const getTicketDetails = async (req, res) => {
    try {
        const { uid } = req.user;
        const { ticketId } = req.params;

        const ticket = await supportService.getTicketById(ticketId, uid);
        
        if (!ticket) {
            return res.status(404).send({
                success: false,
                message: 'Ticket not found'
            });
        }

        res.status(200).send({
            success: true,
            ticket
        });
    } catch (error) {
        console.error('❌ Get Ticket Details Error:', error.message);
        res.status(500).send({
            success: false,
            message: 'Failed to fetch ticket details',
            error: error.message
        });
    }
};

module.exports = {
    createTicket,
    getMyTickets,
    getTicketDetails
};
