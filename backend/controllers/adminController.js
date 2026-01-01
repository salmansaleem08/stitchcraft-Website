const User = require("../models/User");
const Order = require("../models/Order");
const Fabric = require("../models/Fabric");
const Supply = require("../models/Supply");
const Equipment = require("../models/Equipment");
const Course = require("../models/Course");
const Workshop = require("../models/Workshop");
const Pattern = require("../models/Pattern");
const Video = require("../models/Video");
const IndustryNews = require("../models/IndustryNews");

// @desc    Get all suppliers pending verification
// @route   GET /api/admin/verifications/pending
// @access  Private (Admin only)
exports.getPendingVerifications = async (req, res) => {
  try {
    const suppliers = await User.find({
      role: "supplier",
      verificationStatus: "under_review",
    })
      .select("name email businessName verificationDocuments verificationStatus createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all verification requests (all statuses)
// @route   GET /api/admin/verifications
// @access  Private (Admin only)
exports.getAllVerifications = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = { role: "supplier" };

    if (status) {
      filter.verificationStatus = status;
    }

    const suppliers = await User.find(filter)
      .select(
        "name email businessName verificationDocuments verificationStatus verificationRemarks createdAt updatedAt"
      )
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve supplier verification
// @route   PUT /api/admin/verifications/:id/approve
// @access  Private (Admin only)
exports.approveVerification = async (req, res) => {
  try {
    const { remarks } = req.body;
    const supplier = await User.findById(req.params.id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.verificationStatus = "verified";
    supplier.verificationRemarks = remarks || "Verification approved by admin";
    supplier.verifiedAt = new Date();
    supplier.verifiedBy = req.user._id;

    // Mark all documents as verified
    if (supplier.verificationDocuments && supplier.verificationDocuments.length > 0) {
      supplier.verificationDocuments.forEach((doc) => {
        doc.verified = true;
        doc.verifiedAt = new Date();
        doc.verifiedBy = req.user._id;
      });
    }

    await supplier.save();

    res.json({
      success: true,
      message: "Supplier verification approved",
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject supplier verification
// @route   PUT /api/admin/verifications/:id/reject
// @access  Private (Admin only)
exports.rejectVerification = async (req, res) => {
  try {
    const { remarks } = req.body;

    const supplier = await User.findById(req.params.id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(404).json({ message: "Supplier not found" });
    }

    supplier.verificationStatus = "rejected";
    supplier.verificationRemarks = remarks || "Verification rejected by admin";
    supplier.rejectedAt = new Date();
    supplier.rejectedBy = req.user._id;

    await supplier.save();

    res.json({
      success: true,
      message: "Supplier verification rejected",
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
exports.getAdminDashboard = async (req, res) => {
  try {
    const [
      pendingVerifications,
      totalSuppliers,
      totalTailors,
      totalCustomers,
      totalMentors,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalFabrics,
      totalSupplies,
      totalEquipment,
      totalCourses,
      totalWorkshops,
      totalPatterns,
      totalVideos,
      totalNews,
      verifiedSuppliers,
      revenueResult,
    ] = await Promise.all([
      // User counts
      User.countDocuments({ role: "supplier", verificationStatus: "under_review" }),
      User.countDocuments({ role: "supplier" }),
      User.countDocuments({ role: "tailor" }),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ "badges.type": "Mentor" }),
      // Order counts
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ["pending", "confirmed", "in_progress"] } }),
      Order.countDocuments({ status: "completed" }),
      // Product counts
      Fabric.countDocuments(),
      Supply.countDocuments(),
      Equipment.countDocuments(),
      // Learning resources
      Course.countDocuments(),
      Workshop.countDocuments(),
      Pattern.countDocuments(),
      Video.countDocuments(),
      IndustryNews.countDocuments(),
      // Additional stats
      User.countDocuments({ role: "supplier", verificationStatus: "verified" }),
      // Revenue calculation
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    // Calculate total products
    const totalProducts = totalFabrics + totalSupplies + totalEquipment;
    
    // Extract revenue
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      data: {
        pendingVerifications,
        totalSuppliers,
        totalTailors,
        totalCustomers,
        totalMentors,
        totalOrders,
        pendingOrders,
        completedOrders,
        totalFabrics,
        totalSupplies,
        totalEquipment,
        totalProducts,
        totalCourses,
        totalWorkshops,
        totalPatterns,
        totalVideos,
        totalNews,
        verifiedSuppliers,
        totalRevenue: totalRevenue || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

