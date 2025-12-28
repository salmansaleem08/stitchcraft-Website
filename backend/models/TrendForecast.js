const mongoose = require("mongoose");

const trendForecastSchema = mongoose.Schema(
  {
    season: {
      type: String,
      enum: ["Spring", "Summer", "Fall", "Winter", "All Season"],
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["Colors", "Patterns", "Fabrics", "Styles", "Accessories", "Cultural", "General"],
      required: true,
    },
    trendName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 2000,
    },
    popularityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50,
    },
    culturalRelevance: {
      pakistani: { type: Number, min: 0, max: 100, default: 50 },
      western: { type: Number, min: 0, max: 100, default: 50 },
      fusion: { type: Number, min: 0, max: 100, default: 50 },
    },
    targetAudience: {
      type: [String],
      enum: ["Men", "Women", "Unisex", "Children", "Elderly"],
      default: ["Unisex"],
    },
    bodyTypeCompatibility: {
      type: [String],
      enum: ["Hourglass", "Pear", "Apple", "Rectangle", "Inverted Triangle", "Petite", "Tall", "Plus Size", "All"],
      default: ["All"],
    },
    occasionCompatibility: {
      type: [String],
      enum: ["Casual", "Formal", "Wedding", "Party", "Office", "Traditional", "Festive", "Everyday"],
      default: ["Everyday"],
    },
    fabricCompatibility: [String],
    colorPalette: [String],
    images: [String],
    source: {
      type: String,
      enum: ["Fashion Week", "Social Media", "Industry Report", "Cultural Event", "Designer Collection", "User Data"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

trendForecastSchema.index({ season: 1, year: 1, category: 1 });
trendForecastSchema.index({ popularityScore: -1 });
trendForecastSchema.index({ isActive: 1 });

module.exports = mongoose.model("TrendForecast", trendForecastSchema);

