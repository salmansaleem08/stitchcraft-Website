const PricingTier = require("../models/PricingTier");
const Package = require("../models/Package");
const User = require("../models/User");

// @desc    Get pricing tiers for a tailor
// @route   GET /api/pricing/tiers/:tailorId
// @access  Public
exports.getPricingTiers = async (req, res) => {
  try {
    const { tailorId } = req.params;

    const tiers = await PricingTier.find({
      tailor: tailorId,
      isActive: true,
    }).sort({ tierType: 1 });

    res.json({
      success: true,
      count: tiers.length,
      data: tiers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update pricing tier
// @route   POST /api/pricing/tiers
// @route   PUT /api/pricing/tiers/:id
// @access  Private (Tailor only)
exports.createPricingTier = async (req, res) => {
  try {
    const tierData = {
      ...req.body,
      tailor: req.user._id,
    };

    const tier = await PricingTier.create(tierData);

    res.status(201).json({
      success: true,
      data: tier,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePricingTier = async (req, res) => {
  try {
    const tier = await PricingTier.findById(req.params.id);

    if (!tier) {
      return res.status(404).json({ message: "Pricing tier not found" });
    }

    if (tier.tailor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedTier = await PricingTier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedTier,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get packages for a tailor (or logged-in tailor if no ID)
// @route   GET /api/pricing/packages/:tailorId?
// @access  Public (or Private for own packages)
exports.getPackages = async (req, res) => {
  try {
    const { tailorId } = req.params;
    const { packageType } = req.query;

    // If no tailorId and user is logged in as tailor, get their packages
    let filterTailor = tailorId;
    if (!tailorId && req.user && req.user.role === "tailor") {
      filterTailor = req.user._id;
    }

    if (!filterTailor) {
      return res.status(400).json({ message: "Tailor ID required" });
    }

    let filter = {
      tailor: filterTailor,
    };

    // For public requests, only show active packages
    if (!req.user || req.user._id.toString() !== filterTailor.toString()) {
      filter.isActive = true;
      // Check if package is still valid
      filter.$or = [
        { validUntil: { $gte: new Date() } },
        { validUntil: null },
      ];
    }

    if (packageType) {
      filter.packageType = packageType;
    }

    const packages = await Package.find(filter).sort({ packagePrice: 1 });

    res.json({
      success: true,
      count: packages.length,
      data: packages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single package
// @route   GET /api/pricing/packages/:id
// @access  Public
exports.getPackage = async (req, res) => {
  try {
    const packageData = await Package.findById(req.params.id).populate(
      "tailor",
      "name shopName avatar"
    );

    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    res.json({
      success: true,
      data: packageData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create package
// @route   POST /api/pricing/packages
// @access  Private (Tailor only)
exports.createPackage = async (req, res) => {
  try {
    const packageData = {
      ...req.body,
      tailor: req.user._id,
    };

    // Calculate discount if not provided
    if (packageData.originalPrice && packageData.packagePrice) {
      if (!packageData.discount && !packageData.discountPercentage) {
        packageData.discount =
          packageData.originalPrice - packageData.packagePrice;
        packageData.discountPercentage =
          (packageData.discount / packageData.originalPrice) * 100;
      }
    }

    const newPackage = await Package.create(packageData);

    res.status(201).json({
      success: true,
      data: newPackage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update package
// @route   PUT /api/pricing/packages/:id
// @access  Private (Tailor only)
exports.updatePackage = async (req, res) => {
  try {
    const packageData = await Package.findById(req.params.id);

    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (packageData.tailor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedPackage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete package
// @route   DELETE /api/pricing/packages/:id
// @access  Private (Tailor only)
exports.deletePackage = async (req, res) => {
  try {
    const packageData = await Package.findById(req.params.id);

    if (!packageData) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (packageData.tailor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Package.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Package deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Calculate package price
// @route   POST /api/pricing/calculate
// @access  Public
exports.calculatePrice = async (req, res) => {
  try {
    const {
      tailorId,
      serviceType,
      garmentType,
      quantity,
      fabricCost,
      additionalServices,
      isBulk,
      isCorporate,
    } = req.body;

    // Get tailor's pricing tier
    const tier = await PricingTier.findOne({
      tailor: tailorId,
      tierType: serviceType,
      isActive: true,
    });

    if (!tier) {
      return res.status(404).json({
        message: "Pricing tier not found for this service type",
      });
    }

    let basePrice = tier.basePrice;

    // Check if garment-specific pricing exists
    if (tier.garmentPricing && tier.garmentPricing.has(garmentType)) {
      basePrice = tier.garmentPricing.get(garmentType);
    }

    // Calculate total base price
    let totalPrice = basePrice * (quantity || 1);

    // Add fabric cost
    if (fabricCost) {
      totalPrice += fabricCost;
    }

    // Add additional services
    if (additionalServices) {
      if (additionalServices.embroidery && tier.additionalCharges.embroidery) {
        totalPrice += tier.additionalCharges.embroidery;
      }
      if (additionalServices.alterations && tier.additionalCharges.alterations) {
        totalPrice += tier.additionalCharges.alterations;
      }
      if (additionalServices.rushOrder && tier.additionalCharges.rushOrder) {
        totalPrice += tier.additionalCharges.rushOrder;
      }
      if (
        additionalServices.customDesign &&
        tier.additionalCharges.customDesign
      ) {
        totalPrice += tier.additionalCharges.customDesign;
      }
    }

    // Apply discounts
    let discount = 0;
    let discountPercentage = 0;

    // Multiple garments discount
    if (
      tier.discounts.multipleGarments.enabled &&
      quantity >= tier.discounts.multipleGarments.threshold
    ) {
      discountPercentage = tier.discounts.multipleGarments.percentage;
      discount = (totalPrice * discountPercentage) / 100;
    }

    // Corporate discount
    if (isCorporate && tier.discounts.corporate.enabled) {
      const corporateDiscount = tier.discounts.corporate.percentage;
      if (corporateDiscount > discountPercentage) {
        discountPercentage = corporateDiscount;
        discount = (totalPrice * discountPercentage) / 100;
      }
    }

    // Seasonal discount
    if (tier.discounts.seasonal.enabled) {
      const now = new Date();
      if (
        now >= tier.discounts.seasonal.startDate &&
        now <= tier.discounts.seasonal.endDate
      ) {
        const seasonalDiscount = tier.discounts.seasonal.percentage;
        if (seasonalDiscount > discountPercentage) {
          discountPercentage = seasonalDiscount;
          discount = (totalPrice * discountPercentage) / 100;
        }
      }
    }

    const finalPrice = totalPrice - discount;

    res.json({
      success: true,
      data: {
        basePrice,
        quantity: quantity || 1,
        fabricCost: fabricCost || 0,
        additionalServices: additionalServices || {},
        subtotal: totalPrice,
        discount,
        discountPercentage,
        finalPrice,
        breakdown: {
          base: basePrice * (quantity || 1),
          fabric: fabricCost || 0,
          additional: totalPrice - basePrice * (quantity || 1) - (fabricCost || 0),
          discount: -discount,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

