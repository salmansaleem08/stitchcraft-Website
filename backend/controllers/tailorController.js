const User = require("../models/User");
const Review = require("../models/Review");

// @desc    Get all tailors with filters
// @route   GET /api/tailors
// @access  Public
exports.getTailors = async (req, res) => {
  try {
    const {
      specialization,
      fabricExpertise,
      city,
      province,
      minRating,
      minExperience,
      search,
      sortBy,
      page = 1,
      limit = 12,
    } = req.query;

    // Build filter object
    const filter = { role: "tailor", isActive: true };

    if (specialization) {
      filter.specialization = { $in: specialization.split(",") };
    }

    if (fabricExpertise) {
      filter.fabricExpertise = { $in: fabricExpertise.split(",") };
    }

    if (city) {
      filter["address.city"] = new RegExp(city, "i");
    }

    if (province) {
      filter["address.province"] = new RegExp(province, "i");
    }

    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }

    if (minExperience) {
      filter.experience = { $gte: parseInt(minExperience) };
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { shopName: new RegExp(search, "i") },
        { bio: new RegExp(search, "i") },
      ];
    }

    // Build sort object
    let sort = {};
    switch (sortBy) {
      case "rating":
        sort = { rating: -1, totalReviews: -1 };
        break;
      case "experience":
        sort = { experience: -1 };
        break;
      case "orders":
        sort = { totalOrders: -1 };
        break;
      case "response":
        sort = { averageResponseTime: 1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tailors = await User.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: tailors.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: tailors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single tailor profile
// @route   GET /api/tailors/:id
// @access  Public
exports.getTailor = async (req, res) => {
  try {
    const tailor = await User.findById(req.params.id).select("-password");

    if (!tailor || tailor.role !== "tailor") {
      return res.status(404).json({ message: "Tailor not found" });
    }

    // Get reviews for this tailor
    const reviews = await Review.find({ tailor: req.params.id })
      .populate("customer", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        tailor,
        recentReviews: reviews,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update tailor profile
// @route   PUT /api/tailors/profile
// @access  Private (Tailor only)
exports.updateTailorProfile = async (req, res) => {
  try {
    const tailor = await User.findById(req.user._id);

    if (!tailor || tailor.role !== "tailor") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const {
      name,
      phone,
      address,
      specialization,
      fabricExpertise,
      experience,
      bio,
      shopName,
      workingHours,
    } = req.body;

    if (name) tailor.name = name;
    if (phone) tailor.phone = phone;
    if (address) tailor.address = { ...tailor.address, ...address };
    if (specialization) tailor.specialization = specialization;
    if (fabricExpertise) tailor.fabricExpertise = fabricExpertise;
    if (experience !== undefined) tailor.experience = experience;
    if (bio) tailor.bio = bio;
    if (shopName) tailor.shopName = shopName;
    if (workingHours) tailor.workingHours = { ...tailor.workingHours, ...workingHours };

    const updatedTailor = await tailor.save();

    res.json({
      success: true,
      data: updatedTailor,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add portfolio item
// @route   POST /api/tailors/portfolio
// @access  Private (Tailor only)
exports.addPortfolioItem = async (req, res) => {
  try {
    const tailor = await User.findById(req.user._id);

    if (!tailor || tailor.role !== "tailor") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { imageUrl, title, description, category, beforeImage, afterImage } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Please provide an image URL" });
    }

    const portfolioItem = {
      imageUrl,
      title: title || "",
      description: description || "",
      category: category || "",
      beforeImage: beforeImage || "",
      afterImage: afterImage || imageUrl,
    };

    tailor.portfolio.push(portfolioItem);
    await tailor.save();

    res.json({
      success: true,
      data: portfolioItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete portfolio item
// @route   DELETE /api/tailors/portfolio/:itemId
// @access  Private (Tailor only)
exports.deletePortfolioItem = async (req, res) => {
  try {
    const tailor = await User.findById(req.user._id);

    if (!tailor || tailor.role !== "tailor") {
      return res.status(403).json({ message: "Not authorized" });
    }

    tailor.portfolio = tailor.portfolio.filter(
      (item) => item._id.toString() !== req.params.itemId
    );

    await tailor.save();

    res.json({
      success: true,
      message: "Portfolio item deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tailor statistics
// @route   GET /api/tailors/stats
// @access  Private (Tailor only)
exports.getTailorStats = async (req, res) => {
  try {
    const tailor = await User.findById(req.user._id);

    if (!tailor || tailor.role !== "tailor") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const reviews = await Review.find({ tailor: req.user._id });

    const stats = {
      totalOrders: tailor.totalOrders,
      completedOrders: tailor.completedOrders,
      pendingOrders: tailor.totalOrders - tailor.completedOrders,
      rating: tailor.rating,
      totalReviews: tailor.totalReviews,
      averageResponseTime: tailor.averageResponseTime,
      completionRate: tailor.completionRate,
      portfolioItems: tailor.portfolio.length,
      badges: tailor.badges.length,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

