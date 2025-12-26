const mongoose = require("mongoose");

const packageSchema = mongoose.Schema(
  {
    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    packageType: {
      type: String,
      enum: ["fabric_stitching", "multiple_garments", "seasonal", "corporate", "custom"],
      required: true,
    },
    // Package contents
    garments: {
      type: [
        {
          garmentType: String,
          quantity: Number,
          basePrice: Number,
        },
      ],
      default: [],
    },
    // Fabric included
    fabricIncluded: {
      type: Boolean,
      default: false,
    },
    fabricDetails: {
      type: {
        fabricType: String,
        color: String,
        quantity: Number, // in meters
        cost: Number,
      },
    },
    // Pricing
    originalPrice: {
      type: Number,
      required: true,
    },
    packagePrice: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    // Validity
    validFrom: {
      type: Date,
      default: Date.now,
    },
    validUntil: {
      type: Date,
    },
    // Availability
    isActive: {
      type: Boolean,
      default: true,
    },
    isLimited: {
      type: Boolean,
      default: false,
    },
    maxOrders: {
      type: Number,
    },
    currentOrders: {
      type: Number,
      default: 0,
    },
    // Features
    features: {
      type: [String],
      default: [],
    },
    // Terms and conditions
    terms: {
      type: String,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup
packageSchema.index({ tailor: 1, packageType: 1, isActive: 1 });

module.exports = mongoose.model("Package", packageSchema);

