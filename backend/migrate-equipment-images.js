const mongoose = require("mongoose");
const Equipment = require("./models/Equipment");

// MongoDB connection string - update this to match your database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/stitch-craft";
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:5000";

async function migrateEquipmentImages() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    // Find all equipment documents with images
    const equipment = await Equipment.find({ images: { $exists: true, $ne: [] } });
    console.log(`Found ${equipment.length} equipment documents with images`);

    let migratedCount = 0;

    for (const item of equipment) {
      let needsUpdate = false;
      const updatedImages = item.images.map(imageUrl => {
        // Check if it's a relative path starting with /uploads
        if (typeof imageUrl === 'string' && imageUrl.startsWith('/uploads/')) {
          needsUpdate = true;
          return `${BACKEND_URL}${imageUrl}`;
        }
        // If it's already a full URL or doesn't match the pattern, return as is
        return imageUrl;
      });

      if (needsUpdate) {
        console.log(`Updating equipment: ${item.name} (${item._id})`);
        await Equipment.findByIdAndUpdate(item._id, {
          $set: { images: updatedImages }
        });
        migratedCount++;
        console.log(`✓ Updated: ${item.name}`);
      }
    }

    console.log(`\nMigration completed!`);
    console.log(`Total documents updated: ${migratedCount}`);

    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
migrateEquipmentImages();