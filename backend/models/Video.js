const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    youtubeUrl: {
      type: String,
      required: true,
      trim: true,
    },
    youtubeId: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "video_tutorial",
        "traditional_technique",
        "modern_fashion",
        "business_management",
        "certification",
        "forum",
        "workshop",
        "news",
        "mentorship",
      ],
      required: true,
    },
    thumbnail: {
      type: String,
    },
    duration: {
      type: String,
    },
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Extract YouTube ID from URL before saving
videoSchema.pre("save", function (next) {
  if (this.youtubeUrl && !this.youtubeId) {
    const youtubeIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = this.youtubeUrl.match(youtubeIdRegex);
    if (match && match[1]) {
      this.youtubeId = match[1];
      if (!this.thumbnail) {
        this.thumbnail = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
      }
    }
  }
  next();
});

module.exports = mongoose.model("Video", videoSchema);

