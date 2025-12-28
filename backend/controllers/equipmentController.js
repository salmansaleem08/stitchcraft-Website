const Equipment = require("../models/Equipment");
const EquipmentRental = require("../models/EquipmentRental");
const User = require("../models/User");

// @desc    Get all equipment
// @route   GET /api/equipment
// @access  Public
exports.getEquipment = async (req, res) => {
  try {
    const {
      category,
      isAvailableForRental,
      isAvailableForSale,
      condition,
      minPrice,
      maxPrice,
      city,
      search,
      sort = "newest",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = { isActive: true };

    if (category) filter.category = category;
    if (isAvailableForRental === "true") filter.isAvailableForRental = true;
    if (isAvailableForSale === "true") filter.isAvailableForSale = true;
    if (condition) filter.condition = condition;
    if (city) filter["location.city"] = new RegExp(city, "i");
    if (search) {
      filter.$or = [
        { name: new RegExp(search, "i") },
        { brand: new RegExp(search, "i") },
        { model: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    if (minPrice || maxPrice) {
      filter.$or = [
        { rentalPrice: {} },
        { salePrice: {} },
      ];
      if (minPrice) {
        filter.$or[0].rentalPrice.$gte = parseFloat(minPrice);
        filter.$or[1].salePrice.$gte = parseFloat(minPrice);
      }
      if (maxPrice) {
        filter.$or[0].rentalPrice.$lte = parseFloat(maxPrice);
        filter.$or[1].salePrice.$lte = parseFloat(maxPrice);
      }
    }

    const sortOptions = {};
    if (sort === "price_low") {
      sortOptions.rentalPrice = 1;
    } else if (sort === "price_high") {
      sortOptions.rentalPrice = -1;
    } else if (sort === "rating") {
      sortOptions.rating = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const equipment = await Equipment.find(filter)
      .populate("owner", "name businessName qualityRating verificationStatus location")
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Equipment.countDocuments(filter);

    res.json({
      success: true,
      count: equipment.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: equipment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single equipment
// @route   GET /api/equipment/:id
// @access  Public
exports.getEquipmentById = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate("owner", "name businessName qualityRating verificationStatus location phone email");

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    res.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create equipment listing
// @route   POST /api/equipment
// @access  Private
exports.createEquipment = async (req, res) => {
  try {
    const equipment = new Equipment({
      ...req.body,
      owner: req.user._id,
    });

    await equipment.save();
    await equipment.populate("owner", "name businessName");

    res.status(201).json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update equipment
// @route   PUT /api/equipment/:id
// @access  Private
exports.updateEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    if (equipment.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    Object.assign(equipment, req.body);
    await equipment.save();
    await equipment.populate("owner", "name businessName");

    res.json({
      success: true,
      data: equipment,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete equipment
// @route   DELETE /api/equipment/:id
// @access  Private
exports.deleteEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    if (equipment.owner.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await equipment.deleteOne();

    res.json({
      success: true,
      message: "Equipment deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request equipment rental
// @route   POST /api/equipment/:id/rent
// @access  Private
exports.requestRental = async (req, res) => {
  try {
    const { startDate, endDate, rentalPeriod, pickupAddress } = req.body;

    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: "Equipment not found" });
    }

    if (!equipment.isAvailableForRental) {
      return res.status(400).json({ message: "Equipment is not available for rental" });
    }

    if (equipment.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot rent your own equipment" });
    }

    // Check for overlapping rentals
    const existingRentals = await EquipmentRental.find({
      equipment: equipment._id,
      status: { $in: ["pending", "approved", "active"] },
      $or: [
        {
          startDate: { $lte: new Date(endDate) },
          endDate: { $gte: new Date(startDate) },
        },
      ],
    });

    if (existingRentals.length > 0) {
      return res.status(400).json({ message: "Equipment is already rented for the selected dates" });
    }

    // Calculate rental amount
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const dailyRate = equipment.rentalPrice || 0;
    const totalAmount = days * dailyRate;
    const deposit = totalAmount * 0.2; // 20% deposit

    const rental = new EquipmentRental({
      equipment: equipment._id,
      renter: req.user._id,
      owner: equipment.owner,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      rentalPeriod: rentalPeriod || "daily",
      dailyRate,
      totalAmount,
      deposit,
      pickupAddress,
      conditionAtRental: equipment.condition,
      timeline: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Rental request submitted",
          updatedBy: req.user._id,
        },
      ],
    });

    await rental.save();
    await rental.populate("equipment", "name category brand model");
    await rental.populate("renter", "name email phone");
    await rental.populate("owner", "name businessName email phone");

    res.status(201).json({
      success: true,
      data: rental,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get equipment rentals
// @route   GET /api/equipment/rentals
// @access  Private
exports.getRentals = async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};

    if (req.user.role === "tailor" || req.user.role === "customer") {
      filter.renter = req.user._id;
    } else {
      filter.owner = req.user._id;
    }

    if (status) {
      filter.status = status;
    }

    const rentals = await EquipmentRental.find(filter)
      .populate("equipment", "name category brand model images")
      .populate("renter", "name email phone")
      .populate("owner", "name businessName email phone")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: rentals.length,
      data: rentals,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update rental status
// @route   PUT /api/equipment/rentals/:id/status
// @access  Private
exports.updateRentalStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const rental = await EquipmentRental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    // Check authorization
    const isOwner = rental.owner.toString() === req.user._id.toString();
    const isRenter = rental.renter.toString() === req.user._id.toString();

    if (!isOwner && !isRenter && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Status transitions
    if (status === "approved" && !isOwner) {
      return res.status(403).json({ message: "Only owner can approve rentals" });
    }

    if (status === "cancelled" && !isOwner && !isRenter) {
      return res.status(403).json({ message: "Not authorized to cancel" });
    }

    rental.status = status;

    if (status === "active") {
      rental.timeline.push({
        status: "active",
        timestamp: new Date(),
        note: notes || "Rental started",
        updatedBy: req.user._id,
      });
    } else if (status === "returned" || status === "completed") {
      rental.timeline.push({
        status: status,
        timestamp: new Date(),
        note: notes || `Rental ${status}`,
        updatedBy: req.user._id,
      });
    } else {
      rental.timeline.push({
        status: status,
        timestamp: new Date(),
        note: notes || `Status updated to ${status}`,
        updatedBy: req.user._id,
      });
    }

    await rental.save();

    res.json({
      success: true,
      data: rental,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

