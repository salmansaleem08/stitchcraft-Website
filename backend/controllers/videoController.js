const Video = require("../models/Video");

// @desc    Get all videos by category
// @route   GET /api/videos
// @access  Public
exports.getVideos = async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;

    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    const videos = await Video.find(filter)
      .populate("addedBy", "name")
      .sort({ order: 1, createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Public
exports.getVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id).populate("addedBy", "name");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json({
      success: true,
      data: video,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create video (Admin only)
// @route   POST /api/videos
// @access  Private (Admin only)
exports.createVideo = async (req, res) => {
  try {
    const { title, description, youtubeUrl, localVideoUrl, localVideoFilename, fileSize, category, order, videoType, thumbnail } = req.body;

    let videoData = {
      title,
      description,
      category,
      order: order || 0,
      addedBy: req.user._id,
      videoType: videoType || "youtube",
    };

    if (videoType === "local") {
      // Local video upload
      if (!localVideoUrl) {
        return res.status(400).json({ message: "Local video URL is required" });
      }
      videoData.localVideoUrl = localVideoUrl;
      videoData.localVideoFilename = localVideoFilename;
      videoData.fileSize = fileSize;
      videoData.thumbnail = thumbnail || "/uploads/videos/default-thumbnail.jpg";
    } else {
      // YouTube video
      if (!youtubeUrl) {
        return res.status(400).json({ message: "YouTube URL is required" });
      }
      
      const youtubeIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = youtubeUrl.match(youtubeIdRegex);

      if (!match || !match[1]) {
        return res.status(400).json({ message: "Invalid YouTube URL" });
      }

      videoData.youtubeUrl = youtubeUrl;
      videoData.youtubeId = match[1];
      videoData.thumbnail = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }

    const video = new Video(videoData);
    await video.save();
    await video.populate("addedBy", "name");

    res.status(201).json({
      success: true,
      data: video,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update video (Admin only)
// @route   PUT /api/videos/:id
// @access  Private (Admin only)
exports.updateVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Handle video type changes or updates
    if (req.body.videoType === "youtube" && req.body.youtubeUrl) {
      if (req.body.youtubeUrl !== video.youtubeUrl) {
        const youtubeIdRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const match = req.body.youtubeUrl.match(youtubeIdRegex);

        if (!match || !match[1]) {
          return res.status(400).json({ message: "Invalid YouTube URL" });
        }

        req.body.youtubeId = match[1];
        req.body.thumbnail = `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
        // Clear local video data if switching to YouTube
        req.body.localVideoUrl = undefined;
        req.body.localVideoFilename = undefined;
        req.body.fileSize = undefined;
      }
    } else if (req.body.videoType === "local" && req.body.localVideoUrl) {
      // Clear YouTube data if switching to local
      req.body.youtubeUrl = undefined;
      req.body.youtubeId = undefined;
    }

    Object.assign(video, req.body);
    await video.save();
    await video.populate("addedBy", "name");

    res.json({
      success: true,
      data: video,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete video (Admin only)
// @route   DELETE /api/videos/:id
// @access  Private (Admin only)
exports.deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Delete local video file if it exists
    if (video.videoType === "local" && video.localVideoFilename) {
      const fs = require("fs");
      const path = require("path");
      const videoPath = path.join(__dirname, "../uploads/videos", video.localVideoFilename);
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
      }
    }

    await video.deleteOne();

    res.json({
      success: true,
      message: "Video deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all videos for admin (including inactive)
// @route   GET /api/videos/admin/all
// @access  Private (Admin only)
exports.getAllVideosAdmin = async (req, res) => {
  try {
    const { category } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    const videos = await Video.find(filter)
      .populate("addedBy", "name")
      .sort({ category: 1, order: 1, createdAt: -1 });

    res.json({
      success: true,
      count: videos.length,
      data: videos,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

