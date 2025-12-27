const express = require("express");
const router = express.Router();
const { createOrderFromCart } = require("../controllers/checkoutController");
const { protect, authorize } = require("../middleware/auth");

// All routes require authentication and customer role
router.use(protect);
router.use(authorize("customer"));

router.post("/", createOrderFromCart);

module.exports = router;

