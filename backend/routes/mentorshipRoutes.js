const express = require("express");
const router = express.Router();
const {
  getMentorships,
  getMentorship,
  requestMentorship,
  respondToMentorship,
  addSession,
  getMentors,
  addMessage,
  registerAsMentor,
} = require("../controllers/mentorshipController");
const { protect } = require("../middleware/auth");

router.get("/mentors", getMentors);
router.post("/register-mentor", protect, registerAsMentor);
router.get("/", protect, getMentorships);
router.get("/:id", protect, getMentorship);
router.post("/", protect, requestMentorship);
router.put("/:id/respond", protect, respondToMentorship);
router.post("/:id/sessions", protect, addSession);
router.post("/:id/messages", protect, addMessage);

module.exports = router;

