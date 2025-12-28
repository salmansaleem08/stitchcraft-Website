const mongoose = require("mongoose");

const styleRecommendationSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bodyType: {
      type: String,
      enum: ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle", "Petite", "Tall", "Plus Size"],
      required: true,
    },
    bodyMeasurements: {
      height: Number, // in cm
      weight: Number, // in kg
      bust: Number, // in cm
      waist: Number, // in cm
      hips: Number, // in cm
      shoulder: Number, // in cm
    },
    occasion: {
      type: String,
      enum: ["Casual", "Formal", "Wedding", "Party", "Office", "Traditional", "Festive", "Everyday"],
      required: true,
    },
    culturalContext: {
      type: String,
      enum: ["Pakistani", "Western", "Fusion", "International"],
      default: "Pakistani",
    },
    preferences: {
      colors: [String],
      patterns: [String],
      fabricTypes: [String],
      styles: [String],
      avoidColors: [String],
      avoidPatterns: [String],
    },
    recommendations: [
      {
        garmentType: {
          type: String,
          enum: ["Shalwar Kameez", "Lehenga", "Sherwani", "Suit", "Dress", "Kurta", "Waistcoat", "Other"],
        },
        fabricRecommendations: [
          {
            fabricType: String,
            color: String,
            pattern: String,
            reason: String,
          },
        ],
        stylingTips: [String],
        accessories: [String],
        culturalNotes: String,
        trendRelevance: {
          isTrending: Boolean,
          trendCategory: String,
          season: String,
        },
        compatibilityScore: {
          type: Number,
          min: 0,
          max: 100,
        },
      },
    ],
    analysisDate: {
      type: Date,
      default: Date.now,
    },
    saved: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

styleRecommendationSchema.index({ user: 1, occasion: 1 });
styleRecommendationSchema.index({ bodyType: 1, occasion: 1 });

module.exports = mongoose.model("StyleRecommendation", styleRecommendationSchema);

