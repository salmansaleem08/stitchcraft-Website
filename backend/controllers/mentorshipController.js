const Mentorship = require("../models/Mentorship");
const User = require("../models/User");

// @desc    Get all mentorships
// @route   GET /api/mentorships
// @access  Private
exports.getMentorships = async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};

    if (req.user.role === "tailor") {
      // Tailors can see their mentorships as mentee or mentor
      filter.$or = [{ mentee: req.user._id }, { mentor: req.user._id }];
    } else {
      filter.mentee = req.user._id;
    }

    if (status) {
      filter.status = status;
    }

    const mentorships = await Mentorship.find(filter)
      .populate("mentor", "name email avatar bio specialization")
      .populate("mentee", "name email avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: mentorships.length,
      data: mentorships,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single mentorship
// @route   GET /api/mentorships/:id
// @access  Private
exports.getMentorship = async (req, res) => {
  try {
    const mentorship = await Mentorship.findById(req.params.id)
      .populate("mentor", "name email avatar bio specialization portfolio")
      .populate("mentee", "name email avatar");

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    // Check authorization
    if (
      mentorship.mentor.toString() !== req.user._id.toString() &&
      mentorship.mentee.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      data: mentorship,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request mentorship
// @route   POST /api/mentorships
// @access  Private
exports.requestMentorship = async (req, res) => {
  try {
    const { mentorId, programType, goals } = req.body;

    const mentor = await User.findById(mentorId);
    if (!mentor || mentor.role !== "tailor") {
      return res.status(404).json({ message: "Mentor not found" });
    }

    // Check if mentorship already exists
    const existing = await Mentorship.findOne({
      mentor: mentorId,
      mentee: req.user._id,
      status: { $in: ["pending", "active"] },
    });

    if (existing) {
      return res.status(400).json({ message: "Mentorship request already exists" });
    }

    const mentorship = new Mentorship({
      mentor: mentorId,
      mentee: req.user._id,
      programType,
      goals: goals || [],
      status: "pending",
    });

    await mentorship.save();
    await mentorship.populate("mentor", "name email avatar");
    await mentorship.populate("mentee", "name email avatar");

    res.status(201).json({
      success: true,
      data: mentorship,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Accept/Reject mentorship request
// @route   PUT /api/mentorships/:id/respond
// @access  Private
exports.respondToMentorship = async (req, res) => {
  try {
    const { action } = req.body; // "accept" or "reject"
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    if (mentorship.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (action === "accept") {
      mentorship.status = "active";
      mentorship.startDate = new Date();
    } else if (action === "reject") {
      mentorship.status = "cancelled";
    }

    await mentorship.save();
    await mentorship.populate("mentor", "name email avatar");
    await mentorship.populate("mentee", "name email avatar");

    res.json({
      success: true,
      data: mentorship,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add session to mentorship
// @route   POST /api/mentorships/:id/sessions
// @access  Private
exports.addSession = async (req, res) => {
  try {
    const { title, scheduledDate, duration, notes } = req.body;
    const mentorship = await Mentorship.findById(req.params.id);

    if (!mentorship) {
      return res.status(404).json({ message: "Mentorship not found" });
    }

    if (
      mentorship.mentor.toString() !== req.user._id.toString() &&
      mentorship.mentee.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    mentorship.sessions.push({
      title,
      scheduledDate,
      duration,
      notes,
      status: "scheduled",
    });

    await mentorship.save();

    res.json({
      success: true,
      data: mentorship,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get available mentors
// @route   GET /api/mentorships/mentors
// @access  Public
exports.getMentors = async (req, res) => {
  try {
    const mentors = await User.find({
      role: "tailor",
      isActive: true,
      $or: [
        { badges: { $in: ["Master Tailor"] } },
        { experience: { $gte: 10 } },
        { rating: { $gte: 4.5 } },
      ],
    })
      .select("name email avatar bio specialization experience rating badges")
      .limit(50);

    res.json({
      success: true,
      count: mentors.length,
      data: mentors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

