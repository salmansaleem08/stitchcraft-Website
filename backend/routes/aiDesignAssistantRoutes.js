const express = require("express");
const router = express.Router();
const {
  getStyleRecommendations,
  getSavedRecommendations,
  checkFabricCompatibility,
  checkCulturalAppropriateness,
  getTrendForecasts,
} = require("../controllers/aiDesignAssistantController");
const { protect } = require("../middleware/auth");

router.post("/recommendations", protect, getStyleRecommendations);
router.get("/recommendations", protect, getSavedRecommendations);
router.post("/fabric-compatibility", checkFabricCompatibility);
router.post("/cultural-appropriateness", checkCulturalAppropriateness);
router.get("/trends", getTrendForecasts);

module.exports = router;

