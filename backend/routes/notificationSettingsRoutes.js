const express = require('express');
const router = express.Router();
const notificationSettingsController = require('../controllers/notificationSettingsController');

// All routes require authentication
router.get('/', notificationSettingsController.getSettings);
router.patch('/', notificationSettingsController.updateSettings);

module.exports = router;
