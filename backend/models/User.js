const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      required: [true, "Please select a role"],
      enum: ["tailor", "customer", "supplier"],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: {
        type: String,
        default: "Pakistan",
      },
    },
    // Tailor-specific fields
    specialization: {
      type: [String],
      default: [],
      enum: [
        "Traditional Wear",
        "Western Wear",
        "Bridal Wear",
        "Embroidery",
        "Alterations",
        "Custom Design",
      ],
    },
    fabricExpertise: {
      type: [String],
      default: [],
      enum: ["Cotton", "Silk", "Linen", "Wool", "Synthetic", "Mixed"],
    },
    experience: {
      type: Number,
      default: 0,
    },
    portfolio: {
      type: [
        {
          imageUrl: String,
          title: String,
          description: String,
          category: String,
          beforeImage: String,
          afterImage: String,
          createdAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    completedOrders: {
      type: Number,
      default: 0,
    },
    averageResponseTime: {
      type: Number, // in hours
      default: 0,
    },
    completionRate: {
      type: Number, // percentage
      default: 0,
      min: 0,
      max: 100,
    },
    badges: {
      type: [
        {
          name: String,
          type: {
            type: String,
            enum: ["Master Tailor", "Speed Stitching", "Quality Expert", "Customer Favorite"],
          },
          earnedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
    },
    bio: {
      type: String,
      maxlength: 1000,
    },
    shopName: {
      type: String,
      trim: true,
    },
    workingHours: {
      type: {
        monday: { open: String, close: String, isOpen: Boolean },
        tuesday: { open: String, close: String, isOpen: Boolean },
        wednesday: { open: String, close: String, isOpen: Boolean },
        thursday: { open: String, close: String, isOpen: Boolean },
        friday: { open: String, close: String, isOpen: Boolean },
        saturday: { open: String, close: String, isOpen: Boolean },
        sunday: { open: String, close: String, isOpen: Boolean },
      },
    },
    // Supplier-specific fields
    businessName: {
      type: String,
      trim: true,
    },
    businessType: {
      type: String,
      enum: ["fabric", "supplies", "equipment", "mixed"],
    },
    // Common fields
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);

