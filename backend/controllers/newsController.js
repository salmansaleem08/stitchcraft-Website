const IndustryNews = require("../models/IndustryNews");

// @desc    Get all news
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res) => {
  try {
    const {
      category,
      search,
      featured,
      sortBy = "createdAt",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isPublished: true };

    if (category) {
      filter.category = category;
    }
    if (featured === "true") {
      filter.isFeatured = true;
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { content: new RegExp(search, "i") },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const sort = {};
    if (sortBy === "popular") {
      sort.views = -1;
    } else if (sortBy === "recent") {
      sort.createdAt = -1;
    } else {
      sort[sortBy] = -1;
    }

    const news = await IndustryNews.find(filter)
      .populate("author", "name email avatar")
      .sort({ isFeatured: -1, ...sort })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await IndustryNews.countDocuments(filter);

    res.json({
      success: true,
      count: news.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: news,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single news article
// @route   GET /api/news/:id
// @access  Public
exports.getNewsById = async (req, res) => {
  try {
    const news = await IndustryNews.findById(req.params.id)
      .populate("author", "name email avatar")
      .populate("likes.user", "name avatar");

    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    // Increment views
    news.views += 1;
    await news.save();

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create news article
// @route   POST /api/news
// @access  Private (Admin/Author)
exports.createNews = async (req, res) => {
  try {
    const news = new IndustryNews({
      ...req.body,
      author: req.user._id,
    });

    await news.save();
    await news.populate("author", "name email avatar");

    res.status(201).json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update news article
// @route   PUT /api/news/:id
// @access  Private
exports.updateNews = async (req, res) => {
  try {
    const news = await IndustryNews.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    if (
      news.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(news, req.body);
    await news.save();
    await news.populate("author", "name email avatar");

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Like/Unlike news article
// @route   POST /api/news/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const news = await IndustryNews.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    const likeIndex = news.likes.findIndex(
      (like) => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      news.likes.splice(likeIndex, 1);
    } else {
      news.likes.push({ user: req.user._id });
    }

    await news.save();

    res.json({
      success: true,
      data: news,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete news article
// @route   DELETE /api/news/:id
// @access  Private (Admin only)
exports.deleteNews = async (req, res) => {
  try {
    const news = await IndustryNews.findById(req.params.id);

    if (!news) {
      return res.status(404).json({ message: "News article not found" });
    }

    await news.deleteOne();

    res.json({
      success: true,
      message: "News article deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

