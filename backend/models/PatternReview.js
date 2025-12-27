const mongoose = require("mongoose");

const patternReviewSchema = mongoose.Schema(
  {
    pattern: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pattern",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    },
    images: [String], // User's finished product images
    helpful: {
      type: Number,
      default: 0,
    },
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
patternReviewSchema.index({ pattern: 1 });
patternReviewSchema.index({ user: 1 });
patternReviewSchema.index({ rating: -1 });

// Prevent duplicate reviews
patternReviewSchema.index({ pattern: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("PatternReview", patternReviewSchema);

