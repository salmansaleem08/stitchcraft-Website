const Workshop = require("../models/Workshop");

// @desc    Get all workshops
// @route   GET /api/workshops
// @access  Public
exports.getWorkshops = async (req, res) => {
  try {
    const {
      category,
      status,
      search,
      sortBy = "date",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = {};

    if (category) {
      filter.category = category;
    }
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const sort = {};
    if (sortBy === "date") {
      sort.date = 1;
    } else {
      sort[sortBy] = -1;
    }

    const workshops = await Workshop.find(filter)
      .populate("organizer", "name email avatar")
      .populate("registeredUsers.user", "name email avatar")
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Workshop.countDocuments(filter);

    res.json({
      success: true,
      count: workshops.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: workshops,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single workshop
// @route   GET /api/workshops/:id
// @access  Public
exports.getWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id)
      .populate("organizer", "name email avatar bio")
      .populate("registeredUsers.user", "name email avatar");

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    res.json({
      success: true,
      data: workshop,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create workshop
// @route   POST /api/workshops
// @access  Private
exports.createWorkshop = async (req, res) => {
  try {
    const workshop = new Workshop({
      ...req.body,
      organizer: req.user._id,
    });

    await workshop.save();
    await workshop.populate("organizer", "name email avatar");

    res.status(201).json({
      success: true,
      data: workshop,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update workshop
// @route   PUT /api/workshops/:id
// @access  Private
exports.updateWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    if (
      workshop.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(workshop, req.body);
    await workshop.save();
    await workshop.populate("organizer", "name email avatar");

    res.json({
      success: true,
      data: workshop,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Register for workshop
// @route   POST /api/workshops/:id/register
// @access  Private
exports.registerForWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    if (workshop.status !== "upcoming") {
      return res.status(400).json({ message: "Workshop is not available for registration" });
    }

    const existingRegistration = workshop.registeredUsers.find(
      (reg) => reg.user.toString() === req.user._id.toString()
    );

    if (existingRegistration) {
      return res.status(400).json({ message: "Already registered" });
    }

    if (workshop.registeredUsers.length >= workshop.maxParticipants) {
      return res.status(400).json({ message: "Workshop is full" });
    }

    workshop.registeredUsers.push({
      user: req.user._id,
      registeredAt: new Date(),
    });

    await workshop.save();

    res.json({
      success: true,
      message: "Registered successfully",
      data: workshop,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel workshop registration
// @route   DELETE /api/workshops/:id/register
// @access  Private
exports.cancelRegistration = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    const registrationIndex = workshop.registeredUsers.findIndex(
      (reg) => reg.user.toString() === req.user._id.toString()
    );

    if (registrationIndex === -1) {
      return res.status(400).json({ message: "Not registered for this workshop" });
    }

    workshop.registeredUsers.splice(registrationIndex, 1);
    await workshop.save();

    res.json({
      success: true,
      message: "Registration cancelled",
      data: workshop,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete workshop
// @route   DELETE /api/workshops/:id
// @access  Private (Admin only)
exports.deleteWorkshop = async (req, res) => {
  try {
    const workshop = await Workshop.findById(req.params.id);

    if (!workshop) {
      return res.status(404).json({ message: "Workshop not found" });
    }

    await workshop.deleteOne();

    res.json({
      success: true,
      message: "Workshop deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

