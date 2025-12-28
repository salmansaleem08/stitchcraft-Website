const express = require("express");
const router = express.Router();
const {
  getForums,
  getForum,
  createForum,
  updateForum,
  deleteForum,
  addReply,
  toggleLike,
  markAsSolution,
} = require("../controllers/forumController");
const { protect } = require("../middleware/auth");

router.get("/", getForums);
router.get("/:id", getForum);
router.post("/", protect, createForum);
router.put("/:id", protect, updateForum);
router.delete("/:id", protect, deleteForum);
router.post("/:id/reply", protect, addReply);
router.post("/:id/like", protect, toggleLike);
router.put("/:id/replies/:replyId/solution", protect, markAsSolution);

module.exports = router;

