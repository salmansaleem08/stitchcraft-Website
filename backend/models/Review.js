const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    photos: {
      type: [String],
      default: [],
    },
    responseTime: {
      type: Number, // in hours
    },
    quality: {
      type: Number,
      min: 1,
      max: 5,
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from same customer for same tailor on the same order
// This allows multiple reviews from same customer for same tailor if they're for different orders
reviewSchema.index({ tailor: 1, customer: 1, order: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Review", reviewSchema);

