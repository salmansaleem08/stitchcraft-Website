const mongoose = require("mongoose");
const User = require("./models/User");
const Order = require("./models/Order");
const Fabric = require("./models/Fabric");
const Supply = require("./models/Supply");
const Equipment = require("./models/Equipment");
const Course = require("./models/Course");
const Workshop = require("./models/Workshop");
const Pattern = require("./models/Pattern");
const Video = require("./models/Video");
const IndustryNews = require("./models/IndustryNews");

// Load environment variables
require("dotenv").config();

// MongoDB connection string - Uses environment variable
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/stitch-craft";

console.log("Using MongoDB URI:", MONGO_URI.replace(/:([^:@]{4})[^:@]*@/, ":****@"));

async function checkDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("\n=== Database Contents Check ===\n");

    // Check collections and their counts
    const collections = [
      { name: "Users", model: User },
      { name: "Orders", model: Order },
      { name: "Fabrics", model: Fabric },
      { name: "Supplies", model: Supply },
      { name: "Equipment", model: Equipment },
      { name: "Courses", model: Course },
      { name: "Workshops", model: Workshop },
      { name: "Patterns", model: Pattern },
      { name: "Videos", model: Video },
      { name: "Industry News", model: IndustryNews },
    ];

    for (const collection of collections) {
      try {
        const count = await collection.model.countDocuments();
        console.log(`${collection.name}: ${count} documents`);
      } catch (error) {
        console.log(`${collection.name}: Error - ${error.message}`);
      }
    }

    // Check for admin users specifically
    console.log("\n=== User Details ===");
    const users = await User.find({}, 'name email role isActive').limit(10);
    console.log("Users found:", users.length);

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}, Active: ${user.isActive}`);
    });

    // Check for suppliers and their verification status
    const suppliers = await User.find({ role: "supplier" }, 'name verificationStatus').limit(5);
    console.log("\nSuppliers found:", suppliers.length);
    suppliers.forEach((supplier, index) => {
      console.log(`${index + 1}. ${supplier.name} - Verification: ${supplier.verificationStatus}`);
    });

    // Check for orders with different statuses
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log("\nOrders by status:");
    ordersByStatus.forEach(status => {
      console.log(`- ${status._id}: ${status.count}`);
    });

    console.log("\n=== Check Complete ===");

    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");

  } catch (error) {
    console.error("Database check failed:", error);
    process.exit(1);
  }
}

// Run the check
checkDatabase();