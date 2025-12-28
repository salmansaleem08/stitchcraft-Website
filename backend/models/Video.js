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
    videoType: {
      type: String,
      enum: ["youtube", "local"],
      default: "youtube",
    },
    youtubeUrl: {
      type: String,
      trim: true,
    },
    youtubeId: {
      type: String,
    },
    localVideoUrl: {
      type: String,
      trim: true,
    },
    localVideoFilename: {
      type: String,
    },
    fileSize: {
      type: Number, // in bytes
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

// Extract YouTube ID from URL before saving (only for YouTube videos)
videoSchema.pre("save", function (next) {
  if (this.videoType === "youtube" && this.youtubeUrl && !this.youtubeId) {
    const youtubeIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = this.youtubeUrl.match(youtubeIdRegex);
    if (match && match[1]) {
      this.youtubeId = match[1];
      if (!this.thumbnail) {
        this.thumbnail = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
      }
    }
  }
  // For local videos, generate thumbnail if not provided
  if (this.videoType === "local" && this.localVideoUrl && !this.thumbnail) {
    // Use a default video thumbnail or generate one
    this.thumbnail = "/uploads/videos/default-thumbnail.jpg";
  }
  next();
});

module.exports = mongoose.model("Video", videoSchema);

