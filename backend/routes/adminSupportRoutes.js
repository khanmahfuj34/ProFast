const express = require('express');
const router = express.Router();
const adminSupportController = require('../controllers/adminSupportController');

// All routes are protected by verifyJWT and verifyAdmin in index.js
router.get('/', adminSupportController.getAllTickets);
router.patch('/:ticketId/status', adminSupportController.updateTicketStatus);
router.post('/:ticketId/reply', adminSupportController.replyToTicket);

module.exports = router;
