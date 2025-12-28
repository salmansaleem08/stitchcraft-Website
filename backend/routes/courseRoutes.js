const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  enrollInCourse,
  updateProgress,
  rateCourse,
  getMyEnrolledCourses,
  issueCertificate,
} = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getCourses);
router.get("/my/enrolled", protect, getMyEnrolledCourses);
router.get("/:id", getCourse);
router.post("/", protect, authorize("tailor", "admin"), createCourse);
router.put("/:id", protect, authorize("tailor", "admin"), updateCourse);
router.post("/:id/enroll", protect, enrollInCourse);
router.put("/:id/progress", protect, updateProgress);
router.post("/:id/rate", protect, rateCourse);
router.post("/:id/certificate", protect, issueCertificate);

module.exports = router;

