const Fabric = require("../models/Fabric");
const Supply = require("../models/Supply");
const User = require("../models/User");

// @desc    Unified search across fabrics, supplies, and suppliers
// @route   GET /api/search
// @access  Public
exports.unifiedSearch = async (req, res) => {
  try {
    const { q, type, category, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;

    if (!q || q.trim().length === 0) {
      return res.json({
        success: true,
        data: {
          fabrics: [],
          supplies: [],
          suppliers: [],
          total: 0,
        },
      });
    }

    const searchQuery = new RegExp(q.trim(), "i");
    const skip = (parseInt(page) - 1) * parseInt(limit);

    let results = {
      fabrics: [],
      supplies: [],
      suppliers: [],
      total: 0,
    };

    // Search fabrics
    if (!type || type === "fabric") {
      let fabricFilter = {
        isActive: true,
        $or: [
          { name: searchQuery },
          { description: searchQuery },
          { fabricType: searchQuery },
          { color: searchQuery },
          { pattern: searchQuery },
          { tags: { $in: [searchQuery] } },
        ],
      };

      if (category) {
        fabricFilter.fabricType = new RegExp(category, "i");
      }

      if (minPrice || maxPrice) {
        fabricFilter.pricePerMeter = {};
        if (minPrice) fabricFilter.pricePerMeter.$gte = parseFloat(minPrice);
        if (maxPrice) fabricFilter.pricePerMeter.$lte = parseFloat(maxPrice);
      }

      let fabricSort = { createdAt: -1 };
      if (sort === "price_low") fabricSort = { pricePerMeter: 1 };
      else if (sort === "price_high") fabricSort = { pricePerMeter: -1 };
      else if (sort === "rating") fabricSort = { rating: -1 };

      const fabrics = await Fabric.find(fabricFilter)
        .populate("supplier", "name businessName verificationStatus qualityRating avatar")
        .sort(fabricSort)
        .skip(skip)
        .limit(parseInt(limit));

      results.fabrics = fabrics;
    }

    // Search supplies
    if (!type || type === "supply") {
      let supplyFilter = {
        isActive: true,
        $or: [
          { name: searchQuery },
          { description: searchQuery },
          { category: searchQuery },
          { brand: searchQuery },
          { color: searchQuery },
          { tags: { $in: [searchQuery] } },
        ],
      };

      if (category) {
        supplyFilter.category = new RegExp(category, "i");
      }

      if (minPrice || maxPrice) {
        supplyFilter.price = {};
        if (minPrice) supplyFilter.price.$gte = parseFloat(minPrice);
        if (maxPrice) supplyFilter.price.$lte = parseFloat(maxPrice);
      }

      let supplySort = { createdAt: -1 };
      if (sort === "price_low") supplySort = { price: 1 };
      else if (sort === "price_high") supplySort = { price: -1 };
      else if (sort === "rating") supplySort = { rating: -1 };

      const supplies = await Supply.find(supplyFilter)
        .populate("supplier", "name businessName verificationStatus qualityRating avatar")
        .sort(supplySort)
        .skip(skip)
        .limit(parseInt(limit));

      results.supplies = supplies;
    }

    // Search suppliers
    if (!type || type === "supplier") {
      let supplierFilter = {
        role: "supplier",
        $or: [
          { name: searchQuery },
          { businessName: searchQuery },
          { businessDescription: searchQuery },
          { productCategories: { $in: [searchQuery] } },
        ],
      };

      const suppliers = await User.find(supplierFilter)
        .select("name businessName businessDescription avatar verificationStatus qualityRating productCategories address")
        .sort({ qualityRating: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      results.suppliers = suppliers;
    }

    results.total = results.fabrics.length + results.supplies.length + results.suppliers.length;

    res.json({
      success: true,
      query: q,
      page: parseInt(page),
      limit: parseInt(limit),
      data: results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get search suggestions/autocomplete
// @route   GET /api/search/suggestions
// @access  Public
exports.getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const searchQuery = new RegExp(q.trim(), "i");
    const suggestions = [];

    // Get fabric suggestions
    const fabrics = await Fabric.find({
      isActive: true,
      $or: [{ name: searchQuery }, { fabricType: searchQuery }, { tags: { $in: [searchQuery] } }],
    })
      .select("name fabricType")
      .limit(5);

    fabrics.forEach((fabric) => {
      suggestions.push({
        type: "fabric",
        text: fabric.name,
        category: fabric.fabricType,
        url: `/fabrics/${fabric._id}`,
      });
    });

    // Get supply suggestions
    const supplies = await Supply.find({
      isActive: true,
      $or: [{ name: searchQuery }, { category: searchQuery }, { tags: { $in: [searchQuery] } }],
    })
      .select("name category")
      .limit(5);

    supplies.forEach((supply) => {
      suggestions.push({
        type: "supply",
        text: supply.name,
        category: supply.category,
        url: `/supplies/${supply._id}`,
      });
    });

    // Get supplier suggestions
    const suppliers = await User.find({
      role: "supplier",
      $or: [{ businessName: searchQuery }, { name: searchQuery }],
    })
      .select("name businessName")
      .limit(5);

    suppliers.forEach((supplier) => {
      suggestions.push({
        type: "supplier",
        text: supplier.businessName || supplier.name,
        category: "Supplier",
        url: `/suppliers/${supplier._id}`,
      });
    });

    res.json({
      success: true,
      data: suggestions.slice(0, parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

