const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;
    
    if (file.fieldname === "patternFile") {
      uploadPath = path.join(uploadsDir, "patterns");
    } else if (file.fieldname === "images") {
      uploadPath = path.join(uploadsDir, "images");
    } else if (file.fieldname === "video") {
      uploadPath = path.join(uploadsDir, "videos");
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "patternFile") {
    // Allow pattern files
    const allowedTypes = [".pdf", ".zip", ".rar", ".dwg", ".dxf"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid pattern file type"), false);
    }
  } else if (file.fieldname === "images") {
    // Allow image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid image file type"), false);
    }
  } else if (file.fieldname === "video") {
    // Allow video files
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid video file type"), false);
    }
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file (for images/patterns)
  },
});

// Separate upload config for videos (larger file size)
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(uploadsDir, "videos");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, "video-" + uniqueSuffix + ext);
  },
});

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid video file type"), false);
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB per video file
  },
});

module.exports = upload;
module.exports.videoUpload = videoUpload;
