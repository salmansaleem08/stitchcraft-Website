const Fabric = require("../models/Fabric");
const User = require("../models/User");

// @desc    Get inventory summary for supplier
// @route   GET /api/inventory/summary
// @access  Private (Supplier only)
exports.getInventorySummary = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(403).json({ message: "Only suppliers can access inventory" });
    }

    const fabrics = await Fabric.find({ supplier: req.user._id });

    const summary = {
      totalFabrics: fabrics.length,
      activeFabrics: fabrics.filter((f) => f.isActive).length,
      lowStockFabrics: fabrics.filter((f) => f.stockQuantity < 10 && f.stockQuantity > 0).length,
      outOfStockFabrics: fabrics.filter((f) => f.stockQuantity === 0).length,
      totalStockValue: fabrics.reduce((sum, f) => sum + f.pricePerMeter * f.stockQuantity, 0),
      byType: {},
      byStatus: {
        active: 0,
        inactive: 0,
        featured: 0,
      },
    };

    // Group by fabric type
    fabrics.forEach((fabric) => {
      if (!summary.byType[fabric.fabricType]) {
        summary.byType[fabric.fabricType] = {
          count: 0,
          totalStock: 0,
          totalValue: 0,
        };
      }
      summary.byType[fabric.fabricType].count++;
      summary.byType[fabric.fabricType].totalStock += fabric.stockQuantity || 0;
      summary.byType[fabric.fabricType].totalValue +=
        (fabric.pricePerMeter || 0) * (fabric.stockQuantity || 0);
    });

    // Count by status
    fabrics.forEach((fabric) => {
      if (fabric.isActive) summary.byStatus.active++;
      else summary.byStatus.inactive++;
      if (fabric.isFeatured) summary.byStatus.featured++;
    });

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update fabric stock
// @route   PUT /api/inventory/fabric/:fabricId/stock
// @access  Private (Supplier only)
exports.updateFabricStock = async (req, res) => {
  try {
    const { stockQuantity, operation } = req.body; // operation: 'set', 'add', 'subtract'

    const fabric = await Fabric.findById(req.params.fabricId);

    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    if (fabric.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (operation === "set") {
      fabric.stockQuantity = Math.max(0, stockQuantity);
    } else if (operation === "add") {
      fabric.stockQuantity = Math.max(0, (fabric.stockQuantity || 0) + stockQuantity);
    } else if (operation === "subtract") {
      fabric.stockQuantity = Math.max(0, (fabric.stockQuantity || 0) - stockQuantity);
    } else {
      return res.status(400).json({ message: "Invalid operation. Use 'set', 'add', or 'subtract'" });
    }

    await fabric.save();

    res.json({
      success: true,
      data: fabric,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get low stock fabrics
// @route   GET /api/inventory/low-stock
// @access  Private (Supplier only)
exports.getLowStockFabrics = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    const fabrics = await Fabric.find({
      supplier: req.user._id,
      stockQuantity: { $lte: parseInt(threshold), $gte: 0 },
      isActive: true,
    }).sort({ stockQuantity: 1 });

    res.json({
      success: true,
      count: fabrics.length,
      data: fabrics,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk update stock
// @route   PUT /api/inventory/bulk-update
// @access  Private (Supplier only)
exports.bulkUpdateStock = async (req, res) => {
  try {
    const { updates } = req.body; // Array of { fabricId, stockQuantity, operation }

    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ message: "Please provide updates array" });
    }

    const results = [];

    for (const update of updates) {
      const fabric = await Fabric.findById(update.fabricId);

      if (!fabric) {
        results.push({ fabricId: update.fabricId, success: false, message: "Fabric not found" });
        continue;
      }

      if (fabric.supplier.toString() !== req.user._id.toString()) {
        results.push({
          fabricId: update.fabricId,
          success: false,
          message: "Not authorized",
        });
        continue;
      }

      const operation = update.operation || "set";

      if (operation === "set") {
        fabric.stockQuantity = Math.max(0, update.stockQuantity);
      } else if (operation === "add") {
        fabric.stockQuantity = Math.max(0, (fabric.stockQuantity || 0) + update.stockQuantity);
      } else if (operation === "subtract") {
        fabric.stockQuantity = Math.max(0, (fabric.stockQuantity || 0) - update.stockQuantity);
      }

      await fabric.save();
      results.push({ fabricId: update.fabricId, success: true, stockQuantity: fabric.stockQuantity });
    }

    res.json({
      success: true,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

