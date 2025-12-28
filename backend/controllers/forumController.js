const Forum = require("../models/Forum");

// @desc    Get all forum posts
// @route   GET /api/forums
// @access  Public
exports.getForums = async (req, res) => {
  try {
    const {
      category,
      search,
      sortBy = "createdAt",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
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
      sort.likes = -1;
    } else if (sortBy === "recent") {
      sort.createdAt = -1;
    } else {
      sort[sortBy] = -1;
    }

    const forums = await Forum.find(filter)
      .populate("author", "name email avatar")
      .populate("replies.author", "name email avatar")
      .sort({ isPinned: -1, ...sort })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Forum.countDocuments(filter);

    res.json({
      success: true,
      count: forums.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: forums,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single forum post
// @route   GET /api/forums/:id
// @access  Public
exports.getForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id)
      .populate("author", "name email avatar")
      .populate("replies.author", "name email avatar")
      .populate("likes.user", "name avatar");

    if (!forum) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    // Increment views
    forum.views += 1;
    await forum.save();

    res.json({
      success: true,
      data: forum,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create forum post
// @route   POST /api/forums
// @access  Private
exports.createForum = async (req, res) => {
  try {
    const forum = new Forum({
      ...req.body,
      author: req.user._id,
    });

    await forum.save();
    await forum.populate("author", "name email avatar");

    res.status(201).json({
      success: true,
      data: forum,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update forum post
// @route   PUT /api/forums/:id
// @access  Private
exports.updateForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);

    if (!forum) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    if (
      forum.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(forum, req.body);
    await forum.save();
    await forum.populate("author", "name email avatar");

    res.json({
      success: true,
      data: forum,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete forum post
// @route   DELETE /api/forums/:id
// @access  Private
exports.deleteForum = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);

    if (!forum) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    if (
      forum.author.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await forum.deleteOne();

    res.json({
      success: true,
      message: "Forum post deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add reply to forum post
// @route   POST /api/forums/:id/reply
// @access  Private
exports.addReply = async (req, res) => {
  try {
    const { content, attachments } = req.body;
    const forum = await Forum.findById(req.params.id);

    if (!forum) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    if (forum.isLocked) {
      return res.status(400).json({ message: "Forum post is locked" });
    }

    forum.replies.push({
      author: req.user._id,
      content,
      attachments: attachments || [],
    });

    await forum.save();
    await forum.populate("replies.author", "name email avatar");

    res.json({
      success: true,
      data: forum,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Like/Unlike forum post
// @route   POST /api/forums/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);

    if (!forum) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    const likeIndex = forum.likes.findIndex(
      (like) => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      forum.likes.splice(likeIndex, 1);
    } else {
      forum.likes.push({ user: req.user._id });
    }

    await forum.save();

    res.json({
      success: true,
      data: forum,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mark reply as solution
// @route   PUT /api/forums/:id/replies/:replyId/solution
// @access  Private
exports.markAsSolution = async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.id);

    if (!forum) {
      return res.status(404).json({ message: "Forum post not found" });
    }

    if (forum.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const reply = forum.replies.id(req.params.replyId);
    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    // Unmark all other solutions
    forum.replies.forEach((r) => {
      r.isSolution = false;
    });

    reply.isSolution = true;
    forum.isResolved = true;

    await forum.save();
    await forum.populate("replies.author", "name email avatar");

    res.json({
      success: true,
      data: forum,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

