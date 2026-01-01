const express = require("express");
const router = express.Router();
const upload = require("../utils/upload");
const {
  getTailors,
  getTailor,
  updateTailorProfile,
  addPortfolioItem,
  deletePortfolioItem,
  getTailorStats,
} = require("../controllers/tailorController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getTailors);
router.get("/stats", protect, authorize("tailor"), getTailorStats);
router.get("/:id", getTailor);
router.put("/profile", protect, authorize("tailor"), updateTailorProfile);
router.post(
  "/portfolio",
  protect,
  authorize("tailor"),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "beforeImage", maxCount: 1 },
    { name: "afterImage", maxCount: 1 },
  ]),
  addPortfolioItem
);
router.delete("/portfolio/:itemId", protect, authorize("tailor"), deletePortfolioItem);

module.exports = router;

