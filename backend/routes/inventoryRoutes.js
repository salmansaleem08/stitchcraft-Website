const express = require("express");
const router = express.Router();
const {
  getInventorySummary,
  updateFabricStock,
  getLowStockFabrics,
  bulkUpdateStock,
} = require("../controllers/inventoryController");
const { protect, authorize } = require("../middleware/auth");

// All routes are protected (Supplier only)
router.get("/summary", protect, authorize("supplier"), getInventorySummary);
router.get("/low-stock", protect, authorize("supplier"), getLowStockFabrics);
router.put("/fabric/:fabricId/stock", protect, authorize("supplier"), updateFabricStock);
router.put("/bulk-update", protect, authorize("supplier"), bulkUpdateStock);

module.exports = router;

