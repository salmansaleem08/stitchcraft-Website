const mongoose = require("mongoose");

const sampleOrderSchema = mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
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
    fabric: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Fabric",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
      max: 5, // Limit sample orders to 5 meters/yards
    },
    unit: {
      type: String,
      enum: ["meter", "yard"],
      default: "meter",
    },
    shippingAddress: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: { type: String, default: "Pakistan" },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCost: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    shippedAt: {
      type: Date,
    },
    deliveredAt: {
      type: Date,
    },
    trackingNumber: {
      type: String,
      trim: true,
    },
    timeline: {
      type: [
        {
          status: String,
          description: String,
          updatedAt: { type: Date, default: Date.now },
          updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
sampleOrderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    try {
      const count = await this.constructor.countDocuments();
      this.orderNumber = `SMP-${Date.now()}-${(count + 1).toString().padStart(4, "0")}`;
    } catch (error) {
      this.orderNumber = `SMP-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
    }
  }
  next();
});

// Add to timeline when status changes
sampleOrderSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isNew) {
    this.timeline.push({
      status: this.status,
      description: `Sample order status changed to ${this.status}`,
      updatedBy: this.supplier,
    });
  }
  next();
});

module.exports = mongoose.model("SampleOrder", sampleOrderSchema);

