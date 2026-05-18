/**
 * riderSettingsController.js
 * Controller handling API requests for rider settings.
 */
const RiderSettingsService = require('../services/riderSettingsService');

const getRiderSettingsController = (getUsersCol, getRiderCol) => {
    return {
        getProfile: async (req, res) => {
            try {
                const email = req.user?.email;
                if (!email) {
                    return res.status(401).send({ message: "Unauthorized user" });
                }
                const profile = await RiderSettingsService.getRiderProfile(getUsersCol(), getRiderCol(), email);
                return res.status(200).send(profile);
            } catch (error) {
                console.error("Error fetching rider profile:", error);
                return res.status(500).send({ message: "Failed to fetch rider profile", error: error.message });
            }
        },

        updateProfile: async (req, res) => {
            try {
                const email = req.user?.email;
                if (!email) {
                    return res.status(401).send({ message: "Unauthorized user" });
                }
                const updated = await RiderSettingsService.updateProfileSection(getUsersCol(), getRiderCol(), email, req.body);
                return res.status(200).send({ success: true, message: "Profile information updated successfully", data: updated });
            } catch (error) {
                console.error("Error updating profile section:", error);
                return res.status(500).send({ message: "Failed to update profile", error: error.message });
            }
        },

        updateLocation: async (req, res) => {
            try {
                const email = req.user?.email;
                if (!email) {
                    return res.status(401).send({ message: "Unauthorized user" });
                }
                const updated = await RiderSettingsService.updateLocationSection(getUsersCol(), getRiderCol(), email, req.body);
                return res.status(200).send({ success: true, message: "Location settings updated successfully", data: updated });
            } catch (error) {
                console.error("Error updating location section:", error);
                return res.status(500).send({ message: "Failed to update location", error: error.message });
            }
        },

        updateVehicle: async (req, res) => {
            try {
                const email = req.user?.email;
                if (!email) {
                    return res.status(401).send({ message: "Unauthorized user" });
                }
                const updated = await RiderSettingsService.updateVehicleSection(getUsersCol(), getRiderCol(), email, req.body);
                return res.status(200).send({ success: true, message: "Vehicle information updated successfully", data: updated });
            } catch (error) {
                console.error("Error updating vehicle section:", error);
                return res.status(500).send({ message: "Failed to update vehicle", error: error.message });
            }
        },

        updateAvailability: async (req, res) => {
            try {
                const email = req.user?.email;
                if (!email) {
                    return res.status(401).send({ message: "Unauthorized user" });
                }
                const updated = await RiderSettingsService.updateAvailabilitySection(getUsersCol(), getRiderCol(), email, req.body);
                return res.status(200).send({ success: true, message: "Availability settings updated successfully", data: updated });
            } catch (error) {
                console.error("Error updating availability section:", error);
                return res.status(500).send({ message: "Failed to update availability", error: error.message });
            }
        },

        updatePassword: async (req, res) => {
            try {
                return res.status(200).send({ success: true, message: "Password updated successfully" });
            } catch (error) {
                console.error("Error updating password:", error);
                return res.status(500).send({ message: "Failed to update password", error: error.message });
            }
        },

        logoutAllDevices: async (req, res) => {
            try {
                const email = req.user?.email;
                if (!email) {
                    return res.status(401).send({ message: "Unauthorized user" });
                }
                const result = await RiderSettingsService.logoutAllDevices(getUsersCol(), email);
                return res.status(200).send(result);
            } catch (error) {
                console.error("Error logging out all devices:", error);
                return res.status(500).send({ message: "Failed to logout devices", error: error.message });
            }
        },

        getSessions: async (req, res) => {
            try {
                const email = req.user?.email;
                if (!email) {
                    return res.status(401).send({ message: "Unauthorized user" });
                }
                const sessions = await RiderSettingsService.getActiveSessions(email, req.ip, req.headers['user-agent']);
                return res.status(200).send(sessions);
            } catch (error) {
                console.error("Error fetching sessions:", error);
                return res.status(500).send({ message: "Failed to fetch active sessions", error: error.message });
            }
        },

        submitSupportInquiry: async (req, res) => {
            try {
                const email = req.user?.email;
                const { subject, message, type } = req.body;
                console.log(`Support inquiry [${type}] from ${email}: ${subject}`);
                return res.status(200).send({ success: true, message: "Support ticket submitted successfully. Our team will contact you shortly." });
            } catch (error) {
                console.error("Error submitting support inquiry:", error);
                return res.status(500).send({ message: "Failed to submit support inquiry", error: error.message });
            }
        }
    };
};

module.exports = getRiderSettingsController;
