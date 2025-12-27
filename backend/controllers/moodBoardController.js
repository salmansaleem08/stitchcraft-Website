const MoodBoard = require("../models/MoodBoard");
const Fabric = require("../models/Fabric");
const Pattern = require("../models/Pattern");

// @desc    Get all mood boards for a user
// @route   GET /api/mood-boards
// @access  Private
exports.getMoodBoards = async (req, res) => {
  try {
    const { orderId } = req.query;
    const filter = { createdBy: req.user._id };
    
    if (orderId) {
      filter.order = orderId;
    }

    const moodBoards = await MoodBoard.find(filter)
      .populate("order", "orderNumber status")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: moodBoards.length,
      data: moodBoards,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single mood board
// @route   GET /api/mood-boards/:id
// @access  Private
exports.getMoodBoard = async (req, res) => {
  try {
    const moodBoard = await MoodBoard.findById(req.params.id)
      .populate("createdBy", "name avatar")
      .populate("order", "orderNumber status")
      .populate("items.fabricId")
      .populate("items.patternId");

    if (!moodBoard) {
      return res.status(404).json({ message: "Mood board not found" });
    }

    // Check if user has access
    const hasAccess =
      moodBoard.createdBy._id.toString() === req.user._id.toString() ||
      moodBoard.sharedWith.some(
        (share) => share.user.toString() === req.user._id.toString()
      ) ||
      (moodBoard.order &&
        (moodBoard.order.customer?.toString() === req.user._id.toString() ||
          moodBoard.order.tailor?.toString() === req.user._id.toString()));

    if (!hasAccess) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      data: moodBoard,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create mood board
// @route   POST /api/mood-boards
// @access  Private
exports.createMoodBoard = async (req, res) => {
  try {
    const { title, description, order, items, tags } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const moodBoard = await MoodBoard.create({
      title,
      description,
      createdBy: req.user._id,
      order: order || null,
      items: items || [],
      tags: tags || [],
    });

    const populated = await MoodBoard.findById(moodBoard._id)
      .populate("createdBy", "name avatar")
      .populate("order", "orderNumber status");

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update mood board
// @route   PUT /api/mood-boards/:id
// @access  Private
exports.updateMoodBoard = async (req, res) => {
  try {
    const moodBoard = await MoodBoard.findById(req.params.id);

    if (!moodBoard) {
      return res.status(404).json({ message: "Mood board not found" });
    }

    // Check authorization
    const isOwner = moodBoard.createdBy.toString() === req.user._id.toString();
    const isEditor = moodBoard.sharedWith.some(
      (share) =>
        share.user.toString() === req.user._id.toString() &&
        share.role === "editor"
    );

    if (!isOwner && !isEditor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, items, tags, isShared, sharedWith } = req.body;

    if (title) moodBoard.title = title;
    if (description !== undefined) moodBoard.description = description;
    if (items) moodBoard.items = items;
    if (tags) moodBoard.tags = tags;
    if (isShared !== undefined) moodBoard.isShared = isShared;
    if (sharedWith) moodBoard.sharedWith = sharedWith;

    await moodBoard.save();

    const populated = await MoodBoard.findById(moodBoard._id)
      .populate("createdBy", "name avatar")
      .populate("order", "orderNumber status")
      .populate("items.fabricId")
      .populate("items.patternId");

    res.json({
      success: true,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete mood board
// @route   DELETE /api/mood-boards/:id
// @access  Private
exports.deleteMoodBoard = async (req, res) => {
  try {
    const moodBoard = await MoodBoard.findById(req.params.id);

    if (!moodBoard) {
      return res.status(404).json({ message: "Mood board not found" });
    }

    if (moodBoard.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await moodBoard.deleteOne();

    res.json({
      success: true,
      message: "Mood board deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to mood board
// @route   POST /api/mood-boards/:id/items
// @access  Private
exports.addMoodBoardItem = async (req, res) => {
  try {
    const moodBoard = await MoodBoard.findById(req.params.id);

    if (!moodBoard) {
      return res.status(404).json({ message: "Mood board not found" });
    }

    const isOwner = moodBoard.createdBy.toString() === req.user._id.toString();
    const isEditor = moodBoard.sharedWith.some(
      (share) =>
        share.user.toString() === req.user._id.toString() &&
        share.role === "editor"
    );

    if (!isOwner && !isEditor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { type, content, position, size, notes, tags } = req.body;

    if (!type) {
      return res.status(400).json({ message: "Item type is required" });
    }

    // Validate fabric/pattern IDs if provided
    if (type === "fabric" && content.fabricId) {
      const fabric = await Fabric.findById(content.fabricId);
      if (!fabric) {
        return res.status(404).json({ message: "Fabric not found" });
      }
    }

    if (type === "pattern" && content.patternId) {
      const pattern = await Pattern.findById(content.patternId);
      if (!pattern) {
        return res.status(404).json({ message: "Pattern not found" });
      }
    }

    moodBoard.items.push({
      type,
      content,
      position: position || { x: 0, y: 0 },
      size: size || { width: 200, height: 200 },
      notes,
      tags: tags || [],
    });

    await moodBoard.save();

    const populated = await MoodBoard.findById(moodBoard._id)
      .populate("items.fabricId")
      .populate("items.patternId");

    res.json({
      success: true,
      data: populated.items[populated.items.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from mood board
// @route   DELETE /api/mood-boards/:id/items/:itemId
// @access  Private
exports.removeMoodBoardItem = async (req, res) => {
  try {
    const moodBoard = await MoodBoard.findById(req.params.id);

    if (!moodBoard) {
      return res.status(404).json({ message: "Mood board not found" });
    }

    const isOwner = moodBoard.createdBy.toString() === req.user._id.toString();
    const isEditor = moodBoard.sharedWith.some(
      (share) =>
        share.user.toString() === req.user._id.toString() &&
        share.role === "editor"
    );

    if (!isOwner && !isEditor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    moodBoard.items = moodBoard.items.filter(
      (item) => item._id.toString() !== req.params.itemId
    );

    await moodBoard.save();

    res.json({
      success: true,
      message: "Item removed",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

