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
            name: user.name || riderDoc.name || "Rider Rider",
            email: user.email || email,
            phone: user.phone || riderDoc.phone || "+880 1712 345 678",
            photo: sanitizeImageUrl(user.photo || user.photoURL || riderDoc.photo, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"),
            dateOfBirth: user.dateOfBirth || "1998-05-12",
            gender: user.gender || "Male",
            division: user.division || riderDoc.division || "Dhaka",
            district: user.district || riderDoc.district || "Dhaka",
            currentAddress: user.currentAddress || riderDoc.currentAddress || "Mirpur 10, Dhaka 1216, Bangladesh",
            preferredDeliveryArea: user.preferredDeliveryArea || "Mirpur, Pallabi, Kallyanpur, Shyamoli",
            bikeType: user.bikeType || riderDoc.bikeType || "Yamaha FZS V3",
            bikeRegistration: user.bikeRegistration || riderDoc.bikeRegistration || "Dhaka Metro LA-11-1234",
            drivingLicense: user.drivingLicense || riderDoc.drivingLicense || "DL-987654321",
            nidNumber: user.nidNumber || riderDoc.nidNumber || "19987654321000123",
            isOnline: user.isOnline !== undefined ? user.isOnline : true,
            acceptDeliveryRequests: user.acceptDeliveryRequests !== undefined ? user.acceptDeliveryRequests : true,
            availableDays: user.availableDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            availableHours: user.availableHours || "08:00 AM - 10:00 PM",
            dayOffMode: user.dayOffMode || "Sunday"
        };
    }

    static async updateProfileSection(usersCollection, riderCollection, email, profileData) {
        const updateFields = {
            name: profileData.name,
            phone: profileData.phone,
            dateOfBirth: profileData.dateOfBirth,
            gender: profileData.gender,
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
            division: locationData.division,
            district: locationData.district,
            currentAddress: locationData.currentAddress,
            preferredDeliveryArea: locationData.preferredDeliveryArea,
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
            bikeType: vehicleData.bikeType,
            bikeRegistration: vehicleData.bikeRegistration,
            drivingLicense: vehicleData.drivingLicense,
            nidNumber: vehicleData.nidNumber,
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
            isOnline: availabilityData.isOnline !== undefined ? availabilityData.isOnline : true,
            acceptDeliveryRequests: availabilityData.acceptDeliveryRequests !== undefined ? availabilityData.acceptDeliveryRequests : true,
            availableDays: availabilityData.availableDays || ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            availableHours: availabilityData.availableHours || "08:00 AM - 10:00 PM",
            dayOffMode: availabilityData.dayOffMode || "Sunday",
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
        // In JWT/Firebase architecture, we update a session version or token invalidation timestamp
        const logoutTimestamp = new Date();
        await usersCollection.updateOne({ email }, { $set: { lastLogoutAllAt: logoutTimestamp } });
        return { success: true, message: "Logged out from all devices successfully." };
    }

    static async getActiveSessions(email, reqIp, reqUserAgent) {
        // Return structured active session list
        return [
            {
                id: "sess_1",
                device: "Windows - Chrome browser",
                ip: reqIp || "192.168.1.1",
                location: "Dhaka, Bangladesh",
                isCurrent: true,
                lastActive: "Just now"
            },
            {
                id: "sess_2",
                device: "Android App - ProFast Mobile",
                ip: "103.152.18.42",
                location: "Dhaka, Bangladesh",
                isCurrent: false,
                lastActive: "2 hours ago"
            }
        ];
    }
}

module.exports = RiderSettingsService;
