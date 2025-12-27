const express = require("express");
const router = express.Router();
const {
  getPatterns,
  getPattern,
  createPattern,
  updatePattern,
  deletePattern,
  getMyPatterns,
  purchasePattern,
  downloadPattern,
  addPatternReview,
  requestCollaboration,
  respondToCollaborationRequest,
} = require("../controllers/patternController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getPatterns);
router.get("/:id", getPattern);

// Protected routes
router.use(protect);

router.get("/my-patterns", getMyPatterns);
router.post("/", createPattern);
router.put("/:id", updatePattern);
router.delete("/:id", deletePattern);
router.post("/:id/purchase", purchasePattern);
router.get("/:id/download", downloadPattern);
router.post("/:id/reviews", addPatternReview);
router.post("/:id/collaborate", requestCollaboration);
router.put("/:id/collaborate/:requestId", respondToCollaborationRequest);

module.exports = router;

