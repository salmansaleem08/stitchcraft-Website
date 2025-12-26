const SampleOrder = require("../models/SampleOrder");
const Fabric = require("../models/Fabric");
const User = require("../models/User");

// @desc    Create sample order
// @route   POST /api/sample-orders
// @access  Private (Customer only)
exports.createSampleOrder = async (req, res) => {
  try {
    const { fabric, quantity, unit, shippingAddress, notes } = req.body;

    // Validation
    if (!fabric || !quantity || !shippingAddress) {
      return res.status(400).json({
        message: "Please provide fabric, quantity, and shipping address",
      });
    }

    if (quantity > 5) {
      return res.status(400).json({
        message: "Sample orders are limited to 5 meters/yards maximum",
      });
    }

    // Verify fabric exists
    const fabricDoc = await Fabric.findById(fabric);
    if (!fabricDoc) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    if (!fabricDoc.isActive) {
      return res.status(400).json({ message: "Fabric is not available" });
    }

    // Get supplier
    const supplier = await User.findById(fabricDoc.supplier);
    if (!supplier || supplier.role !== "supplier") {
      return res.status(400).json({ message: "Invalid supplier" });
    }

    // Calculate price
    const pricePerUnit = fabricDoc.pricePerMeter;
    const price = pricePerUnit * quantity;
    const shippingCost = 0; // Can be calculated based on address later
    const totalPrice = price + shippingCost;

    const sampleOrder = await SampleOrder.create({
      customer: req.user._id,
      supplier: fabricDoc.supplier,
      fabric: fabric,
      quantity,
      unit: unit || fabricDoc.unit || "meter",
      shippingAddress,
      price,
      shippingCost,
      totalPrice,
      notes,
    });

    res.status(201).json({
      success: true,
      data: sampleOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get sample orders
// @route   GET /api/sample-orders
// @access  Private
exports.getSampleOrders = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "customer") {
      filter.customer = req.user._id;
    } else if (req.user.role === "supplier") {
      filter.supplier = req.user._id;
    }

    const sampleOrders = await SampleOrder.find(filter)
      .populate("customer", "name email phone")
      .populate("supplier", "name businessName email phone")
      .populate("fabric", "name fabricType color pricePerMeter images")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: sampleOrders.length,
      data: sampleOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single sample order
// @route   GET /api/sample-orders/:id
// @access  Private
exports.getSampleOrder = async (req, res) => {
  try {
    const sampleOrder = await SampleOrder.findById(req.params.id)
      .populate("customer", "name email phone address")
      .populate("supplier", "name businessName email phone address")
      .populate("fabric", "name fabricType color pricePerMeter images careInstructions");

    if (!sampleOrder) {
      return res.status(404).json({ message: "Sample order not found" });
    }

    // Check authorization
    if (
      sampleOrder.customer._id.toString() !== req.user._id.toString() &&
      sampleOrder.supplier._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      data: sampleOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update sample order status
// @route   PUT /api/sample-orders/:id/status
// @access  Private (Supplier only)
exports.updateSampleOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const sampleOrder = await SampleOrder.findById(req.params.id);

    if (!sampleOrder) {
      return res.status(404).json({ message: "Sample order not found" });
    }

    if (sampleOrder.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status) {
      sampleOrder.status = status;

      if (status === "shipped") {
        sampleOrder.shippedAt = new Date();
        if (trackingNumber) {
          sampleOrder.trackingNumber = trackingNumber;
        }
      } else if (status === "delivered") {
        sampleOrder.deliveredAt = new Date();
      }
    }

    if (notes) {
      sampleOrder.timeline.push({
        status: sampleOrder.status,
        description: notes,
        updatedBy: req.user._id,
      });
    }

    const updatedOrder = await sampleOrder.save();

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel sample order
// @route   PUT /api/sample-orders/:id/cancel
// @access  Private (Customer only)
exports.cancelSampleOrder = async (req, res) => {
  try {
    const sampleOrder = await SampleOrder.findById(req.params.id);

    if (!sampleOrder) {
      return res.status(404).json({ message: "Sample order not found" });
    }

    if (sampleOrder.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (sampleOrder.status === "shipped" || sampleOrder.status === "delivered") {
      return res.status(400).json({
        message: "Cannot cancel order that has been shipped or delivered",
      });
    }

    sampleOrder.status = "cancelled";
    sampleOrder.timeline.push({
      status: "cancelled",
      description: "Order cancelled by customer",
      updatedBy: req.user._id,
    });

    const updatedOrder = await sampleOrder.save();

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

