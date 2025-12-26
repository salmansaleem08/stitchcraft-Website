const Fabric = require("../models/Fabric");
const User = require("../models/User");
const Order = require("../models/Order");

// @desc    Get fabric recommendations for a tailor
// @route   GET /api/fabrics/recommendations/tailor/:tailorId
// @access  Public
exports.getTailorRecommendations = async (req, res) => {
  try {
    const { tailorId } = req.params;
    const tailor = await User.findById(tailorId);

    if (!tailor || tailor.role !== "tailor") {
      return res.status(404).json({ message: "Tailor not found" });
    }

    // Get tailor's specializations and fabric expertise
    const specializations = tailor.specialization || [];
    const fabricExpertise = tailor.fabricExpertise || [];

    // Build recommendation criteria
    let recommendations = [];

    // 1. Match by fabric expertise
    if (fabricExpertise.length > 0) {
      const expertiseFabrics = await Fabric.find({
        fabricType: { $in: fabricExpertise },
        isActive: true,
      })
        .populate("supplier", "name businessName verificationStatus qualityRating")
        .limit(10)
        .sort({ rating: -1, createdAt: -1 });

      recommendations.push(...expertiseFabrics);
    }

    // 2. Match by season (current season)
    const currentMonth = new Date().getMonth();
    let currentSeason = "All Season";
    if (currentMonth >= 2 && currentMonth <= 4) currentSeason = "Spring";
    else if (currentMonth >= 5 && currentMonth <= 7) currentSeason = "Summer";
    else if (currentMonth >= 8 && currentMonth <= 10) currentSeason = "Fall";
    else currentSeason = "Winter";

    const seasonFabrics = await Fabric.find({
      season: { $in: [currentSeason, "All Season"] },
      isActive: true,
      _id: { $nin: recommendations.map((r) => r._id) },
    })
      .populate("supplier", "name businessName verificationStatus qualityRating")
      .limit(10)
      .sort({ rating: -1 });

    recommendations.push(...seasonFabrics);

    // 3. High-rated fabrics
    const highRatedFabrics = await Fabric.find({
      rating: { $gte: 4.0 },
      isActive: true,
      _id: { $nin: recommendations.map((r) => r._id) },
    })
      .populate("supplier", "name businessName verificationStatus qualityRating")
      .limit(10)
      .sort({ rating: -1, totalReviews: -1 });

    recommendations.push(...highRatedFabrics);

    // Remove duplicates and limit to 20
    const uniqueRecommendations = recommendations.filter(
      (fabric, index, self) => index === self.findIndex((f) => f._id.toString() === fabric._id.toString())
    ).slice(0, 20);

    res.json({
      success: true,
      count: uniqueRecommendations.length,
      data: uniqueRecommendations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fabric recommendations based on design pattern
// @route   GET /api/fabrics/recommendations/pattern
// @access  Public
exports.getPatternRecommendations = async (req, res) => {
  try {
    const { pattern, occasion, season } = req.query;

    let filter = { isActive: true };

    if (pattern) {
      filter.pattern = pattern;
    }

    if (occasion) {
      filter.occasion = occasion;
    }

    if (season) {
      filter.season = { $in: [season, "All Season"] };
    }

    const fabrics = await Fabric.find(filter)
      .populate("supplier", "name businessName verificationStatus qualityRating")
      .sort({ rating: -1, totalReviews: -1 })
      .limit(20);

    res.json({
      success: true,
      count: fabrics.length,
      data: fabrics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get season-appropriate fabric recommendations
// @route   GET /api/fabrics/recommendations/season
// @access  Public
exports.getSeasonRecommendations = async (req, res) => {
  try {
    const { season } = req.query;

    // Determine current season if not provided
    let targetSeason = season;
    if (!targetSeason) {
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 2 && currentMonth <= 4) targetSeason = "Spring";
      else if (currentMonth >= 5 && currentMonth <= 7) targetSeason = "Summer";
      else if (currentMonth >= 8 && currentMonth <= 10) targetSeason = "Fall";
      else targetSeason = "Winter";
    }

    const fabrics = await Fabric.find({
      season: { $in: [targetSeason, "All Season"] },
      isActive: true,
    })
      .populate("supplier", "name businessName verificationStatus qualityRating")
      .sort({ rating: -1, totalReviews: -1 })
      .limit(20);

    res.json({
      success: true,
      count: fabrics.length,
      season: targetSeason,
      data: fabrics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fabric recommendations for a specific fabric (similar fabrics)
// @route   GET /api/fabrics/recommendations/similar/:fabricId
// @access  Public
exports.getSimilarFabrics = async (req, res) => {
  try {
    const { fabricId } = req.params;

    const fabric = await Fabric.findById(fabricId);
    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    // Find similar fabrics based on type, color, pattern, and price range
    const priceRange = fabric.pricePerMeter * 0.3; // 30% price range

    const similarFabrics = await Fabric.find({
      _id: { $ne: fabricId },
      isActive: true,
      $or: [
        { fabricType: fabric.fabricType },
        { color: new RegExp(fabric.color, "i") },
        { pattern: fabric.pattern },
        {
          pricePerMeter: {
            $gte: fabric.pricePerMeter - priceRange,
            $lte: fabric.pricePerMeter + priceRange,
          },
        },
      ],
    })
      .populate("supplier", "name businessName verificationStatus qualityRating")
      .sort({ rating: -1 })
      .limit(12);

    res.json({
      success: true,
      count: similarFabrics.length,
      data: similarFabrics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

