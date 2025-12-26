const mongoose = require("mongoose");

const measurementSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    measurementType: {
      type: String,
      enum: ["standard", "custom"],
      default: "standard",
    },
    garmentType: {
      type: String,
      required: true,
    },
    // Standard Measurements (in cm)
    measurements: {
      // Upper Body
      chest: Number,
      waist: Number,
      hips: Number,
      shoulder: Number,
      sleeveLength: Number,
      bicep: Number,
      wrist: Number,
      neck: Number,
      // Lower Body
      inseam: Number,
      outseam: Number,
      thigh: Number,
      knee: Number,
      ankle: Number,
      // Full Body
      fullLength: Number,
      backLength: Number,
      frontLength: Number,
      // Custom measurements
      custom: {
        type: Map,
        of: Number,
      },
    },
    // Size Recommendations
    recommendedSize: {
      type: String,
    },
    sizeAdjustments: {
      type: [
        {
          area: String,
          adjustment: String,
          reason: String,
        },
      ],
      default: [],
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    photos: {
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
measurementSchema.index({ customer: 1, tailor: 1 });
measurementSchema.index({ customer: 1, garmentType: 1 });

module.exports = mongoose.model("Measurement", measurementSchema);

