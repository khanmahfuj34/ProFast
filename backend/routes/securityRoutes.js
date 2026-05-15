const express = require('express');
const router = express.Router();
const securityController = require('../controllers/securityController');

/**
 * All security routes require active JWT authentication
 * (Applied at index.js level, but listed here for clarity)
 */

router.post('/revoke-sessions', securityController.revokeSessions);
router.get('/account-metadata', securityController.getAccountMetadata);

module.exports = router;
