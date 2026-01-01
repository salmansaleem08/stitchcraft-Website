const User = require("../models/User");
const Review = require("../models/Review");

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

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
      minBudget,
      maxBudget,
      language,
      urgency,
      latitude,
      longitude,
      maxDistance, // in km
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

    if (language) {
      filter.languages = { $in: language.split(",") };
    }

    if (urgency === "true" || urgency === true) {
      filter["urgencyHandling.rushOrders"] = true;
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { shopName: new RegExp(search, "i") },
        { bio: new RegExp(search, "i") },
      ];
    }

    // Budget filtering - need to check pricing tiers
    // This will be handled after fetching tailors since pricing is in a separate model

    // Location-based filtering
    let locationFilter = null;
    if (latitude && longitude && maxDistance) {
      locationFilter = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        maxDistance: parseFloat(maxDistance),
      };
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
      case "urgency":
        // Sort by minimum days (lower = faster)
        sort = { "urgencyHandling.minimumDays": 1, averageResponseTime: 1 };
        break;
      case "distance":
        // Will be sorted after distance calculation
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    let tailors = await User.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit) * 2); // Fetch more to filter by budget/distance

    // Apply location-based filtering if needed
    if (locationFilter) {
      tailors = tailors
        .map((tailor) => {
          if (tailor.location?.coordinates?.latitude && tailor.location?.coordinates?.longitude) {
            const distance = calculateDistance(
              locationFilter.latitude,
              locationFilter.longitude,
              tailor.location.coordinates.latitude,
              tailor.location.coordinates.longitude
            );
            tailor._doc.distance = distance;
            return tailor;
          }
          return null;
        })
        .filter((tailor) => tailor && tailor._doc.distance <= locationFilter.maxDistance)
        .sort((a, b) => a._doc.distance - b._doc.distance);
    }

    // Apply budget filtering if needed
    if (minBudget || maxBudget) {
      const PricingTier = require("../models/PricingTier");
      const filteredTailors = [];

      for (const tailor of tailors) {
        const pricingTiers = await PricingTier.find({ tailor: tailor._id });
        if (pricingTiers.length > 0) {
          const minPrice = Math.min(...pricingTiers.map((tier) => tier.basePrice));
          const maxPrice = Math.max(...pricingTiers.map((tier) => tier.basePrice));

          if (minBudget && maxPrice < parseFloat(minBudget)) continue;
          if (maxBudget && minPrice > parseFloat(maxBudget)) continue;

          tailor._doc.priceRange = { min: minPrice, max: maxPrice };
        }
        filteredTailors.push(tailor);
      }

      tailors = filteredTailors;
    }

    // Limit to requested page size
    tailors = tailors.slice(0, parseInt(limit));

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

    const { title, description, category, imageUrl, beforeImageUrl, afterImageUrl } = req.body;

    // Handle file uploads - prioritize uploaded files over URLs
    let mainImageUrl = imageUrl || "";
    let beforeImg = beforeImageUrl || "";
    let afterImg = afterImageUrl || "";

    if (req.files) {
      if (req.files.mainImage && req.files.mainImage[0]) {
        mainImageUrl = `/uploads/images/${req.files.mainImage[0].filename}`;
      }
      if (req.files.beforeImage && req.files.beforeImage[0]) {
        beforeImg = `/uploads/images/${req.files.beforeImage[0].filename}`;
      }
      if (req.files.afterImage && req.files.afterImage[0]) {
        afterImg = `/uploads/images/${req.files.afterImage[0].filename}`;
      }
    }

    // Use main image as fallback if afterImage is not provided
    if (!afterImg && mainImageUrl) {
      afterImg = mainImageUrl;
    }

    if (!mainImageUrl && !afterImg) {
      return res.status(400).json({ message: "Please provide an image (upload or URL)" });
    }

    const portfolioItem = {
      imageUrl: mainImageUrl || afterImg,
      title: title || "",
      description: description || "",
      category: category || "",
      beforeImage: beforeImg,
      afterImage: afterImg || mainImageUrl,
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

    const Order = require("../models/Order");
    const reviews = await Review.find({ tailor: req.user._id });

    // Get all orders for this tailor
    const orders = await Order.find({ tailor: req.user._id });

    // Calculate revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const completedRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const pendingRevenue = orders
      .filter((o) => o.status !== "completed" && o.status !== "cancelled")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Order status breakdown
    const ordersByStatus = {
      pending: orders.filter((o) => o.status === "pending").length,
      consultation_scheduled: orders.filter((o) => o.status === "consultation_scheduled").length,
      consultation_completed: orders.filter((o) => o.status === "consultation_completed").length,
      fabric_selected: orders.filter((o) => o.status === "fabric_selected").length,
      in_progress: orders.filter((o) => o.status === "in_progress").length,
      revision_requested: orders.filter((o) => o.status === "revision_requested").length,
      quality_check: orders.filter((o) => o.status === "quality_check").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };

    // Recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentOrders = orders.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo).length;

    // Average order value
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Calculate average response time from messages
    let avgResponseTime = tailor.averageResponseTime || 0;
    if (orders.length > 0) {
      const allMessages = orders.flatMap((o) => o.messages || []);
      if (allMessages.length > 1) {
        // Calculate time between customer message and tailor response
        const responseTimes = [];
        for (let i = 0; i < allMessages.length - 1; i++) {
          const currentMsg = allMessages[i];
          const nextMsg = allMessages[i + 1];
          if (
            currentMsg.sender.toString() !== req.user._id.toString() &&
            nextMsg.sender.toString() === req.user._id.toString()
          ) {
            const timeDiff = new Date(nextMsg.sentAt) - new Date(currentMsg.sentAt);
            responseTimes.push(timeDiff / (1000 * 60 * 60)); // Convert to hours
          }
        }
        if (responseTimes.length > 0) {
          avgResponseTime =
            responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        }
      }
    }

    const stats = {
      totalOrders: tailor.totalOrders || orders.length,
      completedOrders: tailor.completedOrders || ordersByStatus.completed,
      pendingOrders: ordersByStatus.pending + ordersByStatus.in_progress + ordersByStatus.revision_requested,
      rating: tailor.rating || 0,
      totalReviews: tailor.totalReviews || reviews.length,
      averageResponseTime: avgResponseTime,
      completionRate: tailor.completionRate || 0,
      portfolioItems: tailor.portfolio?.length || 0,
      badges: tailor.badges?.length || 0,
      totalRevenue: totalRevenue,
      completedRevenue: completedRevenue,
      pendingRevenue: pendingRevenue,
      averageOrderValue: averageOrderValue,
      recentOrders: recentOrders,
      ordersByStatus: ordersByStatus,
      totalCustomers: new Set(orders.map((o) => o.customer.toString())).size,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

