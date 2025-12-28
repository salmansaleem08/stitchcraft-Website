const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
      ],
      required: true,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    thumbnail: {
      type: String,
    },
    videoUrl: {
      type: String,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    content: [
      {
        sectionTitle: String,
        sectionOrder: Number,
        lessons: [
          {
            lessonTitle: String,
            lessonOrder: Number,
            videoUrl: String,
            duration: Number,
            description: String,
            resources: [
              {
                title: String,
                url: String,
                type: String, // pdf, image, link, etc.
              },
            ],
          },
        ],
      },
    ],
    tags: [String],
    enrolledUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        enrolledAt: {
          type: Date,
          default: Date.now,
        },
        progress: {
          type: Number,
          default: 0, // percentage
        },
        completedLessons: [
          {
            type: mongoose.Schema.Types.ObjectId,
          },
        ],
        certificateIssued: {
          type: Boolean,
          default: false,
        },
      },
    ],
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        review: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate average rating before saving
courseSchema.pre("save", function (next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
    this.averageRating = sum / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
  next();
});

module.exports = mongoose.model("Course", courseSchema);

