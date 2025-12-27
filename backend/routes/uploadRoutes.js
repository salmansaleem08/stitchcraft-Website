const express = require("express");
const router = express.Router();
const { uploadImages, uploadPatternFile } = require("../controllers/uploadController");
const { protect } = require("../middleware/auth");

// All upload routes are protected
router.use(protect);

router.post("/images", uploadImages);
router.post("/pattern-file", uploadPatternFile);

module.exports = router;

