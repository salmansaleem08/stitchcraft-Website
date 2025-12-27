const mongoose = require("mongoose");

const bulkOrderSchema = mongoose.Schema(
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
    items: {
      type: [
        {
          fabric: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fabric",
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
            min: 1,
          },
          unit: {
            type: String,
            enum: ["meter", "yard"],
            default: "meter",
          },
          pricePerUnit: {
            type: Number,
            required: true,
            min: 0,
          },
          discount: {
            type: Number,
            default: 0,
            min: 0,
          },
          subtotal: {
            type: Number,
            required: true,
            min: 0,
          },
        },
      ],
      required: true,
      validate: {
        validator: function (items) {
          return items.length > 0;
        },
        message: "Order must have at least one item",
      },
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
      enum: ["pending", "approved", "processing", "shipped", "on_way", "delivered", "cancelled"],
      default: "pending",
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    bulkDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },
    bulkDiscountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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
      maxlength: 1000,
    },
    distributionCenter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User.distributionCenters",
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
bulkOrderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    try {
      const count = await this.constructor.countDocuments();
      this.orderNumber = `BLK-${Date.now()}-${(count + 1).toString().padStart(4, "0")}`;
    } catch (error) {
      this.orderNumber = `BLK-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
    }
  }
  next();
});

// Add to timeline when status changes
bulkOrderSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      note: `Bulk order status changed to ${this.status}`,
    });
  }
  next();
});

module.exports = mongoose.model("BulkOrder", bulkOrderSchema);

