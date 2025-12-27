const mongoose = require("mongoose");

const patternSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a pattern title"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Please add a pattern description"],
    },
    designer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Traditional Pakistani",
        "Modern Fashion",
        "Western",
        "Fusion",
        "Bridal",
        "Casual",
        "Formal",
        "Kids",
        "Men",
        "Women",
        "Unisex",
        "Other",
      ],
    },
    designType: {
      type: String,
      required: true,
      enum: ["Kurta", "Shalwar", "Dupatta", "Saree", "Lehenga", "Gown", "Shirt", "Trouser", "Jacket", "Coat", "Other"],
    },
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Intermediate",
    },
    images: [
      {
        url: { type: String, required: true },
        caption: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    patternFile: {
      url: { type: String, required: true },
      fileName: String,
      fileSize: Number,
      fileType: String,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    tags: [String],
    measurements: {
      sizes: [String], // e.g., ["XS", "S", "M", "L", "XL"]
      customSizing: { type: Boolean, default: false },
    },
    fabricRequirements: {
      fabricType: String,
      estimatedYards: Number,
      estimatedMeters: Number,
      notes: String,
    },
    careInstructions: {
      washing: String,
      ironing: String,
      dryCleaning: { type: Boolean, default: false },
      specialNotes: String,
    },
    copyright: {
      owner: { type: String, required: true },
      license: {
        type: String,
        enum: ["All Rights Reserved", "Personal Use", "Commercial Use", "Creative Commons", "Custom"],
        default: "All Rights Reserved",
      },
      licenseDetails: String,
      watermark: { type: Boolean, default: true },
    },
    collaboration: {
      enabled: { type: Boolean, default: false },
      collaborators: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          role: { type: String, enum: ["Viewer", "Editor", "Co-Designer"], default: "Viewer" },
          addedAt: { type: Date, default: Date.now },
        },
      ],
      requests: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          message: String,
          status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
          requestedAt: { type: Date, default: Date.now },
        },
      ],
    },
    stats: {
      views: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 },
      purchases: { type: Number, default: 0 },
      favorites: { type: Number, default: 0 },
      rating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for search
patternSchema.index({ title: "text", description: "text", tags: "text" });
patternSchema.index({ category: 1, designType: 1 });
patternSchema.index({ designer: 1 });
patternSchema.index({ price: 1 });
patternSchema.index({ "stats.rating": -1 });
patternSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Pattern", patternSchema);

