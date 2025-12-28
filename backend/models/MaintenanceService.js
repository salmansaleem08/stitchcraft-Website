const mongoose = require("mongoose");

const maintenanceServiceSchema = mongoose.Schema(
  {
    serviceProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
    },
    equipmentDetails: {
      name: String,
      category: String,
      brand: String,
      model: String,
      serialNumber: String,
    },
    serviceType: {
      type: String,
      enum: ["Routine Maintenance", "Repair", "Inspection", "Upgrade", "Installation", "Other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    scheduledDate: {
      type: Date,
      required: true,
    },
    scheduledTime: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["customer_location", "service_center", "other"],
        default: "customer_location",
      },
      address: {
        street: String,
        city: String,
        province: String,
        postalCode: String,
      },
    },
    estimatedCost: {
      type: Number,
      min: 0,
    },
    actualCost: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "scheduled", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    serviceNotes: {
      type: String,
      maxlength: 2000,
    },
    partsReplaced: [
      {
        name: String,
        cost: Number,
        quantity: Number,
      },
    ],
    warrantyPeriod: {
      type: Number,
      default: 0,
    },
    warrantyUnit: {
      type: String,
      enum: ["days", "weeks", "months"],
      default: "months",
    },
    nextServiceDue: {
      type: Date,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
    },
    review: {
      type: String,
      maxlength: 1000,
    },
    timeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

maintenanceServiceSchema.index({ serviceProvider: 1, status: 1 });
maintenanceServiceSchema.index({ customer: 1 });
maintenanceServiceSchema.index({ scheduledDate: 1 });

module.exports = mongoose.model("MaintenanceService", maintenanceServiceSchema);

