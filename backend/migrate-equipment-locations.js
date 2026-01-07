const mongoose = require("mongoose");
const Equipment = require("./models/Equipment");

// MongoDB connection string - update this to match your database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/stitch-craft";

async function migrateEquipmentLocations() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all equipment documents
    const equipment = await Equipment.find({});
    console.log(`Found ${equipment.length} equipment documents`);

    let migratedCount = 0;

    for (const item of equipment) {
      // Check if location needs migration (old format)
      if (item.location && !item.location.type && item.location.city) {
        console.log(`Migrating equipment: ${item.name} (${item._id})`);

        // Convert old format to new GeoJSON format
        const oldLocation = item.location;

        // Set default coordinates if not provided (you may want to geocode addresses)
        const coordinates = oldLocation.coordinates ?
          [oldLocation.coordinates.longitude || 0, oldLocation.coordinates.latitude || 0] :
          [73.0479, 33.6844]; // Default to Islamabad coordinates

        const newLocation = {
          type: 'Point',
          coordinates: coordinates,
          city: oldLocation.city,
          province: oldLocation.province,
          address: oldLocation.address
        };

        // Update the document
        await Equipment.findByIdAndUpdate(item._id, {
          $set: { location: newLocation }
        });

        migratedCount++;
        console.log(`✓ Migrated: ${item.name}`);
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`Total documents migrated: ${migratedCount}`);

    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateEquipmentLocations();