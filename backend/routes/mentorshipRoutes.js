const express = require("express");
const router = express.Router();
const {
  getMentorships,
  getMentorship,
  requestMentorship,
  respondToMentorship,
  addSession,
  getMentors,
} = require("../controllers/mentorshipController");
const { protect } = require("../middleware/auth");

router.get("/mentors", getMentors);
router.get("/", protect, getMentorships);
router.get("/:id", protect, getMentorship);
router.post("/", protect, requestMentorship);
router.put("/:id/respond", protect, respondToMentorship);
router.post("/:id/sessions", protect, addSession);

module.exports = router;

