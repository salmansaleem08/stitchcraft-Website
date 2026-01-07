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
    console.log("=== Admin Dashboard Stats Query Started ===");

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
      User.countDocuments({ role: "supplier", verificationStatus: "under_review" }).catch(err => { console.error("Error counting pending verifications:", err); return 0; }),
      User.countDocuments({ role: "supplier" }).catch(err => { console.error("Error counting suppliers:", err); return 0; }),
      User.countDocuments({ role: "tailor" }).catch(err => { console.error("Error counting tailors:", err); return 0; }),
      User.countDocuments({ role: "customer" }).catch(err => { console.error("Error counting customers:", err); return 0; }),
      User.countDocuments({ "badges.type": "Mentor" }).catch(err => { console.error("Error counting mentors:", err); return 0; }),
      // Order counts
      Order.countDocuments().catch(err => { console.error("Error counting orders:", err); return 0; }),
      Order.countDocuments({ status: { $in: ["pending", "consultation_scheduled", "consultation_completed", "fabric_selected", "in_progress", "revision_requested", "quality_check"] } }).catch(err => { console.error("Error counting pending orders:", err); return 0; }),
      Order.countDocuments({ status: "completed" }).catch(err => { console.error("Error counting completed orders:", err); return 0; }),
      // Product counts
      Fabric.countDocuments().catch(err => { console.error("Error counting fabrics:", err); return 0; }),
      Supply.countDocuments().catch(err => { console.error("Error counting supplies:", err); return 0; }),
      Equipment.countDocuments().catch(err => { console.error("Error counting equipment:", err); return 0; }),
      // Learning resources
      Course.countDocuments().catch(err => { console.error("Error counting courses:", err); return 0; }),
      Workshop.countDocuments().catch(err => { console.error("Error counting workshops:", err); return 0; }),
      Pattern.countDocuments().catch(err => { console.error("Error counting patterns:", err); return 0; }),
      Video.countDocuments().catch(err => { console.error("Error counting videos:", err); return 0; }),
      IndustryNews.countDocuments().catch(err => { console.error("Error counting news:", err); return 0; }),
      // Additional stats
      User.countDocuments({ role: "supplier", verificationStatus: "verified" }).catch(err => { console.error("Error counting verified suppliers:", err); return 0; }),
      // Revenue calculation
      Order.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]).catch(err => { console.error("Error calculating revenue:", err); return []; }),
    ]);

    console.log("Raw counts from database:");
    console.log(`pendingVerifications: ${pendingVerifications}`);
    console.log(`totalSuppliers: ${totalSuppliers}`);
    console.log(`totalTailors: ${totalTailors}`);
    console.log(`totalCustomers: ${totalCustomers}`);
    console.log(`totalMentors: ${totalMentors}`);
    console.log(`totalOrders: ${totalOrders}`);
    console.log(`pendingOrders: ${pendingOrders}`);
    console.log(`completedOrders: ${completedOrders}`);
    console.log(`totalFabrics: ${totalFabrics}`);
    console.log(`totalSupplies: ${totalSupplies}`);
    console.log(`totalEquipment: ${totalEquipment}`);
    console.log(`totalCourses: ${totalCourses}`);
    console.log(`totalWorkshops: ${totalWorkshops}`);
    console.log(`totalPatterns: ${totalPatterns}`);
    console.log(`totalVideos: ${totalVideos}`);
    console.log(`totalNews: ${totalNews}`);
    console.log(`verifiedSuppliers: ${verifiedSuppliers}`);
    console.log(`revenueResult:`, revenueResult);

    // Calculate total products
    const totalProducts = totalFabrics + totalSupplies + totalEquipment;

    // Extract revenue
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    console.log("Final response data being sent:");
    console.log({
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
    });

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

