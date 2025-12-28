const express = require("express");
const router = express.Router();
const {
  getNews,
  getNewsById,
  createNews,
  updateNews,
  deleteNews,
  toggleLike,
} = require("../controllers/newsController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getNews);
router.get("/:id", getNewsById);
router.post("/", protect, authorize("admin"), createNews);
router.put("/:id", protect, authorize("admin"), updateNews);
router.delete("/:id", protect, authorize("admin"), deleteNews);
router.post("/:id/like", protect, toggleLike);

module.exports = router;

