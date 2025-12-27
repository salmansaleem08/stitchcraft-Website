const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const connectDB = require("../config/db");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: "admin@stitchcraft.com" });

    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log("Email: admin@stitchcraft.com");
      console.log("Password: 123456");
      process.exit(0);
    }

    // Create admin user
    // Note: We pass plain password - the User model's pre-save hook will hash it
    const admin = await User.create({
      name: "Admin",
      email: "admin@stitchcraft.com",
      password: "123456", // Plain password - will be hashed by pre-save hook
      role: "admin",
      phone: "0000000000",
      address: {
        city: "Karachi",
        province: "Sindh",
        country: "Pakistan",
      },
    });

    console.log("Admin user created successfully!");
    console.log("Email/Username: admin@stitchcraft.com");
    console.log("Password: 123456");
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error);
    process.exit(1);
  }
};

createAdmin();

