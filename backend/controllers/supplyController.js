const Supply = require("../models/Supply");
const User = require("../models/User");

// @desc    Get all supplies
// @route   GET /api/supplies
// @access  Public
exports.getSupplies = async (req, res) => {
  try {
    const {
      supplier,
      category,
      subcategory,
      brand,
      color,
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

    if (category) {
      filter.category = category;
    }

    if (subcategory) {
      filter.subcategory = new RegExp(subcategory, "i");
    }

    if (brand) {
      filter.brand = new RegExp(brand, "i");
    }

    if (color) {
      filter.color = new RegExp(color, "i");
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { category: new RegExp(search, "i") },
        { brand: new RegExp(search, "i") },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Sort options
    let sortOption = { createdAt: -1 };
    if (sort === "price_low") {
      sortOption = { price: 1 };
    } else if (sort === "price_high") {
      sortOption = { price: -1 };
    } else if (sort === "rating") {
      sortOption = { rating: -1 };
    } else if (sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const supplies = await Supply.find(filter)
      .populate("supplier", "name businessName verificationStatus qualityRating avatar")
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Supply.countDocuments(filter);

    res.json({
      success: true,
      count: supplies.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: supplies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single supply
// @route   GET /api/supplies/:id
// @access  Public
exports.getSupply = async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id).populate(
      "supplier",
      "name businessName verificationStatus qualityRating avatar address phone email"
    );

    if (!supply) {
      return res.status(404).json({ message: "Supply not found" });
    }

    res.json({
      success: true,
      data: supply,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create supply
// @route   POST /api/supplies
// @access  Private (Supplier only)
exports.createSupply = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(403).json({ message: "Only suppliers can create supplies" });
    }

    const supplyData = {
      ...req.body,
      supplier: req.user._id,
    };

    const supply = await Supply.create(supplyData);

    res.status(201).json({
      success: true,
      data: supply,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update supply
// @route   PUT /api/supplies/:id
// @access  Private (Supplier only)
exports.updateSupply = async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id);

    if (!supply) {
      return res.status(404).json({ message: "Supply not found" });
    }

    if (supply.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this supply" });
    }

    const updatedSupply = await Supply.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedSupply,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete supply
// @route   DELETE /api/supplies/:id
// @access  Private (Supplier only)
exports.deleteSupply = async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id);

    if (!supply) {
      return res.status(404).json({ message: "Supply not found" });
    }

    if (supply.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this supply" });
    }

    // Soft delete by setting isActive to false
    supply.isActive = false;
    await supply.save();

    res.json({
      success: true,
      message: "Supply deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get supplies by supplier
// @route   GET /api/supplies/supplier/:supplierId
// @access  Public
exports.getSuppliesBySupplier = async (req, res) => {
  try {
    const { supplierId } = req.params;
    const { isActive } = req.query;

    let filter = { supplier: supplierId };

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const supplies = await Supply.find(filter)
      .populate("supplier", "name businessName verificationStatus qualityRating avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: supplies.length,
      data: supplies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my supplies (for logged-in supplier)
// @route   GET /api/supplies/me
// @access  Private (Supplier only)
exports.getMySupplies = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(403).json({ message: "Only suppliers can access this route" });
    }

    const supplies = await Supply.find({ supplier: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: supplies.length,
      data: supplies,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

