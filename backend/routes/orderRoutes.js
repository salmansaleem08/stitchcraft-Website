const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  updateOrderStatus,
  addRevision,
  updateFabric,
  addMessage,
  approveRevision,
  rejectRevision,
  startRevision,
  completeRevision,
  customerApproveRevision,
  customerRejectRevision,
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrder);
router.put("/:id", protect, updateOrder);
router.put("/:id/status", protect, updateOrderStatus);
router.post("/:id/revisions", protect, addRevision);
router.put("/:id/revisions/:revisionId/approve", protect, approveRevision);
router.put("/:id/revisions/:revisionId/reject", protect, rejectRevision);
router.put("/:id/revisions/:revisionId/in-progress", protect, startRevision);
router.put("/:id/revisions/:revisionId/complete", protect, completeRevision);
router.put("/:id/revisions/:revisionId/customer-approve", protect, customerApproveRevision);
router.put("/:id/revisions/:revisionId/customer-reject", protect, customerRejectRevision);
router.put("/:id/fabric", protect, updateFabric);
router.post("/:id/messages", protect, addMessage);

module.exports = router;

