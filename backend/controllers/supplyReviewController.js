const SupplyReview = require("../models/SupplyReview");
const Supply = require("../models/Supply");
const SupplyOrder = require("../models/SupplyOrder");
const User = require("../models/User");

// @desc    Create supply review
// @route   POST /api/supply-reviews
// @access  Private (Customer only)
exports.createSupplyReview = async (req, res) => {
  try {
    const customer = await User.findById(req.user._id);

    if (!customer || customer.role !== "customer") {
      return res.status(403).json({ message: "Only customers can create reviews" });
    }

    const { supply, supplier, order, rating, comment, quality, valueForMoney, delivery, images } =
      req.body;

    if (!supply || !supplier || !rating) {
      return res.status(400).json({ message: "Supply, supplier, and rating are required" });
    }

    // Verify supply exists
    const supplyDoc = await Supply.findById(supply);
    if (!supplyDoc) {
      return res.status(404).json({ message: "Supply not found" });
    }

    if (supplyDoc.supplier.toString() !== supplier.toString()) {
      return res.status(400).json({ message: "Supply does not belong to this supplier" });
    }

    // If order is provided, verify it belongs to the customer
    if (order) {
      const orderDoc = await SupplyOrder.findById(order);
      if (!orderDoc) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (orderDoc.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to review this order" });
      }

      // Check if review already exists for this order
      const existingReview = await SupplyReview.findOne({ order: order });
      if (existingReview) {
        return res.status(400).json({ message: "Review already exists for this order" });
      }
    } else {
      // Check if customer has already reviewed this supply
      const existingReview = await SupplyReview.findOne({
        customer: req.user._id,
        supply: supply,
      });
      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this supply" });
      }
    }

    const review = await SupplyReview.create({
      customer: req.user._id,
      supply: supply,
      supplier: supplier,
      order: order || null,
      rating: rating,
      comment: comment || "",
      quality: quality || null,
      valueForMoney: valueForMoney || null,
      delivery: delivery || null,
      images: images || [],
    });

    const populatedReview = await SupplyReview.findById(review._id)
      .populate("customer", "name avatar")
      .populate("supply", "name images")
      .populate("supplier", "name businessName");

    res.status(201).json({
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Review already exists for this order" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a supply
// @route   GET /api/supply-reviews/supply/:supplyId
// @access  Public
exports.getSupplyReviews = async (req, res) => {
  try {
    const { supplyId } = req.params;
    const { page = 1, limit = 10, rating, sort = "newest" } = req.query;

    let filter = { supply: supplyId };

    if (rating) {
      filter.rating = parseInt(rating);
    }

    let sortOption = { createdAt: -1 };
    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sort === "rating_high") {
      sortOption = { rating: -1 };
    } else if (sort === "rating_low") {
      sortOption = { rating: 1 };
    } else if (sort === "helpful") {
      sortOption = { helpful: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await SupplyReview.find(filter)
      .populate("customer", "name avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SupplyReview.countDocuments(filter);

    // Calculate rating distribution
    const ratingDistribution = {
      5: await SupplyReview.countDocuments({ supply: supplyId, rating: 5 }),
      4: await SupplyReview.countDocuments({ supply: supplyId, rating: 4 }),
      3: await SupplyReview.countDocuments({ supply: supplyId, rating: 3 }),
      2: await SupplyReview.countDocuments({supply: supplyId, rating: 2 }),
      1: await SupplyReview.countDocuments({ supply: supplyId, rating: 1 }),
    };

    res.json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      ratingDistribution,
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a supplier
// @route   GET /api/supply-reviews/supplier/:supplierId
// @access  Public
exports.getSupplierReviews = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await SupplyReview.find({ supplier: supplierId })
      .populate("customer", "name avatar")
      .populate("supply", "name images category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SupplyReview.countDocuments({ supplier: supplierId });

    // Calculate average ratings
    const allReviews = await SupplyReview.find({ supplier: supplierId });
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    res.json({
      success: true,
      count: reviews.length,
      total,
      averageRating: Math.round(avgRating * 10) / 10,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single review
// @route   GET /api/supply-reviews/:id
// @access  Public
exports.getSupplyReview = async (req, res) => {
  try {
    const review = await SupplyReview.findById(req.params.id)
      .populate("customer", "name avatar")
      .populate("supply", "name images")
      .populate("supplier", "name businessName");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update review
// @route   PUT /api/supply-reviews/:id
// @access  Private (Review owner only)
exports.updateSupplyReview = async (req, res) => {
  try {
    const review = await SupplyReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this review" });
    }

    const { rating, comment, quality, valueForMoney, delivery, images } = req.body;

    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    if (quality !== undefined) review.quality = quality;
    if (valueForMoney !== undefined) review.valueForMoney = valueForMoney;
    if (delivery !== undefined) review.delivery = delivery;
    if (images !== undefined) review.images = images;

    await review.save();

    const populatedReview = await SupplyReview.findById(review._id)
      .populate("customer", "name avatar")
      .populate("supply", "name images")
      .populate("supplier", "name businessName");

    res.json({
      success: true,
      data: populatedReview,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete review
// @route   DELETE /api/supply-reviews/:id
// @access  Private (Review owner only)
exports.deleteSupplyReview = async (req, res) => {
  try {
    const review = await SupplyReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await SupplyReview.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark review as helpful
// @route   POST /api/supply-reviews/:id/helpful
// @access  Private
exports.markReviewHelpful = async (req, res) => {
  try {
    const review = await SupplyReview.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.helpful = (review.helpful || 0) + 1;
    await review.save();

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

