const User = require("../models/User");

// @desc    Get supplier profile
// @route   GET /api/suppliers/:id
// @access  Public
exports.getSupplierProfile = async (req, res) => {
  try {
    const supplier = await User.findById(req.params.id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(404).json({ message: "Supplier not found" });
    }

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Public
exports.getSuppliers = async (req, res) => {
  try {
    const {
      businessType,
      productCategory,
      verified,
      verificationStatus,
      city,
      province,
      search,
      minRating,
      sort,
    } = req.query;

    let filter = { role: "supplier", isActive: true };

    if (businessType) {
      filter.businessType = businessType;
    }

    if (productCategory) {
      filter.productCategories = productCategory;
    }

    if (verified === "true" || verificationStatus === "verified") {
      filter.verificationStatus = "verified";
    } else if (verificationStatus) {
      filter.verificationStatus = verificationStatus;
    }

    if (minRating) {
      filter.qualityRating = { $gte: parseFloat(minRating) };
    }

    if (city) {
      filter["address.city"] = new RegExp(city, "i");
    }

    if (province) {
      filter["address.province"] = new RegExp(province, "i");
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { businessName: new RegExp(search, "i") },
        { businessDescription: new RegExp(search, "i") },
      ];
    }

    let sortOption = { qualityRating: -1, createdAt: -1 };
    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    } else if (sort === "name") {
      sortOption = { businessName: 1, name: 1 };
    } else if (sort === "rating") {
      sortOption = { qualityRating: -1, createdAt: -1 };
    }

    const suppliers = await User.find(filter)
      .select("-password")
      .sort(sortOption);

    res.json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update supplier profile
// @route   PUT /api/suppliers/profile
// @access  Private (Supplier only)
exports.updateSupplierProfile = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const allowedFields = [
      "businessName",
      "businessDescription",
      "businessRegistrationNumber",
      "taxId",
      "cnic",
      "yearsInBusiness",
      "productCategories",
      "phone",
      "address",
      "bio",
      "avatar",
      "minimumOrderQuantity",
      "bulkDiscountEnabled",
      "bulkDiscountTiers",
      "distributionCenters",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        supplier[field] = req.body[field];
      }
    });

    const updatedSupplier = await supplier.save();

    res.json({
      success: true,
      data: updatedSupplier,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload verification documents
// @route   POST /api/suppliers/verification-documents
// @access  Private (Supplier only)
exports.uploadVerificationDocuments = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(404).json({ message: "Supplier not found" });
    }

    const { documentType, documentUrl } = req.body;

    if (!documentType || !documentUrl) {
      return res.status(400).json({
        message: "Please provide document type and URL",
      });
    }

    supplier.verificationDocuments.push({
      documentType,
      documentUrl,
      verified: false,
    });

    // Update verification status to under_review if documents are uploaded
    if (supplier.verificationStatus === "pending") {
      supplier.verificationStatus = "under_review";
    }

    await supplier.save();

    res.json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get supplier stats
// @route   GET /api/suppliers/stats
// @access  Private (Supplier only)
exports.getSupplierStats = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // TODO: Add actual stats from orders/products when those models are created
    const stats = {
      totalProducts: 0, // Will be updated when Fabric/Supplies models are created
      totalOrders: 0,
      totalRevenue: 0,
      averageRating: supplier.qualityRating || 0,
      totalReviews: supplier.totalQualityReviews || 0,
      verificationStatus: supplier.verificationStatus,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

