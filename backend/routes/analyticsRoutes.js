const express = require("express");
const router = express.Router();
const {
  getAnalyticsOverview,
  getRevenueTrends,
  getTopProducts,
  getOrderStats,
} = require("../controllers/analyticsController");
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication and supplier role
router.use(protect);
router.use(authorize("supplier"));

router.get("/overview", getAnalyticsOverview);
router.get("/revenue-trends", getRevenueTrends);
router.get("/top-products", getTopProducts);
router.get("/order-stats", getOrderStats);

module.exports = router;

