const express = require("express");
const router = express.Router();
const {
  getMoodBoards,
  getMoodBoard,
  createMoodBoard,
  updateMoodBoard,
  deleteMoodBoard,
  addMoodBoardItem,
  removeMoodBoardItem,
} = require("../controllers/moodBoardController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getMoodBoards);
router.get("/:id", protect, getMoodBoard);
router.post("/", protect, createMoodBoard);
router.put("/:id", protect, updateMoodBoard);
router.delete("/:id", protect, deleteMoodBoard);
router.post("/:id/items", protect, addMoodBoardItem);
router.delete("/:id/items/:itemId", protect, removeMoodBoardItem);

module.exports = router;

