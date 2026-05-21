const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Mounted at /admin/notifications with verifyJWT and verifyAdmin middlewares
router.post('/broadcast', notificationController.broadcastNotification);

module.exports = router;
