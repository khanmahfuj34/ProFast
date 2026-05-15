const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');

/**
 * All support routes are protected by verifyJWT (applied in index.js)
 */

router.post('/create', supportController.createTicket);
router.get('/my-tickets', supportController.getMyTickets);
router.get('/ticket/:ticketId', supportController.getTicketDetails);

module.exports = router;
