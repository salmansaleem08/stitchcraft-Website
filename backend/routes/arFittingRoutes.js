const express = require("express");
const router = express.Router();
const {
  createTryOnSession,
  updateBodyScan,
  simulateFabricDraping,
  calculatePatternFit,
  updateVisualization,
  getTryOnSessions,
  getTryOnSession,
  saveTryOnSession,
  deleteTryOnSession,
} = require("../controllers/arFittingController");
const { protect } = require("../middleware/auth");

router.post("/sessions", protect, createTryOnSession);
router.get("/sessions", protect, getTryOnSessions);
router.get("/sessions/:id", protect, getTryOnSession);
router.put("/sessions/:id/scan", protect, updateBodyScan);
router.post("/sessions/:id/draping", protect, simulateFabricDraping);
router.post("/sessions/:id/pattern-fit", protect, calculatePatternFit);
router.put("/sessions/:id/visualization", protect, updateVisualization);
router.put("/sessions/:id/save", protect, saveTryOnSession);
router.delete("/sessions/:id", protect, deleteTryOnSession);

module.exports = router;

