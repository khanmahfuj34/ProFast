const securityService = require('../services/securityService');

/**
 * Controller to revoke all sessions for the logged-in user
 */
const revokeSessions = async (req, res) => {
    try {
        const uid = req.user.uid;
        await securityService.revokeSessions(uid);
        
        res.status(200).send({
            success: true,
            message: 'Successfully revoked all active sessions. You will need to log in again on other devices.'
        });
    } catch (error) {
        console.error('❌ Revoke Sessions Error:', error.message);
        res.status(500).send({
            success: false,
            message: 'Failed to revoke sessions',
            error: error.message
        });
    }
};

/**
 * Controller to fetch account security metadata
 */
const getAccountMetadata = async (req, res) => {
    try {
        const uid = req.user.uid;
        const metadata = await securityService.getAccountMetadata(uid);
        
        res.status(200).send({
            success: true,
            metadata
        });
    } catch (error) {
        console.error('❌ Get Account Metadata Error:', error.message);
        res.status(500).send({
            success: false,
            message: 'Failed to fetch account metadata',
            error: error.message
        });
    }
};

module.exports = {
    revokeSessions,
    getAccountMetadata
};
