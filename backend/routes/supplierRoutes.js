const express = require("express");
const router = express.Router();
const {
  getSuppliers,
  getSupplierProfile,
  updateSupplierProfile,
  uploadVerificationDocuments,
  getSupplierStats,
} = require("../controllers/supplierController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getSuppliers);
router.get("/:id", getSupplierProfile);

// Protected routes (Supplier only)
router.put("/profile", protect, authorize("supplier"), updateSupplierProfile);
router.post(
  "/verification-documents",
  protect,
  authorize("supplier"),
  uploadVerificationDocuments
);
router.get("/stats/me", protect, authorize("supplier"), getSupplierStats);

module.exports = router;

