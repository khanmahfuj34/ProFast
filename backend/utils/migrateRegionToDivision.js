const { ObjectId } = require('mongodb');

async function migrateRegionToDivision(riderCollection) {
    try {
        console.log('🔄 [Migration] Starting region to division migration check...');
        
        // Find all riders that have the 'region' field
        const ridersToMigrate = await riderCollection.find({ region: { $exists: true } }).toArray();
        
        if (ridersToMigrate.length === 0) {
            console.log('✅ [Migration] No riders found needing region-to-division migration.');
            return;
        }

        console.log(`⚠️ [Migration] Found ${ridersToMigrate.length} riders with legacy 'region' field. Migrating now...`);
        
        let migratedCount = 0;
        for (const rider of ridersToMigrate) {
            // Prioritize division if both exist, else fallback to region
            let divisionValue = rider.division || rider.region;
            
            // Apply normalization
            if (typeof divisionValue === 'string') {
                // Ensure it's correctly cased if possible, but at least trimmed
                divisionValue = divisionValue.trim();
            }
            
            await riderCollection.updateOne(
                { _id: rider._id },
                { 
                    $set: { division: divisionValue },
                    $unset: { region: "" } 
                }
            );
            migratedCount++;
        }
        
        console.log(`✅ [Migration] Successfully migrated ${migratedCount} riders to use 'division' field.`);
    } catch (error) {
        console.error('❌ [Migration] Error during region to division migration:', error);
    }
}

module.exports = migrateRegionToDivision;
