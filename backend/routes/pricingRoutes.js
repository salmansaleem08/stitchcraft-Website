const express = require("express");
const router = express.Router();
const {
  getPricingTiers,
  createPricingTier,
  updatePricingTier,
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage,
  calculatePrice,
} = require("../controllers/pricingController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/tiers/:tailorId", getPricingTiers);
router.get("/packages/:tailorId?", protect, getPackages); // Can be used with or without tailorId
router.get("/packages/single/:id", getPackage);
router.post("/calculate", calculatePrice);

// Protected routes (Tailor only)
router.post("/tiers", protect, authorize("tailor"), createPricingTier);
router.put("/tiers/:id", protect, authorize("tailor"), updatePricingTier);
router.post("/packages", protect, authorize("tailor"), createPackage);
router.put("/packages/:id", protect, authorize("tailor"), updatePackage);
router.delete("/packages/:id", protect, authorize("tailor"), deletePackage);

module.exports = router;

