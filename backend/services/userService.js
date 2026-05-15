let usersCollection;

/**
 * Initialize the user service with DB instance
 */
const init = (db) => {
    usersCollection = db.collection("users");
    console.log("✅ User Service Initialized");
};

/**
 * Update user profile data by email
 */
const updateProfileData = async (email, updateData) => {
    if (!usersCollection) throw new Error("User collection not initialized");
    
    return await usersCollection.updateOne(
        { email: email },
        { $set: { ...updateData, updatedAt: new Date() } }
    );
};

module.exports = {
    init,
    updateProfileData
};
