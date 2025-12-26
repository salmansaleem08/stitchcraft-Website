const User = require("../models/User");
const Review = require("../models/Review");
const Order = require("../models/Order");

// Automatically assign badges to tailors based on performance
const assignBadges = async (tailorId) => {
  try {
    const tailor = await User.findById(tailorId);
    if (!tailor || tailor.role !== "tailor") return;

    const badges = [];
    const existingBadgeTypes = tailor.badges.map((b) => b.type);

    // Master Tailor: High rating + many completed orders
    if (
      tailor.rating >= 4.5 &&
      tailor.completedOrders >= 50 &&
      !existingBadgeTypes.includes("Master Tailor")
    ) {
      badges.push({
        name: "Master Tailor",
        type: "Master Tailor",
        earnedAt: new Date(),
      });
    }

    // Speed Stitching: Fast response time + high completion rate
    if (
      tailor.averageResponseTime <= 24 &&
      tailor.completionRate >= 90 &&
      tailor.completedOrders >= 20 &&
      !existingBadgeTypes.includes("Speed Stitching")
    ) {
      badges.push({
        name: "Speed Stitching",
        type: "Speed Stitching",
        earnedAt: new Date(),
      });
    }

    // Quality Expert: High quality ratings from reviews
    const reviews = await Review.find({ tailor: tailorId });
    if (reviews.length >= 10) {
      const avgQuality =
        reviews
          .filter((r) => r.quality)
          .reduce((sum, r) => sum + r.quality, 0) /
        reviews.filter((r) => r.quality).length;

      if (
        avgQuality >= 4.5 &&
        !existingBadgeTypes.includes("Quality Expert")
      ) {
        badges.push({
          name: "Quality Expert",
          type: "Quality Expert",
          earnedAt: new Date(),
        });
      }
    }

    // Customer Favorite: High number of positive reviews
    if (
      tailor.totalReviews >= 25 &&
      tailor.rating >= 4.0 &&
      !existingBadgeTypes.includes("Customer Favorite")
    ) {
      badges.push({
        name: "Customer Favorite",
        type: "Customer Favorite",
        earnedAt: new Date(),
      });
    }

    // Add new badges to existing ones
    if (badges.length > 0) {
      tailor.badges = [...tailor.badges, ...badges];
      await tailor.save();
    }
  } catch (error) {
    console.error("Error assigning badges:", error);
  }
};

module.exports = { assignBadges };

