const mongoose = require("mongoose");

const designAnnotationSchema = mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    annotations: {
      type: [
        {
          type: {
            type: String,
            enum: ["text", "arrow", "circle", "rectangle", "line", "highlight"],
            required: true,
          },
          content: {
            text: String,
            color: { type: String, default: "#000000" },
            fontSize: { type: Number, default: 14 },
            strokeWidth: { type: Number, default: 2 },
          },
          position: {
            x: { type: Number, required: true },
            y: { type: Number, required: true },
          },
          size: {
            width: { type: Number, default: 0 },
            height: { type: Number, default: 0 },
          },
          points: {
            type: [
              {
                x: Number,
                y: Number,
              },
            ],
            default: [],
          },
          createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup
designAnnotationSchema.index({ order: 1 });

module.exports = mongoose.model("DesignAnnotation", designAnnotationSchema);

