const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const MONGO_URI = process.env.MONGO_URI;

async function fixReviewIndex() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const reviewsCollection = db.collection("reviews");

    // Drop the old index if it exists
    try {
      await reviewsCollection.dropIndex("tailor_1_customer_1");
      console.log("Dropped old index: tailor_1_customer_1");
    } catch (error) {
      if (error.code === 27) {
        console.log("Old index does not exist, skipping...");
      } else {
        console.log("Error dropping old index:", error.message);
      }
    }

    // Create the new index
    await reviewsCollection.createIndex(
      { tailor: 1, customer: 1, order: 1 },
      { unique: true, sparse: true, name: "tailor_1_customer_1_order_1" }
    );
    console.log("Created new index: tailor_1_customer_1_order_1");

    console.log("Index fix completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing index:", error);
    process.exit(1);
  }
}

fixReviewIndex();

