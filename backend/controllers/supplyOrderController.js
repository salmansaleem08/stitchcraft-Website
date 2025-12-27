const SupplyOrder = require("../models/SupplyOrder");
const Supply = require("../models/Supply");
const User = require("../models/User");

// @desc    Create supply order
// @route   POST /api/supply-orders
// @access  Private (Customer only)
exports.createSupplyOrder = async (req, res) => {
  try {
    const customer = await User.findById(req.user._id);

    if (!customer || customer.role !== "customer") {
      return res.status(403).json({ message: "Only customers can create orders" });
    }

    const { supplier, items, shippingAddress, notes } = req.body;

    if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Supplier and items are required" });
    }

    // Verify supplier exists
    const supplierDoc = await User.findById(supplier);
    if (!supplierDoc || supplierDoc.role !== "supplier") {
      return res.status(404).json({ message: "Supplier not found" });
    }

    let totalPrice = 0;
    const orderItems = [];

    // Process each item
    for (const item of items) {
      const supply = await Supply.findById(item.supply);
      if (!supply) {
        return res.status(404).json({ message: `Supply ${item.supply} not found` });
      }

      if (supply.supplier.toString() !== supplier.toString()) {
        return res.status(400).json({ message: "All supplies must be from the same supplier" });
      }

      if (!supply.isActive) {
        return res.status(400).json({ message: `Supply ${supply.name} is not available` });
      }

      if (supply.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${supply.name}. Available: ${supply.stockQuantity}`,
        });
      }

      if (item.quantity < supply.minimumOrderQuantity) {
        return res.status(400).json({
          message: `Minimum order quantity for ${supply.name} is ${supply.minimumOrderQuantity}`,
        });
      }

      const price = supply.price;
      const subtotal = price * item.quantity;

      orderItems.push({
        supply: supply._id,
        quantity: item.quantity,
        unit: supply.unit,
        price: price,
        subtotal: subtotal,
      });

      totalPrice += subtotal;
    }

    // Calculate discount if bulk discount is enabled
    let discount = 0;
    let finalPrice = totalPrice;

    // Check for bulk discounts (if implemented per supplier)
    // For now, we'll use the total quantity to determine discounts
    const totalQuantity = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    // Create order
    const order = await SupplyOrder.create({
      customer: req.user._id,
      supplier: supplier,
      items: orderItems,
      totalPrice: totalPrice,
      discount: discount,
      finalPrice: finalPrice,
      shippingAddress: shippingAddress,
      notes: notes || "",
      status: "pending",
      timeline: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Order placed",
        },
      ],
    });

    // Update stock quantities
    for (const item of items) {
      const supply = await Supply.findById(item.supply);
      supply.stockQuantity = Math.max(0, supply.stockQuantity - item.quantity);
      supply.totalOrders = (supply.totalOrders || 0) + 1;
      await supply.save();
    }

    const populatedOrder = await SupplyOrder.findById(order._id)
      .populate("customer", "name email phone")
      .populate("supplier", "name businessName email phone")
      .populate("items.supply", "name category brand price unit");

    res.status(201).json({
      success: true,
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get supply orders
// @route   GET /api/supply-orders
// @access  Private
exports.getSupplyOrders = async (req, res) => {
  try {
    const { role, _id } = req.user;
    let filter = {};

    if (role === "customer") {
      filter.customer = _id;
    } else if (role === "supplier") {
      filter.supplier = _id;
    }

    const { status, page = 1, limit = 20 } = req.query;

    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await SupplyOrder.find(filter)
      .populate("customer", "name email phone")
      .populate("supplier", "name businessName email phone")
      .populate("items.supply", "name category brand price unit images")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SupplyOrder.countDocuments(filter);

    res.json({
      success: true,
      count: orders.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single supply order
// @route   GET /api/supply-orders/:id
// @access  Private
exports.getSupplyOrder = async (req, res) => {
  try {
    const order = await SupplyOrder.findById(req.params.id)
      .populate("customer", "name email phone address")
      .populate("supplier", "name businessName email phone address")
      .populate("items.supply", "name category brand price unit images description");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const { role, _id } = req.user;
    if (
      (role === "customer" && order.customer._id.toString() !== _id.toString()) ||
      (role === "supplier" && order.supplier._id.toString() !== _id.toString())
    ) {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update supply order status
// @route   PUT /api/supply-orders/:id/status
// @access  Private (Supplier only for status updates, Customer for cancellation)
exports.updateSupplyOrderStatus = async (req, res) => {
  try {
    const order = await SupplyOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const { status, trackingNumber, note } = req.body;
    const { role, _id } = req.user;

    // Authorization check
    if (role === "supplier" && order.supplier.toString() !== _id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (role === "customer" && order.customer.toString() !== _id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Status transition validation
    const validTransitions = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["booked", "cancelled"],
      booked: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["on_way", "cancelled"],
      on_way: ["delivered", "cancelled"],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${order.status} to ${status}`,
      });
    }

    // Handle cancellation - restore stock
    if (status === "cancelled" && order.status !== "cancelled") {
      for (const item of order.items) {
        const supply = await Supply.findById(item.supply);
        if (supply) {
          supply.stockQuantity = (supply.stockQuantity || 0) + item.quantity;
          await supply.save();
        }
      }
    }

    order.status = status;
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    // Add timeline entry
    order.timeline.push({
      status: status,
      timestamp: new Date(),
      note: note || `Status changed to ${status}`,
    });

    await order.save();

    const populatedOrder = await SupplyOrder.findById(order._id)
      .populate("customer", "name email phone")
      .populate("supplier", "name businessName email phone")
      .populate("items.supply", "name category brand price unit images");

    res.json({
      success: true,
      data: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel supply order
// @route   POST /api/supply-orders/:id/cancel
// @access  Private (Customer only)
exports.cancelSupplyOrder = async (req, res) => {
  try {
    const order = await SupplyOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order is already cancelled" });
    }

    if (["shipped", "delivered"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot cancel order that has been shipped or delivered" });
    }

    // Restore stock
    for (const item of order.items) {
      const supply = await Supply.findById(item.supply);
      if (supply) {
        supply.stockQuantity = (supply.stockQuantity || 0) + item.quantity;
        await supply.save();
      }
    }

    order.status = "cancelled";
    order.timeline.push({
      status: "cancelled",
      timestamp: new Date(),
      note: "Order cancelled by customer",
    });

    await order.save();

    res.json({
      success: true,
      message: "Order cancelled successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

