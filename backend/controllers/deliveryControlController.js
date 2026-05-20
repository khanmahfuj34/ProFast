const deliveryControlService = require('../services/deliveryControlService');

const getStats = async (req, res) => {
    try {
        const stats = await deliveryControlService.getStats();
        res.json({ success: true, stats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getRequests = async (req, res) => {
    try {
        const requests = await deliveryControlService.getRequests();
        res.json({ success: true, requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getFailedAssignments = async (req, res) => {
    try {
        const failed = await deliveryControlService.getFailedAssignments();
        res.json({ success: true, failed });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const assignManually = async (req, res) => {
    try {
        const { trackingId } = req.params;
        const { riderEmail } = req.body;
        if (!riderEmail) {
            return res.status(400).json({ success: false, message: "Rider email is required" });
        }
        const result = await deliveryControlService.assignManually(trackingId, riderEmail);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getRiderDetails = async (req, res) => {
    try {
        const { email } = req.params;
        if (!email) {
            return res.status(400).json({ success: false, message: "Rider email is required" });
        }
        const rider = await deliveryControlService.getRiderDetails(email);
        if (!rider) {
            return res.status(404).json({ success: false, message: "Rider not found" });
        }
        res.json({ success: true, rider });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getStats,
    getRequests,
    getFailedAssignments,
    getRiderDetails,
    assignManually
};
