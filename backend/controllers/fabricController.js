const Fabric = require("../models/Fabric");
const User = require("../models/User");

// @desc    Get all fabrics
// @route   GET /api/fabrics
// @access  Public
exports.getFabrics = async (req, res) => {
  try {
    const {
      supplier,
      fabricType,
      weight,
      season,
      occasion,
      color,
      pattern,
      origin,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 20,
    } = req.query;

    let filter = { isActive: true };

    if (supplier) {
      filter.supplier = supplier;
    }

    if (fabricType) {
      filter.fabricType = fabricType;
    }

    if (weight) {
      filter.weight = weight;
    }

    if (season) {
      filter.season = season;
    }

    if (occasion) {
      filter.occasion = occasion;
    }

    if (color) {
      filter.color = new RegExp(color, "i");
    }

    if (pattern) {
      filter.pattern = pattern;
    }

    if (origin) {
      filter.origin = new RegExp(origin, "i");
    }

    if (minPrice || maxPrice) {
      filter.pricePerMeter = {};
      if (minPrice) filter.pricePerMeter.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerMeter.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { fabricType: new RegExp(search, "i") },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === "price_low") {
      sortOption = { pricePerMeter: 1 };
    } else if (sort === "price_high") {
      sortOption = { pricePerMeter: -1 };
    } else if (sort === "rating") {
      sortOption = { rating: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const fabrics = await Fabric.find(filter)
      .populate("supplier", "name businessName verificationStatus qualityRating avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Fabric.countDocuments(filter);

    res.json({
      success: true,
      count: fabrics.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: fabrics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single fabric
// @route   GET /api/fabrics/:id
// @access  Public
exports.getFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id).populate(
      "supplier",
      "name businessName verificationStatus qualityRating avatar address phone email"
    );

    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    res.json({
      success: true,
      data: fabric,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create fabric
// @route   POST /api/fabrics
// @access  Private (Supplier only)
exports.createFabric = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(403).json({ message: "Only suppliers can create fabrics" });
    }

    const fabricData = {
      ...req.body,
      supplier: req.user._id,
    };

    const fabric = await Fabric.create(fabricData);

    res.status(201).json({
      success: true,
      data: fabric,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update fabric
// @route   PUT /api/fabrics/:id
// @access  Private (Supplier only)
exports.updateFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);

    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    if (fabric.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this fabric" });
    }

    const updatedFabric = await Fabric.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedFabric,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete fabric
// @route   DELETE /api/fabrics/:id
// @access  Private (Supplier only)
exports.deleteFabric = async (req, res) => {
  try {
    const fabric = await Fabric.findById(req.params.id);

    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    if (fabric.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this fabric" });
    }

    // Soft delete by setting isActive to false
    fabric.isActive = false;
    await fabric.save();

    res.json({
      success: true,
      message: "Fabric deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fabrics by supplier
// @route   GET /api/fabrics/supplier/:supplierId
// @access  Public
exports.getFabricsBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { isActive } = req.query;

    let filter = { supplier: supplierId };

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const fabrics = await Fabric.find(filter)
      .populate("supplier", "name businessName verificationStatus qualityRating avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: fabrics.length,
      data: fabrics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my fabrics (for logged-in supplier)
// @route   GET /api/fabrics/me
// @access  Private (Supplier only)
exports.getMyFabrics = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(403).json({ message: "Only suppliers can access this route" });
    }

    const fabrics = await Fabric.find({ supplier: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: fabrics.length,
      data: fabrics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

