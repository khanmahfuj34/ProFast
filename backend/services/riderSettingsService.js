/**
 * riderSettingsService.js
 * Handles MongoDB operations for rider profile, location, vehicle, availability, security, and support settings.
 */
const { sanitizeImageUrl } = require('../utils/uploadHelper');

class RiderSettingsService {
    static async getRiderProfile(usersCollection, riderCollection, email) {
        if (!email) throw new Error("Email is required");

        const user = (await usersCollection.findOne({ email })) || {};
        const riderDoc = (await riderCollection.findOne({ email })) || {};

        return {
            name: user.name || riderDoc.name || "",
            email: user.email || email || "",
            phone: user.phone || riderDoc.phone || "",
            photo: sanitizeImageUrl(user.photo || user.photoURL || riderDoc.photo, ""),
            dateOfBirth: user.dateOfBirth || "",
            gender: user.gender || "",
            division: user.division || riderDoc.division || "",
            district: user.district || riderDoc.district || "",
            currentAddress: user.currentAddress || riderDoc.currentAddress || "",
            preferredDeliveryArea: user.preferredDeliveryArea || "",
            bikeType: user.bikeType || riderDoc.bikeType || "",
            bikeRegistration: user.bikeRegistration || riderDoc.bikeRegistration || "",
            drivingLicense: user.drivingLicense || riderDoc.drivingLicense || "",
            nidNumber: user.nidNumber || riderDoc.nidNumber || "",
            isOnline: user.isOnline !== undefined ? user.isOnline : false,
            acceptDeliveryRequests: user.acceptDeliveryRequests !== undefined ? user.acceptDeliveryRequests : false,
            availableDays: Array.isArray(user.availableDays) ? user.availableDays : [],
            availableHours: user.availableHours || "",
            dayOffMode: user.dayOffMode || ""
        };
    }

    static async updateProfileSection(usersCollection, riderCollection, email, profileData) {
        const updateFields = {
            name: profileData.name || "",
            phone: profileData.phone || "",
            dateOfBirth: profileData.dateOfBirth || "",
            gender: profileData.gender || "",
            updatedAt: new Date()
        };

        if (profileData.photo) {
            updateFields.photo = sanitizeImageUrl(profileData.photo);
            updateFields.photoURL = updateFields.photo;
        }

        await usersCollection.updateOne({ email }, { $set: updateFields });
        const riderExists = await riderCollection.findOne({ email });
        if (riderExists) {
            await riderCollection.updateOne({ email }, { $set: updateFields });
        }

        return updateFields;
    }

    static async updateLocationSection(usersCollection, riderCollection, email, locationData) {
        const updateFields = {
            division: locationData.division || "",
            district: locationData.district || "",
            currentAddress: locationData.currentAddress || "",
            preferredDeliveryArea: locationData.preferredDeliveryArea || "",
            updatedAt: new Date()
        };

        await usersCollection.updateOne({ email }, { $set: updateFields });
        const riderExists = await riderCollection.findOne({ email });
        if (riderExists) {
            await riderCollection.updateOne({ email }, { $set: updateFields });
        }

        return updateFields;
    }

    static async updateVehicleSection(usersCollection, riderCollection, email, vehicleData) {
        const updateFields = {
            bikeType: vehicleData.bikeType || "",
            bikeRegistration: vehicleData.bikeRegistration || "",
            drivingLicense: vehicleData.drivingLicense || "",
            nidNumber: vehicleData.nidNumber || "",
            updatedAt: new Date()
        };

        await usersCollection.updateOne({ email }, { $set: updateFields });
        const riderExists = await riderCollection.findOne({ email });
        if (riderExists) {
            await riderCollection.updateOne({ email }, { $set: updateFields });
        }

        return updateFields;
    }

    static async updateAvailabilitySection(usersCollection, riderCollection, email, availabilityData) {
        const updateFields = {
            isOnline: availabilityData.isOnline !== undefined ? availabilityData.isOnline : false,
            acceptDeliveryRequests: availabilityData.acceptDeliveryRequests !== undefined ? availabilityData.acceptDeliveryRequests : false,
            availableDays: Array.isArray(availabilityData.availableDays) ? availabilityData.availableDays : [],
            availableHours: availabilityData.availableHours || "",
            dayOffMode: availabilityData.dayOffMode || "",
            updatedAt: new Date()
        };

        await usersCollection.updateOne({ email }, { $set: updateFields });
        const riderExists = await riderCollection.findOne({ email });
        if (riderExists) {
            await riderCollection.updateOne({ email }, { $set: updateFields });
        }

        return updateFields;
    }

    static async logoutAllDevices(usersCollection, email) {
        const logoutTimestamp = new Date();
        await usersCollection.updateOne({ email }, { $set: { lastLogoutAllAt: logoutTimestamp } });
        return { success: true, message: "Logged out from all devices successfully." };
    }

    static async getActiveSessions(email, reqIp, reqUserAgent) {
        return [
            {
                id: "sess_1",
                device: "Windows - Chrome browser",
                ip: reqIp || "192.168.1.1",
                location: "Dhaka, Bangladesh",
                isCurrent: true,
                lastActive: "Just now"
            }
        ];
    }
}

module.exports = RiderSettingsService;
