let coverageCollection;

/**
 * Initialize the coverage service with DB instance
 */
const init = (db) => {
    try {
        if (!db) {
            console.error("❌ Coverage Service Init: No DB provided");
            return;
        }
        // Changing collection name to ensure a fresh start
        coverageCollection = db.collection("coverage_data");
        console.log("✅ Coverage Service Initialized with Collection:", coverageCollection.collectionName);
    } catch (error) {
        console.error("❌ Coverage Service Init Error:", error.message);
    }
};

// Hardcoded fallback data in case DB is empty
const fallbackDivisions = ["Dhaka", "Chattogram", "Sylhet", "Rangpur", "Khulna", "Rajshahi", "Barisal", "Mymensingh"];

const fallbackDistricts = {
    "Dhaka": ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
    "Chattogram": ["Chattogram", "Cox's Bazar", "Cumilla", "Brahmanbaria", "Chandpur", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati", "Bandarban"],
    "Sylhet": ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
    "Rangpur": ["Rangpur", "Dinajpur", "Thakurgaon", "Panchagarh", "Nilphamari", "Lalmonirhat", "Kurigram", "Gaibandha"],
    "Khulna": ["Khulna", "Jessore", "Satkhira", "Bagerhat", "Magura", "Narail", "Jhenaidah", "Chuadanga", "Meherpur", "Kushtia"],
    "Rajshahi": ["Rajshahi", "Natore", "Naogaon", "Chapainawabganj", "Pabna", "Sirajganj", "Joypurhat", "Bogura"],
    "Barisal": ["Barisal", "Bhola", "Patuakhali", "Pirojpur", "Barguna", "Jhalokati"],
    "Mymensingh": ["Mymensingh", "Netrokona", "Jamalpur", "Sherpur"]
};

/**
 * Get all unique divisions
 */
const getDivisions = async () => {
    if (!coverageCollection) {
        console.error("❌ getDivisions: coverageCollection is NOT initialized. Using fallback.");
        return fallbackDivisions;
    }
    try {
        const divisions = await coverageCollection.distinct("division");
        if (!divisions || divisions.length === 0) {
            console.warn("⚠️ getDivisions returned empty. Using fallback.");
            return fallbackDivisions;
        }
        console.log("🔍 getDivisions found:", divisions.length, "divisions");
        return divisions;
    } catch (error) {
        console.error("❌ getDivisions DB Error:", error.message);
        return fallbackDivisions;
    }
};

/**
 * Get all districts for a specific division
 */
const getDistrictsByDivision = async (division) => {
    if (!coverageCollection) {
        console.error("❌ getDistrictsByDivision: coverageCollection is NOT initialized. Using fallback.");
        return fallbackDistricts[division] || [];
    }
    try {
        const districtsData = await coverageCollection
            .find({ division: division })
            .project({ district: 1, _id: 0 })
            .toArray();
        
        const districts = [...new Set(districtsData.map(d => d.district))];
        if (districts.length === 0) {
            console.warn(`⚠️ No districts found in DB for "${division}". Using fallback.`);
            return fallbackDistricts[division] || [];
        }
        console.log(`🔍 getDistrictsByDivision for "${division}" found:`, districts.length, "districts");
        return districts;
    } catch (error) {
        console.error("❌ getDistrictsByDivision DB Error:", error.message);
        return fallbackDistricts[division] || [];
    }
};

/**
 * Seed coverage data if collection is empty
 */
const seedCoverageData = async (data) => {
    if (!coverageCollection) {
        console.error("❌ seedCoverageData: coverageCollection is NOT initialized");
        return;
    }
    try {
        // Clear if you want to force fresh data, but here we just check count
        const count = await coverageCollection.countDocuments();
        console.log("📊 Current coverage documents count:", count);
        if (count === 0) {
            console.log("🌱 Seeding coverage data...");
            const result = await coverageCollection.insertMany(data);
            console.log("✅ Seeded", result.insertedCount, "documents into coverage collection");
        }
    } catch (error) {
        console.error("❌ Seed Coverage Data Error:", error.message);
    }
};

module.exports = {
    init,
    getDivisions,
    getDistrictsByDivision,
    seedCoverageData
};
