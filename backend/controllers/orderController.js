const Order = require("../models/Order");
const Measurement = require("../models/Measurement");
const User = require("../models/User");
const { assignBadges } = require("../utils/badgeAssignment");

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      tailor,
      serviceType,
      garmentType,
      quantity,
      description,
      measurements,
      consultationDate,
      basePrice,
      fabricCost,
      additionalCharges,
      discount,
      totalPrice,
      estimatedCompletionDate,
    } = req.body;

    // Validation
    if (!tailor || !serviceType || !garmentType || !basePrice) {
      return res.status(400).json({
        message: "Please provide tailor, service type, garment type, and base price",
      });
    }

    // Verify tailor exists and is active
    const tailorUser = await User.findById(tailor);
    if (!tailorUser || tailorUser.role !== "tailor" || !tailorUser.isActive) {
      return res.status(400).json({ message: "Invalid tailor" });
    }

    const orderQuantity = quantity || 1;
    const calculatedTotalPrice = totalPrice || (
      (basePrice || 0) * orderQuantity +
      (fabricCost || 0) +
      (additionalCharges || 0) -
      (discount || 0)
    );

    const order = await Order.create({
      customer: req.user._id,
      tailor,
      serviceType,
      garmentType,
      quantity: orderQuantity,
      description,
      measurements,
      consultationDate,
      basePrice,
      fabricCost,
      additionalCharges,
      discount,
      totalPrice,
      estimatedCompletionDate,
      timeline: [
        {
          status: "pending",
          description: "Order created",
          updatedBy: req.user._id,
        },
      ],
    });

    // Update tailor's total orders
    await User.findByIdAndUpdate(tailor, {
      $inc: { totalOrders: 1 },
    });

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders for user
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    const { status, role } = req.query;
    let filter = {};

    if (req.user.role === "customer") {
      filter.customer = req.user._id;
    } else if (req.user.role === "tailor") {
      filter.tailor = req.user._id;
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate("customer", "name email phone avatar")
      .populate("tailor", "name email phone shopName avatar")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer", "name email phone avatar address")
      .populate("tailor", "name email phone shopName avatar address")
      .populate("measurements")
      .populate("fabricDetails.supplier", "name businessName");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    if (
      order.customer._id.toString() !== req.user._id.toString() &&
      order.tailor._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
exports.updateOrder = async (req, res) => {
  try {
    const { fabricCost, additionalCharges, discount, totalPrice } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only tailor can update pricing
    if (order.tailor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    if (fabricCost !== undefined) order.fabricCost = fabricCost;
    if (additionalCharges !== undefined) order.additionalCharges = additionalCharges;
    if (discount !== undefined) order.discount = discount;
    if (totalPrice !== undefined) order.totalPrice = totalPrice;

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Authorization check
    const isAuthorized =
      order.customer.toString() === req.user._id.toString() ||
      order.tailor.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Status-specific validations
    if (status === "completed") {
      order.actualCompletionDate = new Date();
      const tailor = await User.findById(order.tailor);
      if (tailor) {
        tailor.completedOrders = (tailor.completedOrders || 0) + 1;
        tailor.totalOrders = tailor.totalOrders || 0;
        
        // Calculate completion rate
        if (tailor.totalOrders > 0) {
          tailor.completionRate = (tailor.completedOrders / tailor.totalOrders) * 100;
        }
        
        await tailor.save();
        
        // Assign badges based on performance
        await assignBadges(order.tailor);
      }
    }

    if (status) {
      order.status = status;
    }

    if (notes) {
      order.timeline.push({
        status: order.status,
        description: notes,
        updatedBy: req.user._id,
      });
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add revision request
// @route   POST /api/orders/:id/revisions
// @access  Private
exports.addRevision = async (req, res) => {
  try {
    const { description } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only customer can request revisions
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only customer can request revisions" });
    }

    const revisionNumber = order.currentRevision + 1;

    order.revisions.push({
      revisionNumber,
      requestedBy: "customer",
      description,
      status: "pending",
    });

    order.currentRevision = revisionNumber;
    order.status = "revision_requested";

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update fabric selection
// @route   PUT /api/orders/:id/fabric
// @access  Private
exports.updateFabric = async (req, res) => {
  try {
    const { fabricType, color, quantity, supplier } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only tailor can update fabric
    if (order.tailor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only tailor can update fabric selection" });
    }

    order.fabricDetails = {
      fabricType,
      color,
      quantity,
      supplier,
    };
    order.fabricSelected = true;
    order.status = "fabric_selected";

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add message to order
// @route   POST /api/orders/:id/messages
// @access  Private
exports.addMessage = async (req, res) => {
  try {
    const { message, attachments } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isAuthorized =
      order.customer.toString() === req.user._id.toString() ||
      order.tailor.toString() === req.user._id.toString();

    if (!isAuthorized) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.messages.push({
      sender: req.user._id,
      message,
      attachments: attachments || [],
    });

    const updatedOrder = await order.save();

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

