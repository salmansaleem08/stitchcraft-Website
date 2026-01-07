const upload = require("../utils/upload");
const { videoUpload } = require("../utils/upload");
const path = require("path");

// Upload multiple images
exports.uploadImages = async (req, res) => {
  try {
    const uploadMultiple = upload.fields([{ name: "images", maxCount: 10 }]);

    uploadMultiple(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.files || !req.files.images) {
        return res.status(400).json({ message: "No images uploaded" });
      }

      const imageUrls = req.files.images.map((file) => {
        return `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/images/${file.filename}`;
      });

      res.json({
        success: true,
        data: imageUrls,
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload pattern file
exports.uploadPatternFile = async (req, res) => {
  try {
    const uploadSingle = upload.single("patternFile");

    uploadSingle(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No pattern file uploaded" });
      }

      res.json({
        success: true,
        data: {
          url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/patterns/${req.file.filename}`,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
        },
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Upload video file
exports.uploadVideo = async (req, res) => {
  try {
    const uploadSingle = videoUpload.single("video");

    uploadSingle(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No video file uploaded" });
      }

      res.json({
        success: true,
        data: {
          url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/videos/${req.file.filename}`,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          fileType: req.file.mimetype,
          filename: req.file.filename,
        },
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

