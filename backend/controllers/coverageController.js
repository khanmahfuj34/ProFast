const coverageService = require('../services/coverageService');

/**
 * Controller to fetch all divisions
 */
const getDivisions = async (req, res) => {
    try {
        const divisions = await coverageService.getDivisions();
        console.log("📤 Sending divisions to frontend:", divisions);
        res.status(200).send({
            success: true,
            divisions: divisions || []
        });
    } catch (error) {
        console.error("❌ Controller getDivisions Error:", error.message);
        res.status(500).send({
            success: false,
            message: "Failed to fetch divisions",
            error: error.message
        });
    }
};

/**
 * Controller to fetch districts by division
 */
const getDistricts = async (req, res) => {
    try {
        const { division } = req.params;
        if (!division) {
            return res.status(400).send({ success: false, message: "Division is required" });
        }
        
        const districts = await coverageService.getDistrictsByDivision(division);
        res.status(200).send({
            success: true,
            districts
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Failed to fetch districts",
            error: error.message
        });
    }
};

module.exports = {
    getDivisions,
    getDistricts
};
