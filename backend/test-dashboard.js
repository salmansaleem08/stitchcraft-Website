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

// MongoDB connection string - update this to match your database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/stitch-craft";

async function testDashboardQueries() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    console.log("\n=== Testing Dashboard Queries ===\n");

    // Test user counts
    console.log("User Counts:");
    const totalSuppliers = await User.countDocuments({ role: "supplier" });
    const totalTailors = await User.countDocuments({ role: "tailor" });
    const totalCustomers = await User.countDocuments({ role: "customer" });
    const totalMentors = await User.countDocuments({ "badges.type": "Mentor" });
    const verifiedSuppliers = await User.countDocuments({ role: "supplier", verificationStatus: "verified" });
    const pendingVerifications = await User.countDocuments({ role: "supplier", verificationStatus: "under_review" });

    console.log(`- Total Suppliers: ${totalSuppliers}`);
    console.log(`- Total Tailors: ${totalTailors}`);
    console.log(`- Total Customers: ${totalCustomers}`);
    console.log(`- Total Mentors: ${totalMentors}`);
    console.log(`- Verified Suppliers: ${verifiedSuppliers}`);
    console.log(`- Pending Verifications: ${pendingVerifications}`);

    // Test order counts
    console.log("\nOrder Counts:");
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({
      status: { $in: ["pending", "consultation_scheduled", "consultation_completed", "fabric_selected", "in_progress", "revision_requested", "quality_check"] }
    });
    const completedOrders = await Order.countDocuments({ status: "completed" });

    console.log(`- Total Orders: ${totalOrders}`);
    console.log(`- Pending Orders: ${pendingOrders}`);
    console.log(`- Completed Orders: ${completedOrders}`);

    // Test product counts
    console.log("\nProduct Counts:");
    const totalFabrics = await Fabric.countDocuments();
    const totalSupplies = await Supply.countDocuments();
    const totalEquipment = await Equipment.countDocuments();
    const totalProducts = totalFabrics + totalSupplies + totalEquipment;

    console.log(`- Total Fabrics: ${totalFabrics}`);
    console.log(`- Total Supplies: ${totalSupplies}`);
    console.log(`- Total Equipment: ${totalEquipment}`);
    console.log(`- Total Products: ${totalProducts}`);

    // Test learning resources
    console.log("\nLearning Resources:");
    const totalCourses = await Course.countDocuments();
    const totalWorkshops = await Workshop.countDocuments();
    const totalPatterns = await Pattern.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalNews = await IndustryNews.countDocuments();

    console.log(`- Total Courses: ${totalCourses}`);
    console.log(`- Total Workshops: ${totalWorkshops}`);
    console.log(`- Total Patterns: ${totalPatterns}`);
    console.log(`- Total Videos: ${totalVideos}`);
    console.log(`- Total News: ${totalNews}`);

    // Test revenue
    console.log("\nRevenue Calculation:");
    const revenueResult = await Order.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;
    console.log(`- Total Revenue: ${totalRevenue}`);

    console.log("\n=== Dashboard Test Complete ===");

    // Close the connection
    await mongoose.connection.close();
    console.log("Database connection closed");

  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

// Run the test
testDashboardQueries();