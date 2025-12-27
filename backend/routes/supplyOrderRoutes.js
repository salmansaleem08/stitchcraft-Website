const express = require("express");
const router = express.Router();
const {
  createSupplyOrder,
  getSupplyOrders,
  getSupplyOrder,
  updateSupplyOrderStatus,
  cancelSupplyOrder,
} = require("../controllers/supplyOrderController");
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Customer routes
router.post("/", authorize("customer"), createSupplyOrder);
router.post("/:id/cancel", authorize("customer"), cancelSupplyOrder);

// Supplier and customer routes
router.get("/", getSupplyOrders);
router.get("/:id", getSupplyOrder);

// Supplier routes
router.put("/:id/status", authorize("supplier"), updateSupplyOrderStatus);

module.exports = router;

