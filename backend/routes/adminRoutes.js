const express = require("express");
const router = express.Router();
const {
  getPendingVerifications,
  getAllVerifications,
  approveVerification,
  rejectVerification,
  getAdminDashboard,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

// All routes are protected and admin only
router.get("/dashboard", protect, authorize("admin"), getAdminDashboard);
router.get("/verifications/pending", protect, authorize("admin"), getPendingVerifications);
router.get("/verifications", protect, authorize("admin"), getAllVerifications);
router.put("/verifications/:id/approve", protect, authorize("admin"), approveVerification);
router.put("/verifications/:id/reject", protect, authorize("admin"), rejectVerification);

module.exports = router;

