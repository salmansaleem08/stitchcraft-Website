const express = require("express");
const router = express.Router();
const {
  saveMeasurements,
  getMeasurements,
  getMeasurement,
  getTemplates,
  updateMeasurement,
} = require("../controllers/measurementController");
const { protect } = require("../middleware/auth");

router.get("/templates", getTemplates);
router.post("/", protect, saveMeasurements);
router.get("/", protect, getMeasurements);
router.get("/:id", protect, getMeasurement);
router.put("/:id", protect, updateMeasurement);

module.exports = router;

