const express = require("express");
const router = express.Router();
const {
  getVideos,
  getVideo,
  createVideo,
  updateVideo,
  deleteVideo,
  getAllVideosAdmin,
} = require("../controllers/videoController");
const { protect, authorize } = require("../middleware/auth");

// Public routes
router.get("/", getVideos);
router.get("/:id", getVideo);

// Admin routes
router.get("/admin/all", protect, authorize("admin"), getAllVideosAdmin);
router.post("/", protect, authorize("admin"), createVideo);
router.put("/:id", protect, authorize("admin"), updateVideo);
router.delete("/:id", protect, authorize("admin"), deleteVideo);

module.exports = router;

