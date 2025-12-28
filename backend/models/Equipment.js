const mongoose = require("mongoose");

const equipmentSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Sewing Machine",
        "Embroidery Machine",
        "Cutting Machine",
        "Pressing Equipment",
        "Measuring Tools",
        "Mannequin",
        "Other",
      ],
    },
    brand: {
      type: String,
      trim: true,
    },
    model: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    specifications: {
      type: Map,
      of: String,
    },
    images: {
      type: [String],
      default: [],
    },
    condition: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair", "Needs Repair"],
      required: true,
    },
    yearOfManufacture: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },
    rentalPrice: {
      type: Number,
      min: 0,
    },
    rentalPeriod: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      default: "monthly",
    },
    isAvailableForRental: {
      type: Boolean,
      default: false,
    },
    isAvailableForSale: {
      type: Boolean,
      default: false,
    },
    salePrice: {
      type: Number,
      min: 0,
    },
    location: {
      city: String,
      province: String,
      address: String,
      coordinates: {
        latitude: Number,
        longitude: Number,
      },
    },
    maintenanceHistory: [
      {
        date: { type: Date, default: Date.now },
        serviceType: { type: String, enum: ["Routine", "Repair", "Upgrade", "Inspection"] },
        description: String,
        cost: Number,
        servicedBy: String,
        nextServiceDue: Date,
      },
    ],
    nextMaintenanceDue: {
      type: Date,
    },
    financingOptions: {
      available: { type: Boolean, default: false },
      downPayment: { type: Number, min: 0 },
      monthlyPayment: { type: Number, min: 0 },
      tenure: { type: Number, min: 1 }, // in months
      interestRate: { type: Number, min: 0, max: 100 },
      provider: String,
    },
    upgradeAdvisory: {
      recommendedUpgrades: [String],
      upgradeBenefits: String,
      estimatedCost: Number,
      priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRentals: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

equipmentSchema.index({ owner: 1, isActive: 1 });
equipmentSchema.index({ category: 1, isActive: 1 });
equipmentSchema.index({ isAvailableForRental: 1 });
equipmentSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Equipment", equipmentSchema);

