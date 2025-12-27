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
  markMessageAsRead,
  scheduleConsultation,
  updateConsultationStatus,
  rescheduleConsultation,
  approveRevision,
  rejectRevision,
  startRevision,
  completeRevision,
  customerApproveRevision,
  customerRejectRevision,
  addPayment,
  markPaymentAsPaid,
  updateDelivery,
  raiseDispute,
  resolveDispute,
  requestAlteration,
  updateAlterationStatus,
  requestRefund,
  processRefund,
  updateEmergencyContact,
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
router.put("/:id/messages/:messageId/read", protect, markMessageAsRead);
router.post("/:id/consultation", protect, scheduleConsultation);
router.put("/:id/consultation/status", protect, updateConsultationStatus);
router.put("/:id/consultation/reschedule", protect, rescheduleConsultation);
router.post("/:id/payments", protect, addPayment);
router.put("/:id/payments/:paymentId/paid", protect, markPaymentAsPaid);
router.put("/:id/delivery", protect, updateDelivery);
router.post("/:id/disputes", protect, raiseDispute);
router.put("/:id/disputes/:disputeId/resolve", protect, resolveDispute);
router.post("/:id/alterations", protect, requestAlteration);
router.put("/:id/alterations/:alterationId", protect, updateAlterationStatus);
router.post("/:id/refunds", protect, requestRefund);
router.put("/:id/refunds/:refundId/process", protect, processRefund);
router.put("/:id/emergency-contact", protect, updateEmergencyContact);

module.exports = router;

