const mongoose = require("mongoose");

const moodBoardSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
    items: {
      type: [
        {
          type: {
            type: String,
            enum: ["image", "fabric", "pattern", "note", "color"],
            required: true,
          },
          content: {
            // For images
            imageUrl: String,
            // For fabric swatches
            fabricId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Fabric",
            },
            // For patterns
            patternId: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "Pattern",
            },
            // For notes
            text: String,
            // For colors
            colorCode: String,
            colorName: String,
          },
          position: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
          },
          size: {
            width: { type: Number, default: 200 },
            height: { type: Number, default: 200 },
          },
          notes: String,
          tags: [String],
        },
      ],
      default: [],
    },
    isShared: {
      type: Boolean,
      default: false,
    },
    sharedWith: {
      type: [
        {
          user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
          },
          role: {
            type: String,
            enum: ["viewer", "editor"],
            default: "viewer",
          },
        },
      ],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup
moodBoardSchema.index({ createdBy: 1, createdAt: -1 });
moodBoardSchema.index({ order: 1 });

module.exports = mongoose.model("MoodBoard", moodBoardSchema);

