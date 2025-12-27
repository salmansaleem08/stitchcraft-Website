const SupplyOrder = require("../models/SupplyOrder");
const BulkOrder = require("../models/BulkOrder");
const SampleOrder = require("../models/SampleOrder");
const Fabric = require("../models/Fabric");
const Supply = require("../models/Supply");
const SupplyReview = require("../models/SupplyReview");
const User = require("../models/User");

// @desc    Get supplier analytics overview
// @route   GET /api/analytics/overview
// @access  Private (Supplier only)
exports.getAnalyticsOverview = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(403).json({ message: "Only suppliers can access analytics" });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get all orders
    const [supplyOrders, bulkOrders, sampleOrders] = await Promise.all([
      SupplyOrder.find({ supplier: req.user._id }),
      BulkOrder.find({ supplier: req.user._id }),
      SampleOrder.find({ supplier: req.user._id }),
    ]);

    // Calculate total revenue
    const totalRevenue =
      supplyOrders.reduce((sum, order) => sum + (order.finalPrice || 0), 0) +
      bulkOrders.reduce((sum, order) => sum + (order.finalPrice || 0), 0) +
      sampleOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Monthly revenue
    const monthlyRevenue =
      supplyOrders
        .filter((order) => order.createdAt >= startOfMonth)
        .reduce((sum, order) => sum + (order.finalPrice || 0), 0) +
      bulkOrders
        .filter((order) => order.createdAt >= startOfMonth)
        .reduce((sum, order) => sum + (order.finalPrice || 0), 0) +
      sampleOrders
        .filter((order) => order.createdAt >= startOfMonth)
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Last month revenue
    const lastMonthRevenue =
      supplyOrders
        .filter(
          (order) =>
            order.createdAt >= startOfLastMonth && order.createdAt <= endOfLastMonth
        )
        .reduce((sum, order) => sum + (order.finalPrice || 0), 0) +
      bulkOrders
        .filter(
          (order) =>
            order.createdAt >= startOfLastMonth && order.createdAt <= endOfLastMonth
        )
        .reduce((sum, order) => sum + (order.finalPrice || 0), 0) +
      sampleOrders
        .filter(
          (order) =>
            order.createdAt >= startOfLastMonth && order.createdAt <= endOfLastMonth
        )
        .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Total orders
    const totalOrders = supplyOrders.length + bulkOrders.length + sampleOrders.length;

    // Monthly orders
    const monthlyOrders =
      supplyOrders.filter((order) => order.createdAt >= startOfMonth).length +
      bulkOrders.filter((order) => order.createdAt >= startOfMonth).length +
      sampleOrders.filter((order) => order.createdAt >= startOfMonth).length;

    // Get products
    const [fabrics, supplies] = await Promise.all([
      Fabric.find({ supplier: req.user._id }),
      Supply.find({ supplier: req.user._id }),
    ]);

    const totalProducts = fabrics.length + supplies.length;
    const activeProducts =
      fabrics.filter((f) => f.isActive).length + supplies.filter((s) => s.isActive).length;

    // Calculate inventory value and left items
    const totalInventoryValue =
      fabrics.reduce((sum, f) => sum + (f.stockQuantity || 0) * (f.pricePerMeter || 0), 0) +
      supplies.reduce((sum, s) => sum + (s.stockQuantity || 0) * (s.price || 0), 0);

    const totalItemsLeft =
      fabrics.reduce((sum, f) => sum + (f.stockQuantity || 0), 0) +
      supplies.reduce((sum, s) => sum + (s.stockQuantity || 0), 0);

    // Calculate profit (revenue - cost, assuming 30% margin for now)
    const estimatedCost = totalRevenue * 0.7;
    const estimatedProfit = totalRevenue - estimatedCost;

    // Get reviews
    const reviews = await SupplyReview.find({ supplier: req.user._id });
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Revenue growth
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : monthlyRevenue > 0
        ? 100
        : 0;

    res.json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          lastMonth: lastMonthRevenue,
          growth: Math.round(revenueGrowth * 10) / 10,
        },
        orders: {
          total: totalOrders,
          monthly: monthlyOrders,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
        },
        reviews: {
          total: reviews.length,
          averageRating: Math.round(averageRating * 10) / 10,
        },
        totalInventoryValue,
        totalItemsLeft,
        estimatedProfit: Math.round(estimatedProfit * 10) / 10,
        estimatedCost: Math.round(estimatedCost * 10) / 10,
        totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get revenue trends
// @route   GET /api/analytics/revenue-trends
// @access  Private (Supplier only)
exports.getRevenueTrends = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(403).json({ message: "Only suppliers can access analytics" });
    }

    const { period = "monthly", months = 6 } = req.query;

    const now = new Date();
    const data = [];

    if (period === "monthly") {
      for (let i = parseInt(months) - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

        const [supplyOrders, bulkOrders, sampleOrders] = await Promise.all([
          SupplyOrder.find({
            supplier: req.user._id,
            createdAt: { $gte: monthStart, $lte: monthEnd },
          }),
          BulkOrder.find({
            supplier: req.user._id,
            createdAt: { $gte: monthStart, $lte: monthEnd },
          }),
          SampleOrder.find({
            supplier: req.user._id,
            createdAt: { $gte: monthStart, $lte: monthEnd },
          }),
        ]);

        const revenue =
          supplyOrders.reduce((sum, order) => sum + (order.finalPrice || 0), 0) +
          bulkOrders.reduce((sum, order) => sum + (order.finalPrice || 0), 0) +
          sampleOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        data.push({
          period: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          revenue: revenue,
          orders: supplyOrders.length + bulkOrders.length + sampleOrders.length,
        });
      }
    } else if (period === "weekly") {
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - i * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const [supplyOrders, bulkOrders, sampleOrders] = await Promise.all([
          SupplyOrder.find({
            supplier: req.user._id,
            createdAt: { $gte: weekStart, $lte: weekEnd },
          }),
          BulkOrder.find({
            supplier: req.user._id,
            createdAt: { $gte: weekStart, $lte: weekEnd },
          }),
          SampleOrder.find({
            supplier: req.user._id,
            createdAt: { $gte: weekStart, $lte: weekEnd },
          }),
        ]);

        const revenue =
          supplyOrders.reduce((sum, order) => sum + (order.finalPrice || 0), 0) +
          bulkOrders.reduce((sum, order) => sum + (order.finalPrice || 0), 0) +
          sampleOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        data.push({
          period: `Week ${8 - i}`,
          revenue: revenue,
          orders: supplyOrders.length + bulkOrders.length + sampleOrders.length,
        });
      }
    }

    res.json({
      success: true,
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get top products
// @route   GET /api/analytics/top-products
// @access  Private (Supplier only)
exports.getTopProducts = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(403).json({ message: "Only suppliers can access analytics" });
    }

    const { limit = 10, type = "all" } = req.query;

    // Get all orders
    const [supplyOrders, bulkOrders] = await Promise.all([
      SupplyOrder.find({ supplier: req.user._id }),
      BulkOrder.find({ supplier: req.user._id }),
    ]);

    // Aggregate product sales
    const productSales = {};

    // Process supply orders
    supplyOrders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.supply.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            type: "supply",
            quantity: 0,
            revenue: 0,
            orders: 0,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.subtotal;
        productSales[productId].orders += 1;
      });
    });

    // Process bulk orders (fabrics)
    bulkOrders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.fabric.toString();
        if (!productSales[productId]) {
          productSales[productId] = {
            id: productId,
            type: "fabric",
            quantity: 0,
            revenue: 0,
            orders: 0,
          };
        }
        productSales[productId].quantity += item.quantity;
        productSales[productId].revenue += item.price * item.quantity;
        productSales[productId].orders += 1;
      });
    });

    // Get product details and sort
    const topProducts = await Promise.all(
      Object.values(productSales)
        .filter((p) => type === "all" || p.type === type)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, parseInt(limit))
        .map(async (product) => {
          let productDoc;
          if (product.type === "supply") {
            productDoc = await Supply.findById(product.id);
          } else {
            productDoc = await Fabric.findById(product.id);
          }

          return {
            ...product,
            name: productDoc?.name || "Unknown",
            category: productDoc?.category || productDoc?.fabricType || "N/A",
            image: productDoc?.images?.[0] || null,
          };
        })
    );

    res.json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order statistics
// @route   GET /api/analytics/order-stats
// @access  Private (Supplier only)
exports.getOrderStats = async (req, res) => {
  try {
    const supplier = await User.findById(req.user._id);

    if (!supplier || supplier.role !== "supplier") {
      return res.status(403).json({ message: "Only suppliers can access analytics" });
    }

    const [supplyOrders, bulkOrders, sampleOrders] = await Promise.all([
      SupplyOrder.find({ supplier: req.user._id }),
      BulkOrder.find({ supplier: req.user._id }),
      SampleOrder.find({ supplier: req.user._id }),
    ]);

    const allOrders = [
      ...supplyOrders.map((o) => ({ ...o.toObject(), type: "supply" })),
      ...bulkOrders.map((o) => ({ ...o.toObject(), type: "bulk" })),
      ...sampleOrders.map((o) => ({ ...o.toObject(), type: "sample" })),
    ];

    // Status distribution
    const statusDistribution = {};
    allOrders.forEach((order) => {
      const status = order.status;
      statusDistribution[status] = (statusDistribution[status] || 0) + 1;
    });

    // Average order value
    const totalRevenue = allOrders.reduce((sum, order) => {
      return sum + (order.finalPrice || order.totalPrice || 0);
    }, 0);
    const averageOrderValue = allOrders.length > 0 ? totalRevenue / allOrders.length : 0;

    // Orders by type
    const ordersByType = {
      supply: supplyOrders.length,
      bulk: bulkOrders.length,
      sample: sampleOrders.length,
    };

    res.json({
      success: true,
      data: {
        total: allOrders.length,
        statusDistribution,
        averageOrderValue: Math.round(averageOrderValue * 10) / 10,
        ordersByType,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

