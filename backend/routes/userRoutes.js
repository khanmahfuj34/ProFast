const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// PATCH /users/update-profile-data - Update current user profile
router.patch('/update-profile-data', userController.updateProfileData);

module.exports = router;
