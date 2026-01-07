const mongoose = require("mongoose");

const equipmentPurchaseSchema = mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: true,
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String },
      postalCode: { type: String },
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "card", "financing"],
      default: "cash",
    },
    financingDetails: {
      enabled: { type: Boolean, default: false },
      downPayment: { type: Number },
      monthlyPayment: { type: Number },
      tenureMonths: { type: Number },
      interestRate: { type: Number },
    },
    status: {
      type: String,
      enum: ["pending", "payment_pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    conditionAtPurchase: {
      type: String,
      enum: ["New", "Like New", "Good", "Fair", "Poor"],
    },
    notes: {
      type: String,
    },
    timeline: [
      {
        status: {
          type: String,
          enum: ["pending", "payment_pending", "confirmed", "shipped", "delivered", "cancelled"],
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
equipmentPurchaseSchema.index({ buyer: 1, createdAt: -1 });
equipmentPurchaseSchema.index({ seller: 1, createdAt: -1 });
equipmentPurchaseSchema.index({ equipment: 1 });
equipmentPurchaseSchema.index({ status: 1 });

module.exports = mongoose.model("EquipmentPurchase", equipmentPurchaseSchema);