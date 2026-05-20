const express = require('express');
const router = express.Router();
const deliveryControlController = require('../controllers/deliveryControlController');

// The middleware verifyJWT and verifyAdmin will be applied in index.js when mounting this route
router.get('/stats', deliveryControlController.getStats);
router.get('/requests', deliveryControlController.getRequests);
router.get('/failed-assignments', deliveryControlController.getFailedAssignments);
router.post('/failed-assignments/:trackingId/assign', deliveryControlController.assignManually);
router.get('/rider/:email', deliveryControlController.getRiderDetails);

module.exports = router;
