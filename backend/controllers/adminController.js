const User = require("../models/User");

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
    const [pendingVerifications, totalSuppliers, totalTailors, totalCustomers] = await Promise.all([
      User.countDocuments({ role: "supplier", verificationStatus: "under_review" }),
      User.countDocuments({ role: "supplier" }),
      User.countDocuments({ role: "tailor" }),
      User.countDocuments({ role: "customer" }),
    ]);

    res.json({
      success: true,
      data: {
        pendingVerifications,
        totalSuppliers,
        totalTailors,
        totalCustomers,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

