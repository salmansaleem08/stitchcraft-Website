const express = require("express");
const router = express.Router();
const {
  getSupplies,
  getSupply,
  createSupply,
  updateSupply,
  deleteSupply,
  getSuppliesBySupplier,
  getMySupplies,
} = require("../controllers/supplyController");
const { protect, authorize } = require("../middleware/auth");

// Protected routes (Supplier only) - must come before /:id route
router.get("/me/list", protect, authorize("supplier"), getMySupplies);
router.post("/", protect, authorize("supplier"), createSupply);
router.put("/:id", protect, authorize("supplier"), updateSupply);
router.delete("/:id", protect, authorize("supplier"), deleteSupply);

// Public routes
router.get("/", getSupplies);
router.get("/supplier/:supplierId", getSuppliesBySupplier);
router.get("/:id", getSupply);

module.exports = router;

