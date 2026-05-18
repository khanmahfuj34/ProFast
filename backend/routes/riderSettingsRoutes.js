/**
 * riderSettingsRoutes.js
 * Express routes for rider settings.
 */
const express = require('express');
const getRiderSettingsController = require('../controllers/riderSettingsController');

const riderSettingsRoutes = (getUsersCol, getRiderCol, verifyJWT, verifyRider) => {
    const router = express.Router();
    const controller = getRiderSettingsController(getUsersCol, getRiderCol);

    // Apply authentication and rider verification to all endpoints
    router.use(verifyJWT, verifyRider);

    router.get('/profile', controller.getProfile);
    router.put('/profile', controller.updateProfile);
    router.put('/location', controller.updateLocation);
    router.put('/vehicle', controller.updateVehicle);
    router.put('/availability', controller.updateAvailability);
    
    router.put('/security/password', controller.updatePassword);
    router.post('/security/logout-all', controller.logoutAllDevices);
    router.get('/security/sessions', controller.getSessions);

    router.post('/support/contact', controller.submitSupportInquiry);

    return router;
};

module.exports = riderSettingsRoutes;
