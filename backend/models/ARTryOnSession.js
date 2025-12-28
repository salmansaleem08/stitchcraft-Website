const mongoose = require("mongoose");

const arTryOnSessionSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionName: {
      type: String,
      trim: true,
    },
    bodyScanData: {
      // Scanned measurements from AR/camera
      height: Number, // in cm
      weight: Number, // in kg
      bust: Number,
      waist: Number,
      hips: Number,
      shoulder: Number,
      armLength: Number,
      legLength: Number,
      neck: Number,
      chest: Number,
      scanImage: String, // URL to scanned body image
      scanMethod: {
        type: String,
        enum: ["camera", "manual", "upload"],
        default: "manual",
      },
      scanDate: {
        type: Date,
        default: Date.now,
      },
    },
    selectedGarment: {
      garmentType: {
        type: String,
        enum: ["Shalwar Kameez", "Lehenga", "Sherwani", "Suit", "Dress", "Kurta", "Waistcoat", "Other"],
      },
      pattern: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pattern",
      },
      fabric: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Fabric",
      },
      customDesign: {
        colors: [String],
        patterns: [String],
        style: String,
      },
    },
    tryOnVisualization: {
      // AR/3D visualization data
      fabricDraping: {
        enabled: Boolean,
        simulationData: String, // JSON string of draping parameters
        previewImage: String, // URL to generated preview
      },
      colorVisualization: {
        baseColor: String,
        accentColors: [String],
        colorMap: String, // JSON string mapping areas to colors
      },
      patternFitting: {
        patternScale: Number, // 0-1 scale factor
        patternPosition: {
          x: Number,
          y: Number,
        },
        fitScore: Number, // 0-100
      },
      fitAdjustments: [
        {
          area: String, // e.g., "waist", "shoulder", "length"
          currentMeasurement: Number,
          suggestedMeasurement: Number,
          adjustment: Number, // difference
          reason: String,
          priority: {
            type: String,
            enum: ["Low", "Medium", "High"],
            default: "Medium",
          },
        },
      ],
      previewImages: [String], // URLs to generated preview images
      videoUrl: String, // URL to 360-degree preview video
    },
    comparison: {
      // Compare different options
      options: [
        {
          fabricId: mongoose.Schema.Types.ObjectId,
          color: String,
          pattern: String,
          previewImage: String,
          fitScore: Number,
        },
      ],
      selectedOption: Number, // index of selected option
    },
    status: {
      type: String,
      enum: ["scanning", "visualizing", "adjusting", "completed", "saved"],
      default: "scanning",
    },
    saved: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
  }
);

arTryOnSessionSchema.index({ user: 1, createdAt: -1 });
arTryOnSessionSchema.index({ status: 1 });

module.exports = mongoose.model("ARTryOnSession", arTryOnSessionSchema);

