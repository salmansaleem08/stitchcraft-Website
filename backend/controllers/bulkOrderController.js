const BulkOrder = require("../models/BulkOrder");
const Fabric = require("../models/Fabric");
const User = require("../models/User");

// @desc    Create bulk order
// @route   POST /api/bulk-orders
// @access  Private (Customer only)
exports.createBulkOrder = async (req, res) => {
  try {
    const { items, shippingAddress, notes, distributionCenter } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Please provide at least one item",
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        message: "Please provide shipping address",
      });
    }

    let subtotal = 0;
    let totalQuantity = 0;
    let supplierId = null;
    const processedItems = [];

    // Process each item
    for (const item of items) {
      const fabric = await Fabric.findById(item.fabric);
      if (!fabric) {
        return res.status(404).json({ message: `Fabric ${item.fabric} not found` });
      }

      if (!fabric.isActive) {
        return res.status(400).json({ message: `Fabric ${fabric.name} is not available` });
      }

      if (fabric.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${fabric.name}. Available: ${fabric.stockQuantity}`,
        });
      }

      // Set supplier (should be same for all items)
      if (!supplierId) {
        supplierId = fabric.supplier;
      } else if (supplierId.toString() !== fabric.supplier.toString()) {
        return res.status(400).json({
          message: "All items must be from the same supplier",
        });
      }

      const pricePerUnit = fabric.pricePerMeter;
      const itemSubtotal = pricePerUnit * item.quantity;
      totalQuantity += item.quantity;

      // Calculate item-level discount based on quantity
      let itemDiscount = 0;
      let itemDiscountPercentage = 0;

      // First check fabric-level bulk discounts
      if (fabric.bulkDiscountEnabled && fabric.bulkDiscountTiers && fabric.bulkDiscountTiers.length > 0) {
        // Sort tiers by minMeters descending to find the best match
        const sortedTiers = [...fabric.bulkDiscountTiers].sort(
          (a, b) => b.minMeters - a.minMeters
        );

        for (const tier of sortedTiers) {
          if (item.quantity >= tier.minMeters) {
            itemDiscountPercentage = tier.discountPercentage;
            itemDiscount = (itemSubtotal * itemDiscountPercentage) / 100;
            break;
          }
        }
      }

      // If no fabric discount, check supplier-level bulk discount tiers
      if (itemDiscount === 0) {
        const supplier = await User.findById(fabric.supplier);
        if (supplier && supplier.bulkDiscountEnabled && supplier.bulkDiscountTiers) {
          // Sort tiers by minQuantity descending to find the best match
          const sortedTiers = [...supplier.bulkDiscountTiers].sort(
            (a, b) => b.minQuantity - a.minQuantity
          );

          for (const tier of sortedTiers) {
            if (item.quantity >= tier.minQuantity) {
              itemDiscountPercentage = tier.discountPercentage;
              itemDiscount = (itemSubtotal * itemDiscountPercentage) / 100;
              break;
            }
          }
        }
      }

      const itemTotal = itemSubtotal - itemDiscount;

      processedItems.push({
        fabric: fabric._id,
        quantity: item.quantity,
        unit: item.unit || fabric.unit || "meter",
        pricePerUnit,
        discount: itemDiscount,
        subtotal: itemTotal,
      });

      subtotal += itemTotal;
    }

    // Calculate bulk order discount (for total order quantity)
    let bulkDiscount = 0;
    let bulkDiscountPercentage = 0;

    const supplier = await User.findById(supplierId);
    if (supplier && supplier.bulkDiscountEnabled && supplier.bulkDiscountTiers) {
      const sortedTiers = [...supplier.bulkDiscountTiers].sort(
        (a, b) => b.minQuantity - a.minQuantity
      );

      for (const tier of sortedTiers) {
        if (totalQuantity >= tier.minQuantity) {
          bulkDiscountPercentage = tier.discountPercentage;
          bulkDiscount = (subtotal * bulkDiscountPercentage) / 100;
          break;
        }
      }
    }

    const shippingCost = 0; // Can be calculated based on address and weight later
    const totalPrice = subtotal - bulkDiscount + shippingCost;

    const bulkOrder = await BulkOrder.create({
      customer: req.user._id,
      supplier: supplierId,
      items: processedItems,
      shippingAddress,
      subtotal,
      bulkDiscount,
      bulkDiscountPercentage,
      shippingCost,
      totalPrice,
      notes,
      distributionCenter,
    });

    res.status(201).json({
      success: true,
      data: bulkOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bulk orders
// @route   GET /api/bulk-orders
// @access  Private
exports.getBulkOrders = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "customer") {
      filter.customer = req.user._id;
    } else if (req.user.role === "supplier") {
      filter.supplier = req.user._id;
    }

    const bulkOrders = await BulkOrder.find(filter)
      .populate("customer", "name email phone")
      .populate("supplier", "name businessName email phone")
      .populate("items.fabric", "name fabricType color images")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bulkOrders.length,
      data: bulkOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single bulk order
// @route   GET /api/bulk-orders/:id
// @access  Private
exports.getBulkOrder = async (req, res) => {
  try {
    const bulkOrder = await BulkOrder.findById(req.params.id)
      .populate("customer", "name email phone address")
      .populate("supplier", "name businessName email phone address distributionCenters")
      .populate("items.fabric", "name fabricType color pricePerMeter images stockQuantity");

    if (!bulkOrder) {
      return res.status(404).json({ message: "Bulk order not found" });
    }

    // Check authorization
    if (
      bulkOrder.customer._id.toString() !== req.user._id.toString() &&
      bulkOrder.supplier._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      data: bulkOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update bulk order status
// @route   PUT /api/bulk-orders/:id/status
// @access  Private (Supplier only)
exports.updateBulkOrderStatus = async (req, res) => {
  try {
    const { status, trackingNumber, notes } = req.body;

    const bulkOrder = await BulkOrder.findById(req.params.id);

    if (!bulkOrder) {
      return res.status(404).json({ message: "Bulk order not found" });
    }

    if (bulkOrder.supplier.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (status) {
      bulkOrder.status = status;

      if (status === "approved") {
        // Reduce stock when order is approved
        for (const item of bulkOrder.items) {
          const fabric = await Fabric.findById(item.fabric);
          if (fabric) {
            fabric.stockQuantity = Math.max(0, fabric.stockQuantity - item.quantity);
            await fabric.save();
          }
        }
      } else if (status === "shipped") {
        bulkOrder.shippedAt = new Date();
        if (trackingNumber) {
          bulkOrder.trackingNumber = trackingNumber;
        }
      } else if (status === "on_way") {
        // On way status
      } else if (status === "delivered") {
        bulkOrder.deliveredAt = new Date();
      }
    }

    // Add timeline entry
    bulkOrder.timeline.push({
      status: bulkOrder.status,
      timestamp: new Date(),
      note: notes || `Status updated to ${status}`,
    });

    const updatedOrder = await bulkOrder.save();

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Cancel bulk order
// @route   PUT /api/bulk-orders/:id/cancel
// @access  Private (Customer only)
exports.cancelBulkOrder = async (req, res) => {
  try {
    const bulkOrder = await BulkOrder.findById(req.params.id);

    if (!bulkOrder) {
      return res.status(404).json({ message: "Bulk order not found" });
    }

    if (bulkOrder.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (["shipped", "delivered"].includes(bulkOrder.status)) {
      return res.status(400).json({
        message: "Cannot cancel order that has been shipped or delivered",
      });
    }

    // Restore stock if order was approved
    if (bulkOrder.status === "approved") {
      for (const item of bulkOrder.items) {
        const fabric = await Fabric.findById(item.fabric);
        if (fabric) {
          fabric.stockQuantity += item.quantity;
          await fabric.save();
        }
      }
    }

    bulkOrder.status = "cancelled";
    bulkOrder.timeline.push({
      status: "cancelled",
      timestamp: new Date(),
      note: "Order cancelled by customer",
    });

    const updatedOrder = await bulkOrder.save();

    res.json({
      success: true,
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

