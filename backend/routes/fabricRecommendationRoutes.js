const express = require("express");
const router = express.Router();
const {
  getTailorRecommendations,
  getPatternRecommendations,
  getSeasonRecommendations,
  getSimilarFabrics,
} = require("../controllers/fabricRecommendationController");

// All routes are public
router.get("/tailor/:tailorId", getTailorRecommendations);
router.get("/pattern", getPatternRecommendations);
router.get("/season", getSeasonRecommendations);
router.get("/similar/:fabricId", getSimilarFabrics);

module.exports = router;

