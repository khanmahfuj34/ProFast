const express = require('express');
const router = express.Router();
const coverageController = require('../controllers/coverageController');

// Public routes for location data
router.get('/divisions', coverageController.getDivisions);
router.get('/districts/:division', coverageController.getDistricts);

module.exports = router;
