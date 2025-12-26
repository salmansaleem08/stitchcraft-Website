const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
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
    tailor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "consultation_scheduled",
        "consultation_completed",
        "fabric_selected",
        "in_progress",
        "revision_requested",
        "quality_check",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },
    // Service Details
    serviceType: {
      type: String,
      enum: ["basic", "premium", "luxury", "bulk"],
      required: true,
    },
    garmentType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    // Measurements
    measurements: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Measurement",
    },
    // Design & Consultation
    consultationDate: {
      type: Date,
    },
    consultationNotes: {
      type: String,
      maxlength: 1000,
    },
    designReference: {
      type: [String], // Image URLs
      default: [],
    },
    // Fabric Selection
    fabricSelected: {
      type: Boolean,
      default: false,
    },
    fabricDetails: {
      fabricType: String,
      color: String,
      quantity: Number, // in meters
      supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
    // Pricing
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    basePrice: {
      type: Number,
      required: true,
    },
    fabricCost: {
      type: Number,
      default: 0,
    },
    additionalCharges: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    // Revisions
    revisions: {
      type: [
        {
          revisionNumber: Number,
          requestedBy: {
            type: String,
            enum: ["customer", "tailor"],
          },
          description: String,
          status: {
            type: String,
            enum: ["pending", "in_progress", "completed", "rejected"],
            default: "pending",
          },
          requestedAt: {
            type: Date,
            default: Date.now,
          },
          completedAt: Date,
        },
      ],
      default: [],
    },
    currentRevision: {
      type: Number,
      default: 0,
    },
    // Timeline
    estimatedCompletionDate: {
      type: Date,
    },
    actualCompletionDate: {
      type: Date,
    },
    deliveryDate: {
      type: Date,
    },
    // Quality Check
    qualityCheck: {
      passed: {
        type: Boolean,
        default: false,
      },
      checkedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      checkedAt: Date,
      notes: String,
    },
    // Communication
    messages: {
      type: [
        {
          sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          message: String,
          attachments: [String],
          sentAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    // Tracking
    timeline: {
      type: [
        {
          status: String,
          description: String,
          updatedAt: {
            type: Date,
            default: Date.now,
          },
          updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
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
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    try {
      const count = await this.constructor.countDocuments();
      this.orderNumber = `STC-${Date.now()}-${(count + 1).toString().padStart(4, "0")}`;
    } catch (error) {
      // Fallback if countDocuments fails
      this.orderNumber = `STC-${Date.now()}-${Math.floor(Math.random() * 10000).toString().padStart(4, "0")}`;
    }
  }
  next();
});

// Add to timeline when status changes
orderSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isNew) {
    this.timeline.push({
      status: this.status,
      description: `Order status changed to ${this.status}`,
      updatedBy: this.tailor,
    });
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);

