const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      specialization,
      experience,
      businessName,
      businessType,
      businessDescription,
      businessRegistrationNumber,
      taxId,
      cnic,
      yearsInBusiness,
      productCategories,
    } = req.body;

    // Validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "Please provide name, email, password, and role",
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    if (!["tailor", "customer", "supplier"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Create user
    const userData = {
      name,
      email,
      password,
      role,
      phone,
      address,
    };

    if (role === "tailor") {
      userData.specialization = specialization || [];
      userData.experience = experience || 0;
    }

    if (role === "supplier") {
      userData.businessName = businessName;
      userData.businessType = businessType;
      userData.businessDescription = businessDescription;
      userData.businessRegistrationNumber = businessRegistrationNumber;
      userData.taxId = taxId;
      userData.cnic = cnic;
      userData.yearsInBusiness = yearsInBusiness || 0;
      userData.productCategories = productCategories || [];
      userData.verificationStatus = "pending";
    }

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: "Account is deactivated" });
    }

    // Check password
    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      isVerified: user.isVerified,
      avatar: user.avatar,
      createdAt: user.createdAt,
    };

    // Add role-specific fields
    if (user.role === "tailor") {
      userData.specialization = user.specialization;
      userData.experience = user.experience;
      userData.portfolio = user.portfolio;
      userData.rating = user.rating;
      userData.totalOrders = user.totalOrders;
      userData.shopName = user.shopName;
    }

    if (user.role === "supplier") {
      userData.businessName = user.businessName;
      userData.businessType = user.businessType;
      userData.verificationStatus = user.verificationStatus;
      userData.qualityRating = user.qualityRating;
    }

    res.json(userData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

