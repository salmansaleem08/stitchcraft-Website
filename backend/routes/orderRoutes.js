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
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrder);
router.put("/:id", protect, updateOrder);
router.put("/:id/status", protect, updateOrderStatus);
router.post("/:id/revisions", protect, addRevision);
router.put("/:id/fabric", protect, updateFabric);
router.post("/:id/messages", protect, addMessage);

module.exports = router;

