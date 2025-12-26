const Review = require("../models/Review");
const Order = require("../models/Order");
const User = require("../models/User");
const { assignBadges } = require("../utils/badgeAssignment");

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res) => {
  try {
    const {
      tailor,
      order,
      rating,
      comment,
      photos,
      responseTime,
      quality,
      communication,
      valueForMoney,
    } = req.body;

    // Validation
    if (!tailor || !rating) {
      return res.status(400).json({
        message: "Please provide tailor and rating",
      });
    }

    // Verify order exists and belongs to customer
    if (order) {
      const orderDoc = await Order.findById(order);
      if (!orderDoc) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (orderDoc.customer.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized" });
      }
      if (orderDoc.status !== "completed") {
        return res.status(400).json({
          message: "Can only review completed orders",
        });
      }
    }

    // Check if review already exists for this order
    if (order) {
      const existingReview = await Review.findOne({
        tailor,
        order,
        customer: req.user._id,
      });

      if (existingReview) {
        return res.status(400).json({
          message: "You have already reviewed this order",
        });
      }
    } else {
      // If no order provided, prevent duplicate general reviews
      const existingReview = await Review.findOne({
        tailor,
        customer: req.user._id,
        order: { $exists: false },
      });

      if (existingReview) {
        return res.status(400).json({
          message: "You have already submitted a general review for this tailor. Please link reviews to specific orders.",
        });
      }
    }

    const review = await Review.create({
      tailor,
      customer: req.user._id,
      order: order || null,
      rating,
      comment,
      photos: photos || [],
      responseTime,
      quality,
      communication,
      valueForMoney,
    });

    // Update tailor's rating
    await updateTailorRating(tailor);
    
    // Check and assign badges
    await assignBadges(tailor);

    res.status(201).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get reviews for a tailor
// @route   GET /api/reviews/tailor/:tailorId
// @access  Public
exports.getTailorReviews = async (req, res) => {
  try {
    const { tailorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ tailor: tailorId })
      .populate("customer", "name avatar")
      .populate("order", "orderNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ tailor: tailorId });

    res.json({
      success: true,
      count: reviews.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: reviews,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get review for an order
// @route   GET /api/reviews/order/:orderId
// @access  Private
exports.getOrderReview = async (req, res) => {
  try {
    const review = await Review.findOne({ order: req.params.orderId })
      .populate("customer", "name avatar")
      .populate("tailor", "name shopName");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Check authorization
    if (
      review.customer._id.toString() !== req.user._id.toString() &&
      review.tailor._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to update tailor rating
const updateTailorRating = async (tailorId) => {
  try {
    const reviews = await Review.find({ tailor: tailorId });
    if (reviews.length === 0) return;

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await User.findByIdAndUpdate(tailorId, {
      rating: averageRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error updating tailor rating:", error);
  }
};

