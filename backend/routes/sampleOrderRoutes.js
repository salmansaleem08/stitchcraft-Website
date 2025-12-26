const express = require("express");
const router = express.Router();
const {
  createSampleOrder,
  getSampleOrders,
  getSampleOrder,
  updateSampleOrderStatus,
  cancelSampleOrder,
} = require("../controllers/sampleOrderController");
const { protect, authorize } = require("../middleware/auth");

// All routes are protected
router.post("/", protect, authorize("customer"), createSampleOrder);
router.get("/", protect, getSampleOrders);
router.get("/:id", protect, getSampleOrder);
router.put("/:id/status", protect, authorize("supplier"), updateSampleOrderStatus);
router.put("/:id/cancel", protect, authorize("customer"), cancelSampleOrder);

module.exports = router;

