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
    const { description, images } = req.body;

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
      images: images || [],
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

// @desc    Approve revision request
// @route   PUT /api/orders/:id/revisions/:revisionId/approve
// @access  Private (Tailor only)
exports.approveRevision = async (req, res) => {
  try {
    const { notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only tailor can approve revisions
    if (order.tailor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only tailor can approve revisions" });
    }

    const revision = order.revisions.id(req.params.revisionId);

    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }

    if (revision.status !== "pending") {
      return res.status(400).json({ message: "Revision is not pending" });
    }

    revision.status = "approved";
    revision.approvedAt = new Date();
    revision.approvedBy = req.user._id;
    if (notes) revision.notes = notes;

    order.status = "in_progress";

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject revision request
// @route   PUT /api/orders/:id/revisions/:revisionId/reject
// @access  Private (Tailor only)
exports.rejectRevision = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only tailor can reject revisions
    if (order.tailor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only tailor can reject revisions" });
    }

    const revision = order.revisions.id(req.params.revisionId);

    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }

    if (revision.status !== "pending") {
      return res.status(400).json({ message: "Revision is not pending" });
    }

    revision.status = "rejected";
    revision.rejectedAt = new Date();
    revision.rejectedBy = req.user._id;
    if (rejectionReason) revision.rejectionReason = rejectionReason;

    // If there are other pending revisions, keep status as revision_requested
    const hasPendingRevisions = order.revisions.some(
      (rev) => rev.status === "pending" && rev._id.toString() !== revision._id.toString()
    );

    if (!hasPendingRevisions) {
      // Determine next status based on order state
      if (order.status === "revision_requested") {
        order.status = "in_progress";
      }
    }

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark revision as in progress
// @route   PUT /api/orders/:id/revisions/:revisionId/in-progress
// @access  Private (Tailor only)
exports.startRevision = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only tailor can start revisions
    if (order.tailor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only tailor can start revisions" });
    }

    const revision = order.revisions.id(req.params.revisionId);

    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }

    if (revision.status !== "approved") {
      return res.status(400).json({ message: "Revision must be approved first" });
    }

    revision.status = "in_progress";
    order.status = "in_progress";

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete revision
// @route   PUT /api/orders/:id/revisions/:revisionId/complete
// @access  Private (Tailor only)
exports.completeRevision = async (req, res) => {
  try {
    const { images, notes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only tailor can complete revisions
    if (order.tailor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only tailor can complete revisions" });
    }

    const revision = order.revisions.id(req.params.revisionId);

    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }

    if (revision.status !== "in_progress") {
      return res.status(400).json({ message: "Revision must be in progress" });
    }

    revision.status = "completed";
    revision.completedAt = new Date();
    if (images) revision.images = [...(revision.images || []), ...images];
    if (notes) revision.notes = notes;

    // Check if all revisions are completed
    const allRevisionsCompleted = order.revisions.every(
      (rev) => rev.status === "completed" || rev.status === "rejected"
    );

    if (allRevisionsCompleted) {
      order.status = "quality_check";
    }

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Customer approve completed revision
// @route   PUT /api/orders/:id/revisions/:revisionId/customer-approve
// @access  Private (Customer only)
exports.customerApproveRevision = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only customer can approve completed revisions
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only customer can approve revisions" });
    }

    const revision = order.revisions.id(req.params.revisionId);

    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }

    if (revision.status !== "completed") {
      return res.status(400).json({ message: "Revision must be completed first" });
    }

    revision.status = "customer_approved";
    revision.customerApprovedAt = new Date();

    // Check if all revisions are customer approved
    const allRevisionsApproved = order.revisions.every(
      (rev) =>
        rev.status === "customer_approved" ||
        rev.status === "rejected" ||
        rev.status === "customer_rejected"
    );

    if (allRevisionsApproved && order.status === "quality_check") {
      order.status = "completed";
    }

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Customer reject completed revision
// @route   PUT /api/orders/:id/revisions/:revisionId/customer-reject
// @access  Private (Customer only)
exports.customerRejectRevision = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only customer can reject completed revisions
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only customer can reject revisions" });
    }

    const revision = order.revisions.id(req.params.revisionId);

    if (!revision) {
      return res.status(404).json({ message: "Revision not found" });
    }

    if (revision.status !== "completed") {
      return res.status(400).json({ message: "Revision must be completed first" });
    }

    revision.status = "customer_rejected";
    revision.customerRejectedAt = new Date();
    if (rejectionReason) revision.customerRejectionReason = rejectionReason;

    // Create a new revision request
    const revisionNumber = order.currentRevision + 1;
    order.revisions.push({
      revisionNumber,
      requestedBy: "customer",
      description: rejectionReason || "Previous revision was not satisfactory",
      status: "pending",
    });
    order.currentRevision = revisionNumber;
    order.status = "revision_requested";

    await order.save();

    res.json({
      success: true,
      data: order,
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
      message: message || "",
      attachments: attachments || [],
      read: false,
    });

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("messages.sender", "name avatar");

    res.json({
      success: true,
      data: populatedOrder.messages[populatedOrder.messages.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark message as read
// @route   PUT /api/orders/:id/messages/:messageId/read
// @access  Private
exports.markMessageAsRead = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isTailor = order.tailor.toString() === req.user._id.toString();

    if (!isCustomer && !isTailor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = order.messages.id(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only mark as read if message is not from current user
    if (message.sender.toString() !== req.user._id.toString()) {
      message.read = true;
      message.readAt = new Date();
      await order.save();
    }

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Schedule video consultation
// @route   POST /api/orders/:id/consultation
// @access  Private
exports.scheduleConsultation = async (req, res) => {
  try {
    const { consultationDate, consultationType, consultationLink, consultationDuration, notes } = req.body;

    if (!consultationDate) {
      return res.status(400).json({ message: "Consultation date is required" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization - both customer and tailor can schedule
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isTailor = order.tailor.toString() === req.user._id.toString();

    if (!isCustomer && !isTailor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.consultationDate = new Date(consultationDate);
    order.consultationType = consultationType || "video";
    order.consultationLink = consultationLink || "";
    order.consultationDuration = consultationDuration || 30;
    order.consultationNotes = notes || order.consultationNotes || "";
    order.consultationStatus = "scheduled";
    order.consultationRequestedBy = req.user._id;
    order.consultationRequestedAt = new Date();

    if (order.status === "pending") {
      order.status = "consultation_scheduled";
    }

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update consultation status
// @route   PUT /api/orders/:id/consultation/status
// @access  Private
exports.updateConsultationStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isTailor = order.tailor.toString() === req.user._id.toString();

    if (!isCustomer && !isTailor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.consultationStatus = status;
    if (notes) order.consultationNotes = notes;

    if (status === "completed" && order.status === "consultation_scheduled") {
      order.status = "consultation_completed";
    }

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reschedule consultation
// @route   PUT /api/orders/:id/consultation/reschedule
// @access  Private
exports.rescheduleConsultation = async (req, res) => {
  try {
    const { consultationDate, consultationLink, notes } = req.body;

    if (!consultationDate) {
      return res.status(400).json({ message: "New consultation date is required" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isTailor = order.tailor.toString() === req.user._id.toString();

    if (!isCustomer && !isTailor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    order.consultationDate = new Date(consultationDate);
    if (consultationLink) order.consultationLink = consultationLink;
    if (notes) order.consultationNotes = notes;
    order.consultationStatus = "rescheduled";

    await order.save();

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

