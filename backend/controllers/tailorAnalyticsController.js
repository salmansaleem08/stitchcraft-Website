const Order = require("../models/Order");
const Review = require("../models/Review");
const User = require("../models/User");

// @desc    Get tailor analytics overview
// @route   GET /api/analytics/tailor/overview
// @access  Private (Tailor only)
exports.getTailorAnalyticsOverview = async (req, res) => {
  try {
    const tailor = await User.findById(req.user._id);

    if (!tailor || tailor.role !== "tailor") {
      return res.status(403).json({ message: "Only tailors can access analytics" });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get all orders
    const orders = await Order.find({ tailor: req.user._id })
      .populate("customer", "name email");

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Monthly revenue
    const monthlyRevenue = orders
      .filter((order) => order.createdAt >= startOfMonth)
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Last month revenue
    const lastMonthRevenue = orders
      .filter(
        (order) =>
          order.createdAt >= startOfLastMonth && order.createdAt <= endOfLastMonth
      )
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Yearly revenue
    const yearlyRevenue = orders
      .filter((order) => order.createdAt >= startOfYear)
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Total orders
    const totalOrders = orders.length;

    // Monthly orders
    const monthlyOrders = orders.filter((order) => order.createdAt >= startOfMonth).length;

    // Completed orders revenue
    const completedRevenue = orders
      .filter((order) => order.status === "completed")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Pending orders revenue
    const pendingRevenue = orders
      .filter(
        (order) =>
          order.status !== "completed" && order.status !== "cancelled"
      )
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Revenue growth
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : monthlyRevenue > 0
        ? 100
        : 0;

    // Average order value
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Get reviews
    const reviews = await Review.find({ tailor: req.user._id });
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      success: true,
      data: {
        revenue: {
          total: totalRevenue,
          monthly: monthlyRevenue,
          lastMonth: lastMonthRevenue,
          yearly: yearlyRevenue,
          growth: Math.round(revenueGrowth * 10) / 10,
          completed: completedRevenue,
          pending: pendingRevenue,
        },
        orders: {
          total: totalOrders,
          monthly: monthlyOrders,
          completed: orders.filter((o) => o.status === "completed").length,
          pending: orders.filter(
            (o) => o.status !== "completed" && o.status !== "cancelled"
          ).length,
        },
        reviews: {
          total: reviews.length,
          averageRating: Math.round(averageRating * 10) / 10,
        },
        averageOrderValue: Math.round(averageOrderValue * 10) / 10,
        totalCustomers: new Set(orders.map((o) => o.customer.toString())).size,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get earnings reports and projections
// @route   GET /api/analytics/tailor/earnings
// @access  Private (Tailor only)
exports.getEarningsReport = async (req, res) => {
  try {
    const tailor = await User.findById(req.user._id);

    if (!tailor || tailor.role !== "tailor") {
      return res.status(403).json({ message: "Only tailors can access analytics" });
    }

    const { period = "monthly", months = 6 } = req.query;

    const now = new Date();
    const data = [];

    if (period === "monthly") {
      for (let i = parseInt(months) - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

        const orders = await Order.find({
          tailor: req.user._id,
          createdAt: { $gte: monthStart, $lte: monthEnd },
        });

        const revenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const completedRevenue = orders
          .filter((o) => o.status === "completed")
          .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        data.push({
          period: monthStart.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
          revenue: revenue,
          completedRevenue: completedRevenue,
          orders: orders.length,
          completedOrders: orders.filter((o) => o.status === "completed").length,
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

        const orders = await Order.find({
          tailor: req.user._id,
          createdAt: { $gte: weekStart, $lte: weekEnd },
        });

        const revenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
        const completedRevenue = orders
          .filter((o) => o.status === "completed")
          .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        data.push({
          period: `Week ${8 - i}`,
          revenue: revenue,
          completedRevenue: completedRevenue,
          orders: orders.length,
          completedOrders: orders.filter((o) => o.status === "completed").length,
        });
      }
    }

    // Projection based on current month trend
    const currentMonthRevenue = data[data.length - 1]?.revenue || 0;
    const previousMonthRevenue = data[data.length - 2]?.revenue || 0;
    const growthRate = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) 
      : 0;
    
    const projectedNextMonth = currentMonthRevenue * (1 + growthRate);

    res.json({
      success: true,
      data: {
        historical: data,
        projection: {
          nextMonth: Math.round(projectedNextMonth * 10) / 10,
          growthRate: Math.round(growthRate * 100 * 10) / 10,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get customer retention metrics
// @route   GET /api/analytics/tailor/retention
// @access  Private (Tailor only)
exports.getCustomerRetention = async (req, res) => {
  try {
    const tailor = await User.findById(req.user._id);

    if (!tailor || tailor.role !== "tailor") {
      return res.status(403).json({ message: "Only tailors can access analytics" });
    }

    const orders = await Order.find({ tailor: req.user._id })
      .populate("customer", "name email");

    // Group orders by customer
    const customerOrders = {};
    orders.forEach((order) => {
      const customerId = order.customer._id.toString();
      if (!customerOrders[customerId]) {
        customerOrders[customerId] = {
          customer: order.customer,
          orders: [],
          totalSpent: 0,
          firstOrderDate: order.createdAt,
          lastOrderDate: order.createdAt,
        };
      }
      customerOrders[customerId].orders.push(order);
      customerOrders[customerId].totalSpent += order.totalPrice || 0;
      if (order.createdAt < customerOrders[customerId].firstOrderDate) {
        customerOrders[customerId].firstOrderDate = order.createdAt;
      }
      if (order.createdAt > customerOrders[customerId].lastOrderDate) {
        customerOrders[customerId].lastOrderDate = order.createdAt;
      }
    });

    // Calculate retention metrics
    const totalCustomers = Object.keys(customerOrders).length;
    const repeatCustomers = Object.values(customerOrders).filter(
      (c) => c.orders.length > 1
    ).length;
    const retentionRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    // Top customers by orders
    const topCustomersByOrders = Object.values(customerOrders)
      .sort((a, b) => b.orders.length - a.orders.length)
      .slice(0, 10)
      .map((c) => ({
        customer: {
          name: c.customer.name,
          email: c.customer.email,
        },
        orderCount: c.orders.length,
        totalSpent: c.totalSpent,
        firstOrder: c.firstOrderDate,
        lastOrder: c.lastOrderDate,
      }));

    // Top customers by revenue
    const topCustomersByRevenue = Object.values(customerOrders)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10)
      .map((c) => ({
        customer: {
          name: c.customer.name,
          email: c.customer.email,
        },
        orderCount: c.orders.length,
        totalSpent: c.totalSpent,
        firstOrder: c.firstOrderDate,
        lastOrder: c.lastOrderDate,
      }));

    // Customer lifetime value
    const averageLifetimeValue = totalCustomers > 0
      ? Object.values(customerOrders).reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers
      : 0;

    res.json({
      success: true,
      data: {
        totalCustomers,
        repeatCustomers,
        retentionRate: Math.round(retentionRate * 10) / 10,
        averageLifetimeValue: Math.round(averageLifetimeValue * 10) / 10,
        topCustomersByOrders,
        topCustomersByRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get popular service analysis
// @route   GET /api/analytics/tailor/popular-services
// @access  Private (Tailor only)
exports.getPopularServices = async (req, res) => {
  try {
    const tailor = await User.findById(req.user._id);

    if (!tailor || tailor.role !== "tailor") {
      return res.status(403).json({ message: "Only tailors can access analytics" });
    }

    const orders = await Order.find({ tailor: req.user._id });

    // Analyze by service type
    const serviceTypeStats = {};
    orders.forEach((order) => {
      const serviceType = order.serviceType || "unknown";
      if (!serviceTypeStats[serviceType]) {
        serviceTypeStats[serviceType] = {
          count: 0,
          revenue: 0,
          averagePrice: 0,
        };
      }
      serviceTypeStats[serviceType].count += 1;
      serviceTypeStats[serviceType].revenue += order.totalPrice || 0;
    });

    // Calculate averages
    Object.keys(serviceTypeStats).forEach((key) => {
      serviceTypeStats[key].averagePrice =
        serviceTypeStats[key].revenue / serviceTypeStats[key].count;
    });

    // Analyze by garment type
    const garmentTypeStats = {};
    orders.forEach((order) => {
      const garmentType = order.garmentType || "unknown";
      if (!garmentTypeStats[garmentType]) {
        garmentTypeStats[garmentType] = {
          count: 0,
          revenue: 0,
          averagePrice: 0,
        };
      }
      garmentTypeStats[garmentType].count += 1;
      garmentTypeStats[garmentType].revenue += order.totalPrice || 0;
    });

    // Calculate averages
    Object.keys(garmentTypeStats).forEach((key) => {
      garmentTypeStats[key].averagePrice =
        garmentTypeStats[key].revenue / garmentTypeStats[key].count;
    });

    // Sort by count
    const popularServiceTypes = Object.entries(serviceTypeStats)
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        revenue: Math.round(stats.revenue * 10) / 10,
        averagePrice: Math.round(stats.averagePrice * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    const popularGarmentTypes = Object.entries(garmentTypeStats)
      .map(([type, stats]) => ({
        type,
        count: stats.count,
        revenue: Math.round(stats.revenue * 10) / 10,
        averagePrice: Math.round(stats.averagePrice * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        serviceTypes: popularServiceTypes,
        garmentTypes: popularGarmentTypes,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get seasonal demand forecasting
// @route   GET /api/analytics/tailor/seasonal-demand
// @access  Private (Tailor only)
exports.getSeasonalDemand = async (req, res) => {
  try {
    const tailor = await User.findById(req.user._id);

    if (!tailor || tailor.role !== "tailor") {
      return res.status(403).json({ message: "Only tailors can access analytics" });
    }

    const orders = await Order.find({ tailor: req.user._id });

    // Group by month
    const monthlyStats = {};
    orders.forEach((order) => {
      const month = new Date(order.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyStats[month]) {
        monthlyStats[month] = {
          orders: 0,
          revenue: 0,
        };
      }
      monthlyStats[month].orders += 1;
      monthlyStats[month].revenue += order.totalPrice || 0;
    });

    // Group by season
    const seasonalStats = {
      Spring: { orders: 0, revenue: 0, months: [2, 3, 4] },
      Summer: { orders: 0, revenue: 0, months: [5, 6, 7] },
      Fall: { orders: 0, revenue: 0, months: [8, 9, 10] },
      Winter: { orders: 0, revenue: 0, months: [11, 0, 1] },
    };

    orders.forEach((order) => {
      const month = new Date(order.createdAt).getMonth();
      Object.keys(seasonalStats).forEach((season) => {
        if (seasonalStats[season].months.includes(month)) {
          seasonalStats[season].orders += 1;
          seasonalStats[season].revenue += order.totalPrice || 0;
        }
      });
    });

    // Calculate seasonal averages
    const seasonalAverages = Object.entries(seasonalStats).map(([season, stats]) => ({
      season,
      orders: stats.orders,
      revenue: Math.round(stats.revenue * 10) / 10,
      averageRevenue: Math.round((stats.revenue / 3) * 10) / 10, // Average per month in season
    }));

    // Forecast next season based on historical data
    const currentMonth = new Date().getMonth();
    let currentSeason = "Spring";
    if (currentMonth >= 2 && currentMonth <= 4) currentSeason = "Spring";
    else if (currentMonth >= 5 && currentMonth <= 7) currentSeason = "Summer";
    else if (currentMonth >= 8 && currentMonth <= 10) currentSeason = "Fall";
    else currentSeason = "Winter";

    const currentSeasonData = seasonalStats[currentSeason];
    const forecast = {
      season: currentSeason,
      projectedOrders: Math.round(currentSeasonData.orders * 1.1), // 10% growth assumption
      projectedRevenue: Math.round(currentSeasonData.revenue * 1.1),
    };

    res.json({
      success: true,
      data: {
        monthly: Object.entries(monthlyStats).map(([month, stats]) => ({
          month,
          orders: stats.orders,
          revenue: Math.round(stats.revenue * 10) / 10,
        })),
        seasonal: seasonalAverages,
        forecast,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get performance benchmarking
// @route   GET /api/analytics/tailor/benchmarking
// @access  Private (Tailor only)
exports.getPerformanceBenchmarking = async (req, res) => {
  try {
    const tailor = await User.findById(req.user._id);

    if (!tailor || tailor.role !== "tailor") {
      return res.status(403).json({ message: "Only tailors can access analytics" });
    }

    const orders = await Order.find({ tailor: req.user._id });
    const reviews = await Review.find({ tailor: req.user._id });

    // Calculate tailor metrics
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status === "completed").length;
    const completionRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    // Calculate average response time
    let avgResponseTime = tailor.averageResponseTime || 0;
    if (orders.length > 0) {
      const allMessages = orders.flatMap((o) => o.messages || []);
      if (allMessages.length > 1) {
        const responseTimes = [];
        for (let i = 0; i < allMessages.length - 1; i++) {
          const currentMsg = allMessages[i];
          const nextMsg = allMessages[i + 1];
          if (
            currentMsg.sender.toString() !== req.user._id.toString() &&
            nextMsg.sender.toString() === req.user._id.toString()
          ) {
            const timeDiff = new Date(nextMsg.sentAt) - new Date(currentMsg.sentAt);
            responseTimes.push(timeDiff / (1000 * 60 * 60)); // Convert to hours
          }
        }
        if (responseTimes.length > 0) {
          avgResponseTime =
            responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        }
      }
    }

    // Get platform averages (simulated - in real app, this would be calculated from all tailors)
    // For now, using industry benchmarks
    const platformAverages = {
      completionRate: 85, // Industry average
      averageRating: 4.2, // Industry average
      averageResponseTime: 24, // 24 hours
      averageOrderValue: 5000, // PKR
    };

    // Calculate performance vs benchmarks
    const performance = {
      completionRate: {
        value: Math.round(completionRate * 10) / 10,
        benchmark: platformAverages.completionRate,
        status: completionRate >= platformAverages.completionRate ? "above" : "below",
        difference: Math.round((completionRate - platformAverages.completionRate) * 10) / 10,
      },
      averageRating: {
        value: Math.round(averageRating * 10) / 10,
        benchmark: platformAverages.averageRating,
        status: averageRating >= platformAverages.averageRating ? "above" : "below",
        difference: Math.round((averageRating - platformAverages.averageRating) * 10) / 10,
      },
      averageResponseTime: {
        value: Math.round(avgResponseTime * 10) / 10,
        benchmark: platformAverages.averageResponseTime,
        status: avgResponseTime <= platformAverages.averageResponseTime ? "above" : "below",
        difference: Math.round((avgResponseTime - platformAverages.averageResponseTime) * 10) / 10,
      },
      averageOrderValue: {
        value: Math.round(averageOrderValue * 10) / 10,
        benchmark: platformAverages.averageOrderValue,
        status: averageOrderValue >= platformAverages.averageOrderValue ? "above" : "below",
        difference: Math.round((averageOrderValue - platformAverages.averageOrderValue) * 10) / 10,
      },
    };

    res.json({
      success: true,
      data: {
        tailorMetrics: {
          completionRate,
          averageRating,
          averageResponseTime,
          averageOrderValue,
        },
        benchmarks: platformAverages,
        performance,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

