const express = require("express");
const router = express.Router();
const { uploadImages, uploadPatternFile, uploadVideo } = require("../controllers/uploadController");
const { protect, authorize } = require("../middleware/auth");

// All upload routes are protected
router.use(protect);

router.post("/images", uploadImages);
router.post("/pattern-file", uploadPatternFile);
router.post("/video", authorize("admin"), uploadVideo);

module.exports = router;

