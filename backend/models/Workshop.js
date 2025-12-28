const mongoose = require("mongoose");

const workshopSchema = new mongoose.Schema(
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
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: [
        "skill_sharing",
        "technique_demo",
        "business_training",
        "networking",
        "master_class",
      ],
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["online", "in_person"],
        required: true,
      },
      address: String,
      city: String,
      province: String,
      onlineLink: String,
    },
    maxParticipants: {
      type: Number,
      required: true,
    },
    registeredUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        registeredAt: {
          type: Date,
          default: Date.now,
        },
        attendanceStatus: {
          type: String,
          enum: ["registered", "attended", "absent"],
          default: "registered",
        },
      },
    ],
    price: {
      type: Number,
      default: 0,
    },
    isFree: {
      type: Boolean,
      default: false,
    },
    thumbnail: {
      type: String,
    },
    materials: [
      {
        title: String,
        url: String,
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    tags: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Workshop", workshopSchema);

