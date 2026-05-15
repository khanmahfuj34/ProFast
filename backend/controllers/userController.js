const userService = require('../services/userService');

/**
 * Controller for updating user profile settings
 */
const updateProfileData = async (req, res) => {
    try {
        const email = req.user.email;
        const { displayName, phoneNumber, division, district, address, photoURL } = req.body;

        // 🛡️ Security: Allowed field filtering (prevents role manipulation)
        const updateData = {};
        if (displayName !== undefined) updateData.displayName = displayName;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
        if (division !== undefined) updateData.division = division;
        if (district !== undefined) updateData.district = district;
        if (address !== undefined) updateData.address = address;
        if (photoURL !== undefined) updateData.photoURL = photoURL;

        // 🔍 Backend Validation
        if (displayName && displayName.trim().length < 2) {
            return res.status(400).send({ success: false, message: 'Name is too short' });
        }

        if (phoneNumber && (phoneNumber.length < 11 || phoneNumber.length > 15)) {
            return res.status(400).send({ success: false, message: 'Phone number must be between 11 and 15 digits' });
        }

        if (address && address.length > 500) {
            return res.status(400).send({ success: false, message: 'Address is too long' });
        }

        // Perform Update
        const result = await userService.updateProfileData(email, updateData);

        if (result.matchedCount > 0) {
            res.send({ 
                success: true, 
                message: 'Profile updated successfully',
                updatedFields: Object.keys(updateData)
            });
        } else {
            res.status(404).send({ success: false, message: 'User not found' });
        }
    } catch (error) {
        console.error('❌ Update Profile Error:', error.message);
        res.status(500).send({ success: false, message: 'Internal server error during profile update' });
    }
};

module.exports = {
    updateProfileData
};
