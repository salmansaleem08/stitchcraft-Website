const mongoose = require("mongoose");

const supplyOrderSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        supply: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Supply",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        unit: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        subtotal: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      province: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, default: "Pakistan" },
      phone: { type: String, required: true },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    trackingNumber: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    timeline: [
      {
        status: {
          type: String,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
supplyOrderSchema.index({ customer: 1, createdAt: -1 });
supplyOrderSchema.index({ supplier: 1, createdAt: -1 });
supplyOrderSchema.index({ status: 1 });

// Pre-save middleware to add initial timeline entry
supplyOrderSchema.pre("save", function (next) {
  if (this.isNew && this.timeline.length === 0) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: "Order placed",
    });
  }
  next();
});

module.exports = mongoose.model("SupplyOrder", supplyOrderSchema);

