const admin = require('firebase-admin');

/**
 * Revoke all active refresh tokens for a user.
 * This effectively logs them out of all devices on the next token refresh.
 */
const revokeSessions = async (uid) => {
    if (!uid) throw new Error("User UID is required");
    await admin.auth().revokeRefreshTokens(uid);
    console.log(`🔐 Revoked tokens for user: ${uid}`);
    return true;
};

/**
 * Fetch detailed account metadata from Firebase Admin SDK
 */
const getAccountMetadata = async (uid) => {
    if (!uid) throw new Error("User UID is required");
    const userRecord = await admin.auth().getUser(uid);
    
    return {
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        creationTime: userRecord.metadata.creationTime,
        lastSignInTime: userRecord.metadata.lastSignInTime,
        lastRefreshTime: userRecord.metadata.lastRefreshTime,
        disabled: userRecord.disabled
    };
};

module.exports = {
    revokeSessions,
    getAccountMetadata
};
