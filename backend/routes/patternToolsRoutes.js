const express = require("express");
const router = express.Router();
const {
  calculateScaling,
  estimateFabric,
  getModificationSuggestions,
} = require("../controllers/patternToolsController");

// All tools are public (no authentication required)
router.post("/scale", calculateScaling);
router.post("/fabric-estimate", estimateFabric);
router.post("/modify", getModificationSuggestions);

module.exports = router;

