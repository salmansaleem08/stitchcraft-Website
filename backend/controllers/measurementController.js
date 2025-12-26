const Measurement = require("../models/Measurement");
const Order = require("../models/Order");

// @desc    Save measurements
// @route   POST /api/measurements
// @access  Private
exports.saveMeasurements = async (req, res) => {
  try {
    const {
      tailor,
      order,
      garmentType,
      measurementType,
      measurements,
      recommendedSize,
      sizeAdjustments,
      notes,
      photos,
    } = req.body;

    if (!garmentType || !measurements) {
      return res.status(400).json({
        message: "Please provide garment type and measurements",
      });
    }

    const measurementData = {
      customer: req.user._id,
      tailor: tailor || null,
      order: order || null,
      garmentType,
      measurementType: measurementType || "standard",
      measurements,
      recommendedSize,
      sizeAdjustments,
      notes,
      photos: photos || [],
    };

    const measurement = await Measurement.create(measurementData);

    // If linked to an order, update the order
    if (order) {
      await Order.findByIdAndUpdate(order, {
        measurements: measurement._id,
      });
    }

    res.status(201).json({
      success: true,
      data: measurement,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get measurement history
// @route   GET /api/measurements
// @access  Private
exports.getMeasurements = async (req, res) => {
  try {
    const { tailor, garmentType } = req.query;
    let filter = { customer: req.user._id };

    if (tailor) {
      filter.tailor = tailor;
    }

    if (garmentType) {
      filter.garmentType = garmentType;
    }

    const measurements = await Measurement.find(filter)
      .populate("tailor", "name shopName")
      .populate("order", "orderNumber")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: measurements.length,
      data: measurements,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single measurement
// @route   GET /api/measurements/:id
// @access  Private
exports.getMeasurement = async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id)
      .populate("customer", "name")
      .populate("tailor", "name shopName")
      .populate("order", "orderNumber");

    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }

    // Check authorization
    if (
      measurement.customer._id.toString() !== req.user._id.toString() &&
      (measurement.tailor &&
        measurement.tailor._id.toString() !== req.user._id.toString())
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      data: measurement,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get standard measurement templates
// @route   GET /api/measurements/templates
// @access  Public
exports.getTemplates = async (req, res) => {
  try {
    const { garmentType } = req.query;

    const templates = {
      shalwar_kameez: {
        name: "Shalwar Kameez",
        measurements: [
          "chest",
          "waist",
          "hips",
          "shoulder",
          "sleeveLength",
          "bicep",
          "neck",
          "fullLength",
          "backLength",
        ],
      },
      sherwani: {
        name: "Sherwani",
        measurements: [
          "chest",
          "waist",
          "shoulder",
          "sleeveLength",
          "bicep",
          "neck",
          "fullLength",
          "backLength",
        ],
      },
      lehenga: {
        name: "Lehenga",
        measurements: [
          "chest",
          "waist",
          "hips",
          "fullLength",
          "backLength",
        ],
      },
      suit: {
        name: "Suit",
        measurements: [
          "chest",
          "waist",
          "shoulder",
          "sleeveLength",
          "bicep",
          "neck",
          "fullLength",
          "backLength",
        ],
      },
      dress: {
        name: "Dress",
        measurements: [
          "chest",
          "waist",
          "hips",
          "shoulder",
          "sleeveLength",
          "fullLength",
          "backLength",
        ],
      },
      pants: {
        name: "Pants/Trousers",
        measurements: [
          "waist",
          "hips",
          "inseam",
          "outseam",
          "thigh",
          "knee",
          "ankle",
        ],
      },
    };

    if (garmentType && templates[garmentType]) {
      res.json({
        success: true,
        data: templates[garmentType],
      });
    } else {
      res.json({
        success: true,
        data: templates,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update measurement
// @route   PUT /api/measurements/:id
// @access  Private
exports.updateMeasurement = async (req, res) => {
  try {
    const measurement = await Measurement.findById(req.params.id);

    if (!measurement) {
      return res.status(404).json({ message: "Measurement not found" });
    }

    // Check authorization
    if (measurement.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const {
      measurements,
      recommendedSize,
      sizeAdjustments,
      notes,
      photos,
    } = req.body;

    if (measurements) measurement.measurements = measurements;
    if (recommendedSize) measurement.recommendedSize = recommendedSize;
    if (sizeAdjustments) measurement.sizeAdjustments = sizeAdjustments;
    if (notes !== undefined) measurement.notes = notes;
    if (photos) measurement.photos = photos;

    const updatedMeasurement = await measurement.save();

    res.json({
      success: true,
      data: updatedMeasurement,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

