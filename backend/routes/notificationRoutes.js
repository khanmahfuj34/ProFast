const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// All notification routes require authentication (handled by passing verifyJWT to the router in index.js)
router.get('/', notificationController.getNotifications);
router.patch('/:id/read', notificationController.markAsRead);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/clear', notificationController.clearNotifications);

module.exports = router;
