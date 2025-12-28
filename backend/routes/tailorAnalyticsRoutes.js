const express = require("express");
const router = express.Router();
const {
  getTailorAnalyticsOverview,
  getEarningsReport,
  getCustomerRetention,
  getPopularServices,
  getSeasonalDemand,
  getPerformanceBenchmarking,
} = require("../controllers/tailorAnalyticsController");
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication and tailor role
router.use(protect);
router.use(authorize("tailor"));

router.get("/overview", getTailorAnalyticsOverview);
router.get("/earnings", getEarningsReport);
router.get("/retention", getCustomerRetention);
router.get("/popular-services", getPopularServices);
router.get("/seasonal-demand", getSeasonalDemand);
router.get("/benchmarking", getPerformanceBenchmarking);

module.exports = router;

