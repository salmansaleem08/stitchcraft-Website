const Fabric = require("../models/Fabric");
const Supply = require("../models/Supply");

// @desc    Compare prices across suppliers for similar products
// @route   GET /api/price-comparison/fabric
// @access  Public
exports.compareFabricPrices = async (req, res) => {
  try {
    const { fabricType, color, pattern, minPrice, maxPrice } = req.query;

    const filter = { isActive: true };

    if (fabricType) filter.fabricType = fabricType;
    if (color) filter.color = new RegExp(color, "i");
    if (pattern) filter.pattern = pattern;
    if (minPrice) filter.pricePerMeter = { ...filter.pricePerMeter, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.pricePerMeter = { ...filter.pricePerMeter, $lte: parseFloat(maxPrice) };

    const fabrics = await Fabric.find(filter)
      .populate("supplier", "name businessName qualityRating verificationStatus location")
      .sort({ pricePerMeter: 1 });

    // Group by fabric type only - fabrics can be compared if they have the same fabric type
    const grouped = {};
    fabrics.forEach((fabric) => {
      const key = `${fabric.fabricType}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(fabric);
    });

    // Calculate statistics
    const comparison = Object.entries(grouped).map(([key, items]) => {
      const prices = items.map((item) => item.pricePerMeter);
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const priceRange = maxPrice - minPrice;
      const savings = maxPrice - minPrice;

      return {
        key,
        fabricType: items[0].fabricType,
        color: items[0].color,
        pattern: items[0].pattern || "Plain",
        suppliers: items.map((item) => ({
          id: item._id,
          name: item.name,
          supplier: {
            id: item.supplier._id,
            name: item.supplier.businessName || item.supplier.name,
            qualityRating: item.supplier.qualityRating,
            verified: item.supplier.verificationStatus === "verified",
            location: item.supplier.location,
          },
          pricePerMeter: item.pricePerMeter,
          stockQuantity: item.stockQuantity,
          rating: item.rating,
          images: item.images,
        })),
        statistics: {
          averagePrice: avgPrice,
          minPrice,
          maxPrice,
          priceRange,
          potentialSavings: savings,
          supplierCount: items.length,
        },
      };
    });

    res.json({
      success: true,
      count: comparison.length,
      data: comparison,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Compare prices across suppliers for supplies
// @route   GET /api/price-comparison/supply
// @access  Public
exports.compareSupplyPrices = async (req, res) => {
  try {
    const { category, brand, minPrice, maxPrice } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (brand) filter.brand = new RegExp(brand, "i");
    if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };

    const supplies = await Supply.find(filter)
      .populate("supplier", "name businessName qualityRating verificationStatus location")
      .sort({ price: 1 });

    // Group by category only - supplies can be compared if they have the same category
    const grouped = {};
    supplies.forEach((supply) => {
      const key = `${supply.category}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(supply);
    });

    // Calculate statistics
    const comparison = Object.entries(grouped).map(([key, items]) => {
      const prices = items.map((item) => item.price);
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const savings = maxPrice - minPrice;

      return {
        key,
        category: items[0].category,
        brand: items[0].brand || "Generic",
        suppliers: items.map((item) => ({
          id: item._id,
          name: item.name,
          supplier: {
            id: item.supplier._id,
            name: item.supplier.businessName || item.supplier.name,
            qualityRating: item.supplier.qualityRating,
            verified: item.supplier.verificationStatus === "verified",
            location: item.supplier.location,
          },
          price: item.price,
          unit: item.unit,
          stockQuantity: item.stockQuantity,
          rating: item.rating,
          images: item.images,
        })),
        statistics: {
          averagePrice: avgPrice,
          minPrice,
          maxPrice,
          priceRange: maxPrice - minPrice,
          potentialSavings: savings,
          supplierCount: items.length,
        },
      };
    });

    res.json({
      success: true,
      count: comparison.length,
      data: comparison,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

