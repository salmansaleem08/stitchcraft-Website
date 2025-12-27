const mongoose = require("mongoose");

const cartItemSchema = mongoose.Schema({
  productType: {
    type: String,
    enum: ["fabric", "supply"],
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  unit: {
    type: String,
    required: true,
  },
});

const cartSchema = mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
cartSchema.index({ customer: 1 });

module.exports = mongoose.model("Cart", cartSchema);

