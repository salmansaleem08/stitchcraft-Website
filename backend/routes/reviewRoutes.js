const express = require("express");
const router = express.Router();
const {
  createReview,
  getTailorReviews,
  getOrderReview,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.post("/", protect, createReview);
router.get("/tailor/:tailorId", getTailorReviews);
router.get("/order/:orderId", protect, getOrderReview);

module.exports = router;

