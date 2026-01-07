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

// MongoDB connection string - Uses environment variable or defaults to local MongoDB
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/stitch-craft";

console.log("Using MongoDB URI:", MONGO_URI.replace(/:([^:@]{4})[^:@]*@/, ":****@"));

async function seedDashboardData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    console.log("\n=== Seeding Sample Data for Dashboard Testing ===\n");

    // Check if data already exists (optional - uncomment to skip seeding if data exists)
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log(`Database already has ${existingUsers} users. Skipping seeding to avoid duplicates.`);
      console.log("If you want to reseed, manually clear the database first.");
      await mongoose.connection.close();
      return;
    }

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Order.deleteMany({}),
      Fabric.deleteMany({}),
      Supply.deleteMany({}),
      Equipment.deleteMany({}),
      Course.deleteMany({}),
      Workshop.deleteMany({}),
      Pattern.deleteMany({}),
      Video.deleteMany({}),
      IndustryNews.deleteMany({}),
    ]);

    // Create sample users
    console.log("Creating sample users...");
    const users = [
      {
        name: "Admin User",
        email: "admin@stitchcraft.com",
        password: "password123", // In real app, this would be hashed
        role: "admin",
        isActive: true,
      },
      {
        name: "John Customer",
        email: "john@example.com",
        password: "password123",
        role: "customer",
        isActive: true,
      },
      {
        name: "Jane Customer",
        email: "jane@example.com",
        password: "password123",
        role: "customer",
        isActive: true,
      },
      {
        name: "Sarah Tailor",
        email: "sarah@example.com",
        password: "password123",
        role: "tailor",
        isActive: true,
      },
      {
        name: "Mike Supplier",
        email: "mike@example.com",
        password: "password123",
        role: "supplier",
        businessName: "Mike's Sewing Supplies",
        verificationStatus: "verified",
        isActive: true,
      },
      {
        name: "Bob Supplier",
        email: "bob@example.com",
        password: "password123",
        role: "supplier",
        businessName: "Bob's Fabric Store",
        verificationStatus: "under_review",
        isActive: true,
      },
      {
        name: "Alice Mentor",
        email: "alice@example.com",
        password: "password123",
        role: "customer", // Mentors can be customers too
        badges: [{ name: "Mentor", type: "Mentor", earnedAt: new Date() }],
        isActive: true,
      },
    ];

    const createdUsers = await User.create(users);
    console.log(`✓ Created ${createdUsers.length} users`);

    // Create sample fabrics
    console.log("Creating sample fabrics...");
    const fabrics = [
      {
        name: "Cotton Poplin",
        fabricType: "Cotton",
        color: "White",
        pricePerMeter: 500,
        description: "High-quality cotton fabric",
        owner: createdUsers.find(u => u.role === "supplier")._id,
        images: ["/uploads/images/fabric1.jpg"],
      },
      {
        name: "Silk Chiffon",
        fabricType: "Silk",
        color: "Blue",
        pricePerMeter: 1200,
        description: "Luxurious silk fabric",
        owner: createdUsers.find(u => u.role === "supplier")._id,
        images: ["/uploads/images/fabric2.jpg"],
      },
    ];

    const createdFabrics = await Fabric.create(fabrics);
    console.log(`✓ Created ${createdFabrics.length} fabrics`);

    // Create sample supplies
    console.log("Creating sample supplies...");
    const supplies = [
      {
        name: "Singer Sewing Machine Needles",
        category: "Sewing Accessories",
        price: 150,
        description: "High-quality sewing machine needles",
        owner: createdUsers.find(u => u.role === "supplier")._id,
        images: ["/uploads/images/supply1.jpg"],
      },
    ];

    const createdSupplies = await Supply.create(supplies);
    console.log(`✓ Created ${createdSupplies.length} supplies`);

    // Create sample equipment
    console.log("Creating sample equipment...");
    const equipment = [
      {
        name: "Industrial Sewing Machine",
        category: "Sewing Machine",
        brand: "Singer",
        model: "Heavy Duty 4411",
        condition: "Like New",
        yearOfManufacture: 2022,
        description: "Professional grade sewing machine",
        rentalPrice: 5000,
        rentalPeriod: "daily",
        isAvailableForRental: true,
        isAvailableForSale: false,
        owner: createdUsers.find(u => u.role === "supplier")._id,
        images: ["/uploads/images/equipment1.jpg"],
        location: {
          type: "Point",
          coordinates: [73.0479, 33.6844],
          city: "Islamabad",
          province: "Punjab",
          address: "F-10 Markaz",
        },
      },
    ];

    const createdEquipment = await Equipment.create(equipment);
    console.log(`✓ Created ${createdEquipment.length} equipment`);

    // Create sample orders
    console.log("Creating sample orders...");
    const orders = [
      {
        customer: createdUsers.find(u => u.name === "John Customer")._id,
        tailor: createdUsers.find(u => u.role === "tailor")._id,
        status: "completed",
        totalAmount: 15000,
        fabrics: [createdFabrics[0]._id],
        timeline: [
          {
            status: "completed",
            timestamp: new Date(),
            description: "Order completed successfully",
          },
        ],
      },
      {
        customer: createdUsers.find(u => u.name === "Jane Customer")._id,
        tailor: createdUsers.find(u => u.role === "tailor")._id,
        status: "in_progress",
        totalAmount: 25000,
        fabrics: [createdFabrics[1]._id],
        timeline: [
          {
            status: "in_progress",
            timestamp: new Date(),
            description: "Order currently in progress",
          },
        ],
      },
      {
        customer: createdUsers.find(u => u.name === "John Customer")._id,
        tailor: createdUsers.find(u => u.role === "tailor")._id,
        status: "pending",
        totalAmount: 8000,
        timeline: [
          {
            status: "pending",
            timestamp: new Date(),
            description: "Order placed",
          },
        ],
      },
    ];

    const createdOrders = await Order.create(orders);
    console.log(`✓ Created ${createdOrders.length} orders`);

    // Create sample courses
    console.log("Creating sample courses...");
    const courses = [
      {
        title: "Basic Sewing Techniques",
        description: "Learn the fundamentals of sewing",
        instructor: createdUsers.find(u => u.name === "Alice Mentor")._id,
        price: 5000,
        duration: "4 weeks",
        level: "Beginner",
      },
      {
        title: "Advanced Pattern Making",
        description: "Master pattern design techniques",
        instructor: createdUsers.find(u => u.name === "Alice Mentor")._id,
        price: 8000,
        duration: "6 weeks",
        level: "Advanced",
      },
    ];

    const createdCourses = await Course.create(courses);
    console.log(`✓ Created ${createdCourses.length} courses`);

    // Create sample workshops
    console.log("Creating sample workshops...");
    const workshops = [
      {
        title: "Weekend Sewing Workshop",
        description: "Hands-on sewing workshop",
        instructor: createdUsers.find(u => u.name === "Alice Mentor")._id,
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week
        duration: "8 hours",
        capacity: 20,
        price: 3000,
        location: "Islamabad Training Center",
      },
    ];

    const createdWorkshops = await Workshop.create(workshops);
    console.log(`✓ Created ${createdWorkshops.length} workshops`);

    // Create sample patterns
    console.log("Creating sample patterns...");
    const patterns = [
      {
        name: "Basic Shirt Pattern",
        description: "Standard shirt pattern for beginners",
        category: "Tops",
        difficulty: "Beginner",
        price: 500,
        images: ["/uploads/images/pattern1.jpg"],
      },
    ];

    const createdPatterns = await Pattern.create(patterns);
    console.log(`✓ Created ${createdPatterns.length} patterns`);

    // Create sample videos
    console.log("Creating sample videos...");
    const videos = [
      {
        title: "How to Thread a Sewing Machine",
        description: "Step-by-step guide to threading",
        youtubeUrl: "https://youtube.com/watch?v=sample1",
        category: "Tutorials",
        duration: "5:30",
        instructor: createdUsers.find(u => u.name === "Alice Mentor")._id,
      },
    ];

    const createdVideos = await Video.create(videos);
    console.log(`✓ Created ${createdVideos.length} videos`);

    // Create sample news
    console.log("Creating sample news...");
    const news = [
      {
        title: "New Fabric Trends for 2024",
        content: "Discover the latest fabric trends...",
        category: "Fashion",
        author: createdUsers.find(u => u.role === "admin")._id,
        images: ["/uploads/images/news1.jpg"],
      },
    ];

    const createdNews = await IndustryNews.create(news);
    console.log(`✓ Created ${createdNews.length} news articles`);

    console.log("\n=== Seeding Complete ===");
    console.log("\nSample login credentials:");
    console.log("Admin: admin@stitchcraft.com / password123");
    console.log("Customer: john@example.com / password123");
    console.log("Supplier: mike@example.com / password123");

    console.log("\nDashboard should now show:");
    console.log("- 3 Total Customers");
    console.log("- 1 Total Tailor");
    console.log("- 2 Total Suppliers");
    console.log("- 1 Mentor");
    console.log("- 3 Total Orders");
    console.log("- 2 Fabrics");
    console.log("- 1 Supply");
    console.log("- 1 Equipment");
    console.log("- 2 Courses");
    console.log("- 1 Workshop");
    console.log("- 1 Pattern");
    console.log("- 1 Video");
    console.log("- 1 News Article");
    console.log("- Revenue: 15000");

    // Close the connection
    await mongoose.connection.close();
    console.log("\nDatabase connection closed");

  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

// Run the seeding
seedDashboardData();