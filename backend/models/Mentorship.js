const mongoose = require("mongoose");

const mentorshipSchema = new mongoose.Schema(
  {
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    programType: {
      type: String,
      enum: ["one_on_one", "group", "master_class"],
      default: "one_on_one",
    },
    status: {
      type: String,
      enum: ["pending", "active", "completed", "cancelled"],
      default: "pending",
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    sessions: [
      {
        title: String,
        scheduledDate: Date,
        duration: Number, // in minutes
        status: {
          type: String,
          enum: ["scheduled", "completed", "cancelled", "rescheduled"],
          default: "scheduled",
        },
        notes: String,
        feedback: {
          fromMentee: String,
          fromMentor: String,
        },
      },
    ],
    goals: [String],
    achievements: [String],
    rating: {
      fromMentee: {
        rating: Number,
        review: String,
        createdAt: Date,
      },
      fromMentor: {
        rating: Number,
        review: String,
        createdAt: Date,
      },
    },
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        message: {
          type: String,
          required: true,
        },
        attachments: [
          {
            url: String,
            filename: String,
            fileType: String,
          },
        ],
        read: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Mentorship", mentorshipSchema);

