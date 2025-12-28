const mongoose = require("mongoose");

const supplySchema = mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide a supply name"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Threads",
        "Needles",
        "Buttons",
        "Zippers",
        "Sewing Machines",
        "Embroidery Materials",
        "Mannequins",
        "Measuring Tools",
        "Packaging Materials",
        "Other",
      ],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    brand: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    size: {
      type: String,
      trim: true,
    },
    material: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: ["piece", "pack", "set", "meter", "yard", "kg", "gram", "box", "dozen"],
      default: "piece",
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    specifications: {
      type: Map,
      of: String, // Key-value pairs for specifications
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    bulkDiscountEnabled: {
      type: Boolean,
      default: false,
    },
    bulkDiscountTiers: {
      type: [
        {
          minQuantity: Number,
          discountPercentage: Number,
        },
      ],
      default: [],
    },
    sustainability: {
      isSustainable: { type: Boolean, default: false },
      certification: { type: String, enum: ["Organic", "Fair Trade", "Recycled", "Eco-Friendly", "Other"], default: null },
      sustainableDescription: { type: String, maxlength: 500 },
    },
    wasteTracking: {
      totalWaste: { type: Number, default: 0 }, // in units
      wastePercentage: { type: Number, default: 0, min: 0, max: 100 },
      lastWasteUpdate: { type: Date },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient searching
supplySchema.index({ supplier: 1, isActive: 1 });
supplySchema.index({ category: 1, isActive: 1 });
supplySchema.index({ price: 1 });
supplySchema.index({ rating: -1 });
supplySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Supply", supplySchema);

