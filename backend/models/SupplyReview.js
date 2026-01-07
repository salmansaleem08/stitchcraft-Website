const mongoose = require("mongoose");

const supplyReviewSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    supply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supply",
      required: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupplyOrder",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      maxlength: 1000,
    },
    quality: {
      type: Number,
      min: 1,
      max: 5,
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5,
    },
    delivery: {
      type: Number,
      min: 1,
      max: 5,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpful: {
      type: Number,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
supplyReviewSchema.index({ supply: 1, createdAt: -1 });
supplyReviewSchema.index({ supplier: 1, createdAt: -1 });
supplyReviewSchema.index({ customer: 1 });
supplyReviewSchema.index({ order: 1 });

// Prevent duplicate reviews for the same supply
supplyReviewSchema.index({ customer: 1, supply: 1 }, { unique: true });

// Pre-save middleware to mark as verified if order exists
supplyReviewSchema.pre("save", async function (next) {
  if (this.order && !this.isVerified) {
    const SupplyOrder = require("./SupplyOrder");
    const order = await SupplyOrder.findById(this.order);
    if (order && order.status === "delivered") {
      this.isVerified = true;
    }
  }
  next();
});

// Post-save middleware to update supply rating
supplyReviewSchema.post("save", async function () {
  const Supply = require("./Supply");
  const SupplyReview = mongoose.model("SupplyReview");
  const reviews = await SupplyReview.find({ supply: this.supply });
  
  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Supply.findByIdAndUpdate(this.supply, {
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });
  }
});

// Post-remove middleware to update supply rating
supplyReviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const Supply = require("./Supply");
    const SupplyReview = mongoose.model("SupplyReview");
    const reviews = await SupplyReview.find({ supply: doc.supply });
    
    if (reviews.length > 0) {
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      await Supply.findByIdAndUpdate(doc.supply, {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: reviews.length,
      });
    } else {
      await Supply.findByIdAndUpdate(doc.supply, {
        rating: 0,
        totalReviews: 0,
      });
    }
  }
});

module.exports = mongoose.model("SupplyReview", supplyReviewSchema);

