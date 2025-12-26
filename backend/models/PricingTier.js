const mongoose = require("mongoose");

const pricingTierSchema = mongoose.Schema(
  {
    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tierType: {
      type: String,
      enum: ["basic", "premium", "luxury", "bulk"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    // Base pricing
    basePrice: {
      type: Number,
      required: true,
    },
    // Pricing by garment type
    garmentPricing: {
      type: Map,
      of: Number,
      default: {},
    },
    // Additional charges
    additionalCharges: {
      embroidery: Number,
      alterations: Number,
      rushOrder: Number,
      customDesign: Number,
    },
    // Minimum order requirements
    minimumOrder: {
      type: Number,
      default: 1,
    },
    // Discounts
    discounts: {
      multipleGarments: {
        enabled: Boolean,
        threshold: Number, // Number of garments
        percentage: Number,
      },
      seasonal: {
        enabled: Boolean,
        percentage: Number,
        startDate: Date,
        endDate: Date,
      },
      corporate: {
        enabled: Boolean,
        percentage: Number,
        minimumOrders: Number,
      },
    },
    // Features included
    features: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup
pricingTierSchema.index({ tailor: 1, tierType: 1 });

module.exports = mongoose.model("PricingTier", pricingTierSchema);

