const express = require('express');
const router = express.Router();
const riderController = require('../controllers/riderController');

// All routes are protected by verifyJWT (applied in index.js)
router.get('/status', riderController.getStatus);
router.patch('/toggle-status', riderController.toggleStatus);
router.patch('/accept-parcel/:parcelId', riderController.acceptParcel);

module.exports = router;
