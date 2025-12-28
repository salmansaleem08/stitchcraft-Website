const Course = require("../models/Course");
const Certification = require("../models/Certification");

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    const {
      category,
      level,
      search,
      isFree,
      sortBy = "createdAt",
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { isPublished: true };

    if (category) {
      filter.category = category;
    }
    if (level) {
      filter.level = level;
    }
    if (isFree === "true") {
      filter.isFree = true;
    }
    if (search) {
      filter.$or = [
        { title: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    const sort = {};
    if (sortBy === "rating") {
      sort.averageRating = -1;
    } else if (sortBy === "popular") {
      sort.views = -1;
    } else {
      sort[sortBy] = -1;
    }

    const courses = await Course.find(filter)
      .populate("instructor", "name email avatar")
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Course.countDocuments(filter);

    res.json({
      success: true,
      count: courses.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("instructor", "name email avatar bio")
      .populate("enrolledUsers.user", "name email avatar")
      .populate("ratings.user", "name avatar");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Increment views
    course.views += 1;
    await course.save();

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
exports.createCourse = async (req, res) => {
  try {
    const course = new Course({
      ...req.body,
      instructor: req.user._id,
    });

    await course.save();
    await course.populate("instructor", "name email avatar");

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (
      course.instructor.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(course, req.body);
    await course.save();
    await course.populate("instructor", "name email avatar");

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private
exports.enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existingEnrollment = course.enrolledUsers.find(
      (enrollment) => enrollment.user.toString() === req.user._id.toString()
    );

    if (existingEnrollment) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    course.enrolledUsers.push({
      user: req.user._id,
      enrolledAt: new Date(),
    });

    await course.save();

    res.json({
      success: true,
      message: "Enrolled successfully",
      data: course,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update course progress
// @route   PUT /api/courses/:id/progress
// @access  Private
exports.updateProgress = async (req, res) => {
  try {
    const { lessonId, completed } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = course.enrolledUsers.find(
      (e) => e.user.toString() === req.user._id.toString()
    );

    if (!enrollment) {
      return res.status(400).json({ message: "Not enrolled in this course" });
    }

    if (completed) {
      if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
      }
    } else {
      enrollment.completedLessons = enrollment.completedLessons.filter(
        (id) => id.toString() !== lessonId
      );
    }

    // Calculate progress
    let totalLessons = 0;
    course.content.forEach((section) => {
      totalLessons += section.lessons.length;
    });

    enrollment.progress =
      totalLessons > 0
        ? Math.round(
            (enrollment.completedLessons.length / totalLessons) * 100
          )
        : 0;

    await course.save();

    res.json({
      success: true,
      data: enrollment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rate course
// @route   POST /api/courses/:id/rate
// @access  Private
exports.rateCourse = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existingRating = course.ratings.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review;
    } else {
      course.ratings.push({
        user: req.user._id,
        rating,
        review,
      });
    }

    await course.save();
    await course.populate("ratings.user", "name avatar");

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's enrolled courses
// @route   GET /api/courses/my/enrolled
// @access  Private
exports.getMyEnrolledCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      "enrolledUsers.user": req.user._id,
    })
      .populate("instructor", "name email avatar")
      .sort({ "enrolledUsers.enrolledAt": -1 });

    res.json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Issue certificate
// @route   POST /api/courses/:id/certificate
// @access  Private
exports.issueCertificate = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const enrollment = course.enrolledUsers.find(
      (e) => e.user.toString() === req.user._id.toString()
    );

    if (!enrollment) {
      return res.status(400).json({ message: "Not enrolled in this course" });
    }

    if (enrollment.progress < 100) {
      return res
        .status(400)
        .json({ message: "Course must be completed to receive certificate" });
    }

    if (enrollment.certificateIssued) {
      return res.status(400).json({ message: "Certificate already issued" });
    }

    const certification = new Certification({
      course: course._id,
      user: req.user._id,
    });

    await certification.save();
    enrollment.certificateIssued = true;
    await course.save();

    res.status(201).json({
      success: true,
      data: certification,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

