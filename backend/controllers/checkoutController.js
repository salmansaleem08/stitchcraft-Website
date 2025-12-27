const Cart = require("../models/Cart");
const SupplyOrder = require("../models/SupplyOrder");
const BulkOrder = require("../models/BulkOrder");
const Fabric = require("../models/Fabric");
const Supply = require("../models/Supply");
const User = require("../models/User");

// @desc    Create order from cart
// @route   POST /api/checkout
// @access  Private (Customer only)
exports.createOrderFromCart = async (req, res) => {
  try {
    const customer = await User.findById(req.user._id);

    if (!customer || customer.role !== "customer") {
      return res.status(403).json({ message: "Only customers can checkout" });
    }

    const { shippingAddress, notes, supplierId } = req.body;

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.province || !shippingAddress.phone) {
      return res.status(400).json({ message: "Shipping address with phone number is required" });
    }

    // Set default country if not provided
    if (!shippingAddress.country) {
      shippingAddress.country = "Pakistan";
    }

    // Get cart
    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Manually populate cart items
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const ProductModel = item.productType === "fabric" ? Fabric : Supply;
        const product = await ProductModel.findById(item.product);
        return {
          ...item.toObject(),
          product: product,
        };
      })
    );

    // Group items by supplier
    const itemsBySupplier = {};

    for (const item of populatedItems) {
      const supplierId = item.supplier.toString();

      // Filter by supplierId if provided
      if (req.body.supplierId && supplierId !== req.body.supplierId) {
        continue;
      }

      if (!itemsBySupplier[supplierId]) {
        itemsBySupplier[supplierId] = [];
      }

      // Verify product still exists and is available
      const product = item.product;
      if (!product || !product.isActive) {
        return res.status(400).json({
          message: `Product ${product?.name || "Unknown"} is no longer available`,
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`,
        });
      }

      itemsBySupplier[supplierId].push({
        productType: item.productType,
        product: product,
        quantity: item.quantity,
        price: item.price,
        unit: item.unit,
        supplier: item.supplier,
      });
    }

    if (Object.keys(itemsBySupplier).length === 0) {
      return res.status(400).json({ message: "No items found for the selected supplier" });
    }

    const createdOrders = [];

    // Create orders for each supplier
    for (const [supplierId, items] of Object.entries(itemsBySupplier)) {
      let totalPrice = 0;
      const orderItems = [];

      for (const item of items) {
        const subtotal = item.price * item.quantity;
        totalPrice += subtotal;

        if (item.productType === "supply") {
          orderItems.push({
            supply: item.product._id,
            quantity: item.quantity,
            unit: item.unit,
            price: item.price,
            subtotal: subtotal,
          });
        } else {
          // For fabrics, we'll use bulk order
          orderItems.push({
            fabric: item.product._id,
            quantity: item.quantity,
            price: item.price,
          });
        }
      }

      // Create order based on product types
      if (items.some((item) => item.productType === "supply")) {
        // Create supply order
        const order = await SupplyOrder.create({
          customer: req.user._id,
          supplier: supplierId,
          items: orderItems.filter((item) => item.supply),
          totalPrice: totalPrice,
          discount: 0,
          finalPrice: totalPrice,
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

        // Update stock
        for (const item of items) {
          if (item.productType === "supply") {
            const supply = await Supply.findById(item.product._id);
            supply.stockQuantity = Math.max(0, supply.stockQuantity - item.quantity);
            supply.totalOrders = (supply.totalOrders || 0) + 1;
            await supply.save();
          }
        }

        const populatedOrder = await SupplyOrder.findById(order._id)
          .populate("customer", "name email phone")
          .populate("supplier", "name businessName email phone")
          .populate("items.supply", "name category brand price unit");

        createdOrders.push(populatedOrder);
      }

      if (items.some((item) => item.productType === "fabric")) {
        // Create bulk order for fabrics
        const fabricItems = orderItems.filter((item) => item.fabric);
        const fabricTotal = fabricItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        const bulkOrder = await BulkOrder.create({
          customer: req.user._id,
          supplier: supplierId,
          items: fabricItems,
          totalPrice: fabricTotal,
          discount: 0,
          finalPrice: fabricTotal,
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

        // Update stock
        for (const item of items) {
          if (item.productType === "fabric") {
            const fabric = await Fabric.findById(item.product._id);
            fabric.stockQuantity = Math.max(0, fabric.stockQuantity - item.quantity);
            fabric.totalOrders = (fabric.totalOrders || 0) + 1;
            await fabric.save();
          }
        }

        const populatedBulkOrder = await BulkOrder.findById(bulkOrder._id)
          .populate("customer", "name email phone")
          .populate("supplier", "name businessName email phone")
          .populate("items.fabric", "name fabricType color pricePerMeter unit");

        createdOrders.push(populatedBulkOrder);
      }
    }

    // Clear cart after successful order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: createdOrders,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

