const express = require("express");
const router = express.Router();
const {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  toggleLike,
} = require("../controllers/newsController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getNews);
router.get("/:id", getNewsById);
router.post("/", protect, authorize("admin", "tailor"), createNews);
router.put("/:id", protect, authorize("admin", "tailor"), updateNews);
router.post("/:id/like", protect, toggleLike);

module.exports = router;

