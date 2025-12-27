const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const connectDB = require("../config/db");
const User = require("../models/User");

const resetAdminPassword = async () => {
  try {
    await connectDB();

    // Find admin user
    const admin = await User.findOne({ email: "admin@stitchcraft.com" });

    if (!admin) {
      console.log("Admin user not found! Creating new admin...");
      const newAdmin = await User.create({
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
      console.log("Email: admin@stitchcraft.com");
      console.log("Password: 123456");
      process.exit(0);
    }

    // Reset password - set plain password, pre-save hook will hash it
    admin.password = "123456";
    await admin.save();

    console.log("Admin password reset successfully!");
    console.log("Email: admin@stitchcraft.com");
    console.log("Password: 123456");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting admin password:", error);
    process.exit(1);
  }
};

resetAdminPassword();

