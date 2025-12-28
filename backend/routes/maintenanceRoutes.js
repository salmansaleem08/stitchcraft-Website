const express = require("express");
const router = express.Router();
const {
  getMaintenanceServices,
  getMaintenanceService,
  bookMaintenanceService,
  updateMaintenanceStatus,
  getServiceProviders,
} = require("../controllers/maintenanceController");
const { protect } = require("../middleware/auth");

router.get("/providers", getServiceProviders);
router.get("/", protect, getMaintenanceServices);
router.get("/:id", protect, getMaintenanceService);
router.post("/", protect, bookMaintenanceService);
router.put("/:id/status", protect, updateMaintenanceStatus);

module.exports = router;

