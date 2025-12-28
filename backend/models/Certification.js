const mongoose = require("mongoose");

const certificationSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    certificateNumber: {
      type: String,
      unique: true,
      required: true,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      unique: true,
    },
    pdfUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate certificate number before saving
certificationSchema.pre("save", async function (next) {
  if (!this.certificateNumber) {
    const count = await mongoose.model("Certification").countDocuments();
    this.certificateNumber = `STC-${Date.now()}-${count + 1}`;
  }
  if (!this.verificationCode) {
    this.verificationCode = `VER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model("Certification", certificationSchema);

