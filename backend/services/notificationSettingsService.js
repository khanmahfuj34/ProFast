let settingsCollection;

/**
 * Initialize the notification settings service with DB instance
 */
const init = (db) => {
    settingsCollection = db.collection("notification_settings");
    console.log("✅ Notification Settings Service Initialized");
};

/**
 * Get user notification settings
 */
const getSettings = async (email) => {
    if (!settingsCollection) throw new Error("Notification settings collection not initialized");
    
    let settings = await settingsCollection.findOne({ email });
    
    // If no settings exist (for old users), create defaults on the fly
    if (!settings) {
        settings = await createDefaultSettings(email);
    }
    
    return settings;
};

/**
 * Update user notification settings
 */
const updateSettings = async (email, updateData) => {
    if (!settingsCollection) throw new Error("Notification settings collection not initialized");
    
    return await settingsCollection.updateOne(
        { email },
        { $set: { ...updateData, updatedAt: new Date() } },
        { upsert: true }
    );
};

/**
 * Create default notification settings for a new user
 */
const createDefaultSettings = async (email) => {
    if (!settingsCollection) return null;

    const defaultSettings = {
        email,
        parcelUpdate: true,
        payment: true,
        announcement: true,
        promotion: true,
        emailNotifications: true,
        smsNotifications: false, // Default SMS to false for cost savings
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const existing = await settingsCollection.findOne({ email });
    if (!existing) {
        await settingsCollection.insertOne(defaultSettings);
        console.log(`🎁 Default notification settings created for: ${email}`);
    }
    
    return existing || defaultSettings;
};

module.exports = {
    init,
    getSettings,
    updateSettings,
    createDefaultSettings
};
