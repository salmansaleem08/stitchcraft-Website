const mongoose = require("mongoose");

const patternPurchaseSchema = mongoose.Schema(
  {
    pattern: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pattern",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "wallet"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastDownloadedAt: Date,
    license: {
      type: String,
      enum: ["Personal Use", "Commercial Use", "All Rights Reserved"],
      default: "Personal Use",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
patternPurchaseSchema.index({ pattern: 1, buyer: 1 });
patternPurchaseSchema.index({ buyer: 1 });
patternPurchaseSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model("PatternPurchase", patternPurchaseSchema);

