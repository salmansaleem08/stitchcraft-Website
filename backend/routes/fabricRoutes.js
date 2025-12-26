const express = require("express");
const router = express.Router();
const {
  getFabrics,
  getFabric,
  createFabric,
  updateFabric,
  deleteFabric,
  getFabricsBySupplier,
  getMyFabrics,
} = require("../controllers/fabricController");
const { protect, authorize } = require("../middleware/auth");

// Protected routes (Supplier only) - must come before /:id route
router.get("/me/list", protect, authorize("supplier"), getMyFabrics);
router.post("/", protect, authorize("supplier"), createFabric);
router.put("/:id", protect, authorize("supplier"), updateFabric);
router.delete("/:id", protect, authorize("supplier"), deleteFabric);

// Public routes
router.get("/", getFabrics);
router.get("/supplier/:supplierId", getFabricsBySupplier);
router.get("/:id", getFabric);

module.exports = router;

