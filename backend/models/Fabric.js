const mongoose = require("mongoose");

const fabricSchema = mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Please provide a fabric name"],
      trim: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    fabricType: {
      type: String,
      required: true,
      enum: [
        "Cotton",
        "Silk",
        "Linen",
        "Wool",
        "Polyester",
        "Rayon",
        "Chiffon",
        "Georgette",
        "Organza",
        "Velvet",
        "Denim",
        "Khadar",
        "Muslin",
        "Lawn",
        "Other",
      ],
    },
    weight: {
      type: String,
      enum: ["Light", "Medium", "Heavy", "Very Heavy"],
    },
    season: {
      type: [String],
      enum: ["Spring", "Summer", "Fall", "Winter", "All Season"],
      default: ["All Season"],
    },
    occasion: {
      type: [String],
      enum: [
        "Casual",
        "Formal",
        "Wedding",
        "Party",
        "Office",
        "Traditional",
        "Festive",
        "Everyday",
      ],
      default: ["Everyday"],
    },
    color: {
      type: String,
      required: true,
      trim: true,
    },
    pattern: {
      type: String,
      enum: [
        "Solid",
        "Striped",
        "Polka Dot",
        "Floral",
        "Geometric",
        "Abstract",
        "Paisley",
        "Embroidered",
        "Printed",
        "Plain",
        "Other",
      ],
      default: "Plain",
    },
    origin: {
      type: String,
      trim: true,
    },
    pricePerMeter: {
      type: Number,
      required: true,
      min: 0,
    },
    minimumOrderMeters: {
      type: Number,
      default: 1,
      min: 1,
    },
    stockQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      enum: ["meter", "yard"],
      default: "meter",
    },
    images: {
      type: [String],
      default: [],
    },
    careInstructions: {
      type: String,
      maxlength: 1000,
    },
    width: {
      type: Number, // in inches or cm
      min: 0,
    },
    widthUnit: {
      type: String,
      enum: ["inches", "cm"],
      default: "inches",
    },
    composition: {
      type: String, // e.g., "100% Cotton", "60% Cotton, 40% Polyester"
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient searching
fabricSchema.index({ supplier: 1, isActive: 1 });
fabricSchema.index({ fabricType: 1, isActive: 1 });
fabricSchema.index({ pricePerMeter: 1 });
fabricSchema.index({ rating: -1 });
fabricSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Fabric", fabricSchema);

