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
    consultationType: {
      type: String,
      enum: ["in_person", "video", "phone"],
      default: "in_person",
    },
    consultationLink: {
      type: String, // Video call link (Zoom, Google Meet, etc.)
    },
    consultationStatus: {
      type: String,
      enum: ["pending", "scheduled", "completed", "cancelled", "rescheduled"],
      default: "pending",
    },
    consultationDuration: {
      type: Number, // in minutes
      default: 30,
    },
    consultationRequestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    consultationRequestedAt: {
      type: Date,
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
            enum: ["pending", "approved", "rejected", "in_progress", "completed", "customer_approved", "customer_rejected"],
            default: "pending",
          },
          requestedAt: {
            type: Date,
            default: Date.now,
          },
          approvedAt: Date,
          approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          rejectedAt: Date,
          rejectedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          rejectionReason: String,
          completedAt: Date,
          customerApprovedAt: Date,
          customerRejectedAt: Date,
          customerRejectionReason: String,
          images: [String], // Before/after images
          notes: String, // Tailor's notes during revision
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
          attachments: {
            type: [
              {
                type: {
                  type: String,
                  enum: ["image", "document", "video", "audio", "other"],
                  default: "image",
                },
                url: String,
                name: String,
                size: Number, // in bytes
              },
            ],
            default: [],
          },
          read: {
            type: Boolean,
            default: false,
          },
          readAt: Date,
          sentAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    // Payment Schedule
    paymentSchedule: {
      type: [
        {
          milestone: {
            type: String,
            enum: ["deposit", "fabric_payment", "progress_payment", "final_payment", "delivery_payment"],
            required: true,
          },
          amount: {
            type: Number,
            required: true,
            min: 0,
          },
          dueDate: Date,
          paid: {
            type: Boolean,
            default: false,
          },
          paidAt: Date,
          paymentMethod: String,
          transactionId: String,
        },
      ],
      default: [],
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Delivery Coordination
    deliveryAddress: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: {
        type: String,
        default: "Pakistan",
      },
      phone: String,
      specialInstructions: String,
    },
    deliveryMethod: {
      type: String,
      enum: ["pickup", "home_delivery", "courier"],
      default: "pickup",
    },
    deliveryTrackingNumber: String,
    deliveryProvider: String,
    estimatedDeliveryDate: Date,
    // Dispute Resolution
    disputes: {
      type: [
        {
          raisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          reason: {
            type: String,
            enum: ["quality_issue", "delivery_delay", "wrong_item", "damage", "other"],
            required: true,
          },
          description: {
            type: String,
            required: true,
            maxlength: 2000,
          },
          status: {
            type: String,
            enum: ["open", "under_review", "resolved", "rejected"],
            default: "open",
          },
          resolution: String,
          resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          resolvedAt: Date,
          createdAt: {
            type: Date,
            default: Date.now,
          },
          attachments: [String],
        },
      ],
      default: [],
    },
    // Alteration Requests
    alterationRequests: {
      type: [
        {
          requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          description: {
            type: String,
            required: true,
            maxlength: 1000,
          },
          urgency: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium",
          },
          status: {
            type: String,
            enum: ["pending", "approved", "in_progress", "completed", "rejected"],
            default: "pending",
          },
          estimatedCost: Number,
          estimatedTime: Number, // in days
          completedAt: Date,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    // Refund & Return
    refundRequests: {
      type: [
        {
          requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          reason: {
            type: String,
            enum: ["defective", "wrong_item", "not_as_described", "customer_change_mind", "other"],
            required: true,
          },
          description: {
            type: String,
            required: true,
            maxlength: 1000,
          },
          requestedAmount: Number,
          status: {
            type: String,
            enum: ["pending", "approved", "rejected", "processed"],
            default: "pending",
          },
          processedAt: Date,
          transactionId: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    // Emergency Contact
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
      availableHours: String,
    },
    // Tracking
    timeline: {
      type: [
        {
          status: String,
          description: String,
          milestone: {
            type: String,
            enum: ["order_placed", "consultation", "fabric_selected", "production_started", "quality_check", "ready_for_delivery", "delivered", "completed"],
          },
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

