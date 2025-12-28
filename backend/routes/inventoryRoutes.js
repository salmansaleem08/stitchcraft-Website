const express = require("express");
const router = express.Router();
const {
  getInventorySummary,
  updateFabricStock,
  getLowStockItems,
  bulkUpdateStock,
} = require("../controllers/inventoryController");
const {
  getWasteAnalytics,
  updateWaste,
} = require("../controllers/wasteAnalyticsController");
const { protect, authorize } = require("../middleware/auth");

// All routes are protected (Supplier only)
router.get("/summary", protect, authorize("supplier"), getInventorySummary);
router.get("/low-stock", protect, authorize("supplier"), getLowStockItems);
router.put("/fabric/:fabricId/stock", protect, authorize("supplier"), updateFabricStock);
router.put("/bulk-update", protect, authorize("supplier"), bulkUpdateStock);
router.get("/waste-analytics", protect, authorize("supplier"), getWasteAnalytics);
router.put("/waste/:productId", protect, authorize("supplier"), updateWaste);

module.exports = router;

