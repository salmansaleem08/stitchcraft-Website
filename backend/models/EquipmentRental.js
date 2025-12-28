const mongoose = require("mongoose");

const equipmentRentalSchema = mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    rentalPeriod: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    dailyRate: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    deposit: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "active", "completed", "cancelled", "returned"],
      default: "pending",
    },
    pickupAddress: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
    },
    returnAddress: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
    },
    conditionAtRental: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair", "Needs Repair"],
    },
    conditionAtReturn: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair", "Needs Repair", "Damaged"],
    },
    returnNotes: {
      type: String,
      maxlength: 1000,
    },
    damageCharges: {
      type: Number,
      default: 0,
      min: 0,
    },
    timeline: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "refunded"],
      default: "pending",
    },
    payments: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        method: String,
        transactionId: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

equipmentRentalSchema.index({ equipment: 1, status: 1 });
equipmentRentalSchema.index({ renter: 1 });
equipmentRentalSchema.index({ owner: 1 });

module.exports = mongoose.model("EquipmentRental", equipmentRentalSchema);

