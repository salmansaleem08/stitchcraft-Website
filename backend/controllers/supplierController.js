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

    // Update verification status to under_review when documents are uploaded
    if (supplier.verificationStatus === "pending" || !supplier.verificationStatus) {
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

    // Import required models
    const SupplyOrder = require("../models/SupplyOrder");
    const BulkOrder = require("../models/BulkOrder");
    const SampleOrder = require("../models/SampleOrder");
    const Fabric = require("../models/Fabric");
    const Supply = require("../models/Supply");
    const SupplyReview = require("../models/SupplyReview");

    // Get all orders
    const [supplyOrders, bulkOrders, sampleOrders] = await Promise.all([
      SupplyOrder.find({ supplier: req.user._id }),
      BulkOrder.find({ supplier: req.user._id }),
      SampleOrder.find({ supplier: req.user._id }),
    ]);

    // Get products
    const [fabrics, supplies] = await Promise.all([
      Fabric.find({ supplier: req.user._id }),
      Supply.find({ supplier: req.user._id }),
    ]);

    // Calculate stats
    const totalProducts = fabrics.length + supplies.length;
    const totalOrders = supplyOrders.length + bulkOrders.length + sampleOrders.length;
    
    const totalRevenue =
      supplyOrders.reduce((sum, order) => sum + (order.finalPrice || 0), 0) +
      bulkOrders.reduce((sum, order) => sum + (order.finalPrice || order.totalPrice || 0), 0) +
      sampleOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Get reviews
    const reviews = await SupplyReview.find({ supplier: req.user._id });
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const stats = {
      totalProducts,
      totalOrders,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
      verificationStatus: supplier.verificationStatus || "pending",
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

