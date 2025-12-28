const Fabric = require("../models/Fabric");
const Supply = require("../models/Supply");
const User = require("../models/User");

// @desc    Get waste analytics for supplier
// @route   GET /api/inventory/waste-analytics
// @access  Private (Supplier only)
exports.getWasteAnalytics = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(403).json({ message: "Only suppliers can access waste analytics" });
    }

    const [fabrics, supplies] = await Promise.all([
      Fabric.find({ supplier: req.user._id }),
      Supply.find({ supplier: req.user._id }),
    ]);

    // Calculate fabric waste
    const fabricWaste = fabrics.reduce(
      (sum, fabric) => sum + (fabric.wasteTracking?.totalWaste || 0),
      0
    );
    const totalFabricStock = fabrics.reduce((sum, fabric) => sum + (fabric.stockQuantity || 0), 0);
    const fabricWastePercentage =
      totalFabricStock > 0 ? (fabricWaste / (totalFabricStock + fabricWaste)) * 100 : 0;

    // Calculate supply waste
    const supplyWaste = supplies.reduce(
      (sum, supply) => sum + (supply.wasteTracking?.totalWaste || 0),
      0
    );
    const totalSupplyStock = supplies.reduce((sum, supply) => sum + (supply.stockQuantity || 0), 0);
    const supplyWastePercentage =
      totalSupplyStock > 0 ? (supplyWaste / (totalSupplyStock + supplyWaste)) * 100 : 0;

    // Top wasteful items
    const wastefulFabrics = fabrics
      .filter((f) => f.wasteTracking?.wastePercentage > 5)
      .sort((a, b) => (b.wasteTracking?.wastePercentage || 0) - (a.wasteTracking?.wastePercentage || 0))
      .slice(0, 10)
      .map((f) => ({
        id: f._id,
        name: f.name,
        fabricType: f.fabricType,
        waste: f.wasteTracking?.totalWaste || 0,
        wastePercentage: f.wasteTracking?.wastePercentage || 0,
        stockQuantity: f.stockQuantity,
      }));

    const wastefulSupplies = supplies
      .filter((s) => s.wasteTracking?.wastePercentage > 5)
      .sort((a, b) => (b.wasteTracking?.wastePercentage || 0) - (a.wasteTracking?.wastePercentage || 0))
      .slice(0, 10)
      .map((s) => ({
        id: s._id,
        name: s.name,
        category: s.category,
        waste: s.wasteTracking?.totalWaste || 0,
        wastePercentage: s.wasteTracking?.wastePercentage || 0,
        stockQuantity: s.stockQuantity,
      }));

    // Waste by category
    const wasteByFabricType = {};
    fabrics.forEach((fabric) => {
      const waste = fabric.wasteTracking?.totalWaste || 0;
      if (!wasteByFabricType[fabric.fabricType]) {
        wasteByFabricType[fabric.fabricType] = 0;
      }
      wasteByFabricType[fabric.fabricType] += waste;
    });

    const wasteBySupplyCategory = {};
    supplies.forEach((supply) => {
      const waste = supply.wasteTracking?.totalWaste || 0;
      if (!wasteBySupplyCategory[supply.category]) {
        wasteBySupplyCategory[supply.category] = 0;
      }
      wasteBySupplyCategory[supply.category] += waste;
    });

    // Estimated cost of waste
    const fabricWasteCost = fabrics.reduce(
      (sum, fabric) =>
        sum + (fabric.wasteTracking?.totalWaste || 0) * (fabric.pricePerMeter || 0),
      0
    );
    const supplyWasteCost = supplies.reduce(
      (sum, supply) => sum + (supply.wasteTracking?.totalWaste || 0) * (supply.price || 0),
      0
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalFabricWaste: fabricWaste,
          totalSupplyWaste: supplyWaste,
          totalWaste: fabricWaste + supplyWaste,
          fabricWastePercentage: fabricWastePercentage.toFixed(2),
          supplyWastePercentage: supplyWastePercentage.toFixed(2),
          estimatedWasteCost: fabricWasteCost + supplyWasteCost,
        },
        topWastefulItems: {
          fabrics: wastefulFabrics,
          supplies: wastefulSupplies,
        },
        wasteByCategory: {
          fabrics: wasteByFabricType,
          supplies: wasteBySupplyCategory,
        },
        recommendations: generateWasteReductionRecommendations(
          fabricWastePercentage,
          supplyWastePercentage,
          wastefulFabrics,
          wastefulSupplies
        ),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update waste tracking for a product
// @route   PUT /api/inventory/waste/:productId
// @access  Private (Supplier only)
exports.updateWaste = async (req, res) => {
  try {
    const { productType, wasteAmount, wastePercentage } = req.body; // productType: "fabric" or "supply"

    let product;
    if (productType === "fabric") {
      product = await Fabric.findById(req.params.productId);
    } else if (productType === "supply") {
      product = await Supply.findById(req.params.productId);
    } else {
      return res.status(400).json({ message: "Invalid product type" });
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!product.wasteTracking) {
      product.wasteTracking = {};
    }

    if (wasteAmount !== undefined) {
      product.wasteTracking.totalWaste = Math.max(0, wasteAmount);
    }

    if (wastePercentage !== undefined) {
      product.wasteTracking.wastePercentage = Math.max(0, Math.min(100, wastePercentage));
    } else if (product.stockQuantity !== undefined) {
      const total = product.stockQuantity + (product.wasteTracking.totalWaste || 0);
      if (total > 0) {
        product.wasteTracking.wastePercentage =
          ((product.wasteTracking.totalWaste || 0) / total) * 100;
      }
    }

    product.wasteTracking.lastWasteUpdate = new Date();

    await product.save();

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

function generateWasteReductionRecommendations(
  fabricWastePercentage,
  supplyWastePercentage,
  wastefulFabrics,
  wastefulSupplies
) {
  const recommendations = [];

  if (fabricWastePercentage > 10) {
    recommendations.push({
      priority: "High",
      category: "Fabric",
      issue: "High fabric waste percentage",
      recommendation: "Review ordering patterns and consider smaller batch sizes for low-demand fabrics",
      action: "Analyze sales patterns and adjust inventory levels accordingly",
    });
  }

  if (supplyWastePercentage > 10) {
    recommendations.push({
      priority: "High",
      category: "Supplies",
      issue: "High supply waste percentage",
      recommendation: "Implement better inventory management and reduce overstocking",
      action: "Set up automated reorder points based on actual consumption",
    });
  }

  if (wastefulFabrics.length > 0) {
    recommendations.push({
      priority: "Medium",
      category: "Fabric",
      issue: `${wastefulFabrics.length} fabrics with high waste`,
      recommendation: "Consider discontinuing or reducing stock of high-waste items",
      action: "Review top wasteful fabrics and adjust inventory strategy",
    });
  }

  if (wastefulSupplies.length > 0) {
    recommendations.push({
      priority: "Medium",
      category: "Supplies",
      issue: `${wastefulSupplies.length} supplies with high waste`,
      recommendation: "Review supply ordering patterns and negotiate better return policies",
      action: "Contact suppliers about return or exchange options for slow-moving items",
    });
  }

  if (fabricWastePercentage < 5 && supplyWastePercentage < 5) {
    recommendations.push({
      priority: "Low",
      category: "General",
      issue: "Waste levels are well managed",
      recommendation: "Continue current inventory management practices",
      action: "Maintain regular waste tracking and monitoring",
    });
  }

  return recommendations;
}

