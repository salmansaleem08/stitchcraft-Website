const Cart = require("../models/Cart");
const Fabric = require("../models/Fabric");
const Supply = require("../models/Supply");
const User = require("../models/User");

// @desc    Get customer cart
// @route   GET /api/cart
// @access  Private (Customer only)
exports.getCart = async (req, res) => {
  try {
    const customer = await User.findById(req.user._id);

    if (!customer || customer.role !== "customer") {
      return res.status(403).json({ message: "Only customers can access cart" });
    }

    let cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      cart = await Cart.create({ customer: req.user._id, items: [] });
    }

    // Manually populate products based on productType
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const ProductModel = item.productType === "fabric" ? Fabric : Supply;
        const product = await ProductModel.findById(item.product);
        const supplier = await User.findById(item.supplier).select("name businessName");
        return {
          ...item.toObject(),
          product: product,
          supplier: supplier,
        };
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems,
    };

    res.json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/items
// @access  Private (Customer only)
exports.addToCart = async (req, res) => {
  try {
    const customer = await User.findById(req.user._id);

    if (!customer || customer.role !== "customer") {
      return res.status(403).json({ message: "Only customers can add to cart" });
    }

    const { productType, productId, quantity } = req.body;

    if (!productType || !productId || !quantity) {
      return res.status(400).json({ message: "Product type, product ID, and quantity are required" });
    }

    if (!["fabric", "supply"].includes(productType)) {
      return res.status(400).json({ message: "Invalid product type" });
    }

    // Get product
    const ProductModel = productType === "fabric" ? Fabric : Supply;
    const product = await ProductModel.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (!product.isActive) {
      return res.status(400).json({ message: "Product is not available" });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stockQuantity}`,
      });
    }

    // Get or create cart
    let cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      cart = await Cart.create({ customer: req.user._id, items: [] });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.productType === productType &&
        item.supplier.toString() === product.supplier.toString()
    );

    if (existingItemIndex > -1) {
      // Update quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productType: productType,
        product: productId,
        supplier: product.supplier,
        quantity: quantity,
        price: productType === "fabric" ? product.pricePerMeter : product.price,
        unit: productType === "fabric" ? product.unit || "meter" : product.unit || "piece",
      });
    }

    await cart.save();

    // Manually populate products based on productType
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const ProductModel = item.productType === "fabric" ? Fabric : Supply;
        const product = await ProductModel.findById(item.product);
        const supplier = await User.findById(item.supplier).select("name businessName");
        return {
          ...item.toObject(),
          product: product,
          supplier: supplier,
        };
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems,
    };

    res.json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/items/:itemId
// @access  Private (Customer only)
exports.updateCartItem = async (req, res) => {
  try {
    const customer = await User.findById(req.user._id);

    if (!customer || customer.role !== "customer") {
      return res.status(403).json({ message: "Only customers can update cart" });
    }

    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Check stock availability
    const ProductModel = item.productType === "fabric" ? Fabric : Supply;
    const product = await ProductModel.findById(item.product);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stockQuantity < quantity) {
      return res.status(400).json({
        message: `Insufficient stock. Available: ${product.stockQuantity}`,
      });
    }

    item.quantity = quantity;
    await cart.save();

    // Manually populate products based on productType
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const ProductModel = item.productType === "fabric" ? Fabric : Supply;
        const product = await ProductModel.findById(item.product);
        const supplier = await User.findById(item.supplier).select("name businessName");
        return {
          ...item.toObject(),
          product: product,
          supplier: supplier,
        };
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems,
    };

    res.json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/items/:itemId
// @access  Private (Customer only)
exports.removeFromCart = async (req, res) => {
  try {
    const customer = await User.findById(req.user._id);

    if (!customer || customer.role !== "customer") {
      return res.status(403).json({ message: "Only customers can remove from cart" });
    }

    const { itemId } = req.params;

    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter((item) => item._id.toString() !== itemId);
    await cart.save();

    // Manually populate products based on productType
    const populatedItems = await Promise.all(
      cart.items.map(async (item) => {
        const ProductModel = item.productType === "fabric" ? Fabric : Supply;
        const product = await ProductModel.findById(item.product);
        const supplier = await User.findById(item.supplier).select("name businessName");
        return {
          ...item.toObject(),
          product: product,
          supplier: supplier,
        };
      })
    );

    const populatedCart = {
      ...cart.toObject(),
      items: populatedItems,
    };

    res.json({
      success: true,
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private (Customer only)
exports.clearCart = async (req, res) => {
  try {
    const customer = await User.findById(req.user._id);

    if (!customer || customer.role !== "customer") {
      return res.status(403).json({ message: "Only customers can clear cart" });
    }

    const cart = await Cart.findOne({ customer: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

