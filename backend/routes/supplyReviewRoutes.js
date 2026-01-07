const express = require("express");
const router = express.Router();
const {
  createSupplyReview,
  getSupplyReviews,
  getSupplierReviews,
  getSupplyReview,
  updateSupplyReview,
  deleteSupplyReview,
  markReviewHelpful,
} = require("../controllers/supplyReviewController");
const { protect, authorize } = require("../middleware/auth");
const upload = require("../utils/upload");

// Public routes
router.get("/supply/:supplyId", getSupplyReviews);
router.get("/supplier/:supplierId", getSupplierReviews);
router.get("/:id", getSupplyReview);

// Protected routes
router.post("/", protect, authorize("customer"), upload.array("images", 5), createSupplyReview);
router.put("/:id", protect, upload.array("images", 5), updateSupplyReview);
router.delete("/:id", protect, deleteSupplyReview);
router.post("/:id/helpful", protect, markReviewHelpful);

module.exports = router;

