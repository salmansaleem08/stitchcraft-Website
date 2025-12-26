const express = require("express");
const router = express.Router();
const {
  createBulkOrder,
  getBulkOrders,
  getBulkOrder,
  updateBulkOrderStatus,
  cancelBulkOrder,
} = require("../controllers/bulkOrderController");
const { protect, authorize } = require("../middleware/auth");

// All routes are protected
router.post("/", protect, authorize("customer"), createBulkOrder);
router.get("/", protect, getBulkOrders);
router.get("/:id", protect, getBulkOrder);
router.put("/:id/status", protect, authorize("supplier"), updateBulkOrderStatus);
router.put("/:id/cancel", protect, authorize("customer"), cancelBulkOrder);

module.exports = router;

