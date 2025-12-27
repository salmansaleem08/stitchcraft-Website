const Pattern = require("../models/Pattern");
const PatternPurchase = require("../models/PatternPurchase");
const PatternReview = require("../models/PatternReview");
const User = require("../models/User");

// @desc    Get all patterns with filters
// @route   GET /api/patterns
// @access  Public
exports.getPatterns = async (req, res) => {
  try {
    const {
      category,
      designType,
      difficulty,
      minPrice,
      maxPrice,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 12,
      designer,
      featured,
    } = req.query;

    const query = { isPublished: true, isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Design type filter
    if (designType) {
      query.designType = designType;
    }

    // Difficulty filter
    if (difficulty) {
      query.difficulty = difficulty;
    }

    // Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Designer filter
    if (designer) {
      query.designer = designer;
    }

    // Featured filter
    if (featured === "true") {
      query.featured = true;
    }

    // Sort
    const sortOptions = {};
    if (sortBy === "price") {
      sortOptions.price = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "rating") {
      sortOptions["stats.rating"] = sortOrder === "asc" ? 1 : -1;
    } else if (sortBy === "popularity") {
      sortOptions["stats.downloads"] = sortOrder === "asc" ? 1 : -1;
    } else {
      sortOptions.createdAt = sortOrder === "asc" ? 1 : -1;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const patterns = await Pattern.find(query)
      .populate("designer", "name email avatar")
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Pattern.countDocuments(query);

    res.json({
      success: true,
      data: patterns,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single pattern
// @route   GET /api/patterns/:id
// @access  Public
exports.getPattern = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id)
      .populate("designer", "name email avatar businessName")
      .populate("collaboration.collaborators.user", "name email avatar")
      .populate("collaboration.requests.user", "name email avatar");

    if (!pattern) {
      return res.status(404).json({ message: "Pattern not found" });
    }

    // Increment views
    pattern.stats.views += 1;
    await pattern.save();

    // Check if user has purchased this pattern
    let hasPurchased = false;
    let purchase = null;
    if (req.user) {
      purchase = await PatternPurchase.findOne({
        pattern: pattern._id,
        buyer: req.user._id,
        paymentStatus: "completed",
      });
      hasPurchased = !!purchase;
    }

    // Get reviews
    const reviews = await PatternReview.find({ pattern: pattern._id })
      .populate("user", "name avatar")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        pattern,
        hasPurchased,
        purchase,
        reviews,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create pattern
// @route   POST /api/patterns
// @access  Private (Designer/Tailor)
exports.createPattern = async (req, res) => {
  try {
    // Handle file URLs from uploads
    const patternData = {
      ...req.body,
      designer: req.user._id,
    };

    // Parse JSON fields if they're strings
    if (typeof patternData.measurements === "string") {
      patternData.measurements = JSON.parse(patternData.measurements);
    }
    if (typeof patternData.fabricRequirements === "string") {
      patternData.fabricRequirements = JSON.parse(patternData.fabricRequirements);
    }
    if (typeof patternData.careInstructions === "string") {
      patternData.careInstructions = JSON.parse(patternData.careInstructions);
    }
    if (typeof patternData.copyright === "string") {
      patternData.copyright = JSON.parse(patternData.copyright);
    }
    if (typeof patternData.collaboration === "string") {
      patternData.collaboration = JSON.parse(patternData.collaboration);
    }
    if (typeof patternData.images === "string") {
      patternData.images = JSON.parse(patternData.images);
    }
    if (typeof patternData.tags === "string") {
      patternData.tags = JSON.parse(patternData.tags);
    }

    // Convert price to number
    if (patternData.price) {
      patternData.price = Number(patternData.price);
    }

    // Convert boolean strings
    if (typeof patternData.isFree === "string") {
      patternData.isFree = patternData.isFree === "true";
    }
    if (typeof patternData.isPublished === "string") {
      patternData.isPublished = patternData.isPublished === "true";
    }
    if (typeof patternData.featured === "string") {
      patternData.featured = patternData.featured === "true";
    }

    const pattern = await Pattern.create(patternData);

    res.status(201).json({
      success: true,
      data: pattern,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update pattern
// @route   PUT /api/patterns/:id
// @access  Private (Owner/Admin)
exports.updatePattern = async (req, res) => {
  try {
    let pattern = await Pattern.findById(req.params.id);

    if (!pattern) {
      return res.status(404).json({ message: "Pattern not found" });
    }

    // Check if user is owner or admin
    if (pattern.designer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this pattern" });
    }

    pattern = await Pattern.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({
      success: true,
      data: pattern,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete pattern
// @route   DELETE /api/patterns/:id
// @access  Private (Owner/Admin)
exports.deletePattern = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);

    if (!pattern) {
      return res.status(404).json({ message: "Pattern not found" });
    }

    // Check if user is owner or admin
    if (pattern.designer.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this pattern" });
    }

    // Soft delete
    pattern.isActive = false;
    await pattern.save();

    res.json({
      success: true,
      message: "Pattern deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's patterns
// @route   GET /api/patterns/my-patterns
// @access  Private
exports.getMyPatterns = async (req, res) => {
  try {
    const patterns = await Pattern.find({ designer: req.user._id })
      .populate("designer", "name email avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: patterns,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Purchase pattern
// @route   POST /api/patterns/:id/purchase
// @access  Private
exports.purchasePattern = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);

    if (!pattern) {
      return res.status(404).json({ message: "Pattern not found" });
    }

    if (!pattern.isPublished || !pattern.isActive) {
      return res.status(400).json({ message: "Pattern is not available for purchase" });
    }

    // Check if already purchased
    const existingPurchase = await PatternPurchase.findOne({
      pattern: pattern._id,
      buyer: req.user._id,
      paymentStatus: "completed",
    });

    if (existingPurchase) {
      return res.status(400).json({ message: "You have already purchased this pattern" });
    }

    // Free patterns
    if (pattern.isFree) {
      const purchase = await PatternPurchase.create({
        pattern: pattern._id,
        buyer: req.user._id,
        price: 0,
        paymentStatus: "completed",
        license: pattern.copyright.license,
      });

      pattern.stats.purchases += 1;
      await pattern.save();

      return res.json({
        success: true,
        data: purchase,
        message: "Pattern downloaded successfully",
      });
    }

    // Paid patterns - create purchase record
    const purchase = await PatternPurchase.create({
      pattern: pattern._id,
      buyer: req.user._id,
      price: pattern.price,
      paymentStatus: "pending",
      license: pattern.copyright.license,
    });

    // In a real app, you would integrate with a payment gateway here
    // For now, we'll mark it as completed
    purchase.paymentStatus = "completed";
    await purchase.save();

    pattern.stats.purchases += 1;
    await pattern.save();

    res.json({
      success: true,
      data: purchase,
      message: "Pattern purchased successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Download pattern file
// @route   GET /api/patterns/:id/download
// @access  Private
exports.downloadPattern = async (req, res) => {
  try {
    const pattern = await Pattern.findById(req.params.id);

    if (!pattern) {
      return res.status(404).json({ message: "Pattern not found" });
    }

    // Check if user has purchased or if pattern is free
    if (!pattern.isFree) {
      const purchase = await PatternPurchase.findOne({
        pattern: pattern._id,
        buyer: req.user._id,
        paymentStatus: "completed",
      });

      if (!purchase) {
        return res.status(403).json({ message: "You must purchase this pattern to download it" });
      }

      // Update download count
      purchase.downloadCount += 1;
      purchase.lastDownloadedAt = new Date();
      await purchase.save();
    }

    // Increment pattern download stats
    pattern.stats.downloads += 1;
    await pattern.save();

    res.json({
      success: true,
      data: {
        downloadUrl: pattern.patternFile.url,
        fileName: pattern.patternFile.fileName,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add pattern review
// @route   POST /api/patterns/:id/reviews
// @access  Private
exports.addPatternReview = async (req, res) => {
  try {
    const { rating, comment, images } = req.body;

    const pattern = await Pattern.findById(req.params.id);

    if (!pattern) {
      return res.status(404).json({ message: "Pattern not found" });
    }

    // Check if user has purchased
    const purchase = await PatternPurchase.findOne({
      pattern: pattern._id,
      buyer: req.user._id,
      paymentStatus: "completed",
    });

    // Check if review already exists
    const existingReview = await PatternReview.findOne({
      pattern: pattern._id,
      user: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this pattern" });
    }

    const review = await PatternReview.create({
      pattern: pattern._id,
      user: req.user._id,
      rating,
      comment,
      images: images || [],
      verifiedPurchase: !!purchase,
    });

    // Update pattern stats
    const reviews = await PatternReview.find({ pattern: pattern._id });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    pattern.stats.rating = Math.round(avgRating * 10) / 10;
    pattern.stats.totalReviews = reviews.length;
    await pattern.save();

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Request collaboration
// @route   POST /api/patterns/:id/collaborate
// @access  Private
exports.requestCollaboration = async (req, res) => {
  try {
    const { message } = req.body;

    const pattern = await Pattern.findById(req.params.id);

    if (!pattern) {
      return res.status(404).json({ message: "Pattern not found" });
    }

    if (!pattern.collaboration.enabled) {
      return res.status(400).json({ message: "Collaboration is not enabled for this pattern" });
    }

    // Check if already a collaborator
    const isCollaborator = pattern.collaboration.collaborators.some(
      (c) => c.user.toString() === req.user._id.toString()
    );

    if (isCollaborator) {
      return res.status(400).json({ message: "You are already a collaborator" });
    }

    // Check if request already exists
    const existingRequest = pattern.collaboration.requests.find(
      (r) => r.user.toString() === req.user._id.toString() && r.status === "pending"
    );

    if (existingRequest) {
      return res.status(400).json({ message: "You have already sent a collaboration request" });
    }

    pattern.collaboration.requests.push({
      user: req.user._id,
      message,
      status: "pending",
    });

    await pattern.save();

    res.json({
      success: true,
      message: "Collaboration request sent successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to collaboration request
// @route   PUT /api/patterns/:id/collaborate/:requestId
// @access  Private (Pattern Owner)
exports.respondToCollaborationRequest = async (req, res) => {
  try {
    const { status, role } = req.body;

    const pattern = await Pattern.findById(req.params.id);

    if (!pattern) {
      return res.status(404).json({ message: "Pattern not found" });
    }

    if (pattern.designer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const request = pattern.collaboration.requests.id(req.params.requestId);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    request.status = status;

    if (status === "approved") {
      pattern.collaboration.collaborators.push({
        user: request.user,
        role: role || "Viewer",
      });
    }

    await pattern.save();

    res.json({
      success: true,
      message: `Collaboration request ${status}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

