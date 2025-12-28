const ARTryOnSession = require("../models/ARTryOnSession");
const Fabric = require("../models/Fabric");
const Pattern = require("../models/Pattern");
const Measurement = require("../models/Measurement");

// Simulate body measurement scanning from image/camera
function analyzeBodyFromImage(imageData) {
  // In a real implementation, this would use ML/AI models
  // For now, we'll return a placeholder that can be refined manually
  return {
    height: null,
    weight: null,
    bust: null,
    waist: null,
    hips: null,
    shoulder: null,
    armLength: null,
    legLength: null,
    confidence: 0.5,
    requiresManualInput: true,
  };
}

// Calculate fabric draping simulation
function simulateFabricDraping(fabric, bodyMeasurements, garmentType) {
  const draping = {
    fabricType: fabric.fabricType,
    weight: fabric.weight || "Medium",
    drape: "Good", // Good, Moderate, Poor
    flow: "Smooth", // Smooth, Moderate, Stiff
    fitScore: 85,
    recommendations: [],
  };

  // Fabric weight affects draping
  if (fabric.weight === "Light") {
    draping.drape = "Excellent";
    draping.flow = "Very Smooth";
    draping.recommendations.push("Light fabrics drape beautifully for flowing styles");
  } else if (fabric.weight === "Heavy") {
    draping.drape = "Moderate";
    draping.flow = "Stiff";
    draping.recommendations.push("Heavy fabrics provide structure but less flow");
  }

  // Fabric type specific recommendations
  const fabricDrapingMap = {
    Silk: { drape: "Excellent", flow: "Very Smooth", fitScore: 90 },
    Chiffon: { drape: "Excellent", flow: "Very Smooth", fitScore: 95 },
    Georgette: { drape: "Excellent", flow: "Smooth", fitScore: 90 },
    Cotton: { drape: "Good", flow: "Moderate", fitScore: 80 },
    Linen: { drape: "Moderate", flow: "Stiff", fitScore: 75 },
    Velvet: { drape: "Good", flow: "Moderate", fitScore: 85 },
    Denim: { drape: "Poor", flow: "Stiff", fitScore: 70 },
  };

  const fabricInfo = fabricDrapingMap[fabric.fabricType] || draping;
  Object.assign(draping, fabricInfo);

  return draping;
}

// Calculate pattern fitting
function calculatePatternFit(pattern, bodyMeasurements, garmentType) {
  if (!pattern || !bodyMeasurements) {
    return {
      fitScore: 70,
      scale: 1.0,
      adjustments: [],
      warnings: [],
    };
  }

  const fit = {
    fitScore: 80,
    scale: 1.0,
    position: { x: 0, y: 0 },
    adjustments: [],
    warnings: [],
  };

  // Standard size measurements (approximate in cm)
  const standardSizes = {
    XS: { bust: 81, waist: 66, hips: 89, height: 160 },
    S: { bust: 86, waist: 71, hips: 94, height: 165 },
    M: { bust: 91, waist: 76, hips: 99, height: 170 },
    L: { bust: 96, waist: 81, hips: 104, height: 170 },
    XL: { bust: 101, waist: 86, hips: 109, height: 175 },
  };

  // If pattern has size information, use it
  if (pattern.measurements && pattern.measurements.sizes && pattern.measurements.sizes.length > 0) {
    // Find closest standard size based on body measurements
    let closestSize = null;
    let minDiff = Infinity;

    for (const size of pattern.measurements.sizes) {
      const sizeData = standardSizes[size];
      if (sizeData && bodyMeasurements.bust && bodyMeasurements.waist) {
        const diff =
          Math.abs(sizeData.bust - bodyMeasurements.bust) +
          Math.abs(sizeData.waist - bodyMeasurements.waist);
        if (diff < minDiff) {
          minDiff = diff;
          closestSize = { size, data: sizeData };
        }
      }
    }

    if (closestSize) {
      const sizeData = closestSize.data;

      // Check key measurements against closest size
      if (bodyMeasurements.bust) {
        const diff = Math.abs(sizeData.bust - bodyMeasurements.bust);
        if (diff > 5) {
          fit.adjustments.push({
            area: "bust",
            current: bodyMeasurements.bust,
            pattern: sizeData.bust,
            adjustment: sizeData.bust - bodyMeasurements.bust,
            reason: `Bust measurement differs from ${closestSize.size} size pattern`,
            priority: diff > 10 ? "High" : "Medium",
          });
          fit.fitScore -= diff * 2;
        }
      }

      if (bodyMeasurements.waist) {
        const diff = Math.abs(sizeData.waist - bodyMeasurements.waist);
        if (diff > 5) {
          fit.adjustments.push({
            area: "waist",
            current: bodyMeasurements.waist,
            pattern: sizeData.waist,
            adjustment: sizeData.waist - bodyMeasurements.waist,
            reason: `Waist measurement differs from ${closestSize.size} size pattern`,
            priority: diff > 10 ? "High" : "Medium",
          });
          fit.fitScore -= diff * 2;
        }
      }

      if (bodyMeasurements.hips) {
        const diff = Math.abs(sizeData.hips - bodyMeasurements.hips);
        if (diff > 5) {
          fit.adjustments.push({
            area: "hips",
            current: bodyMeasurements.hips,
            pattern: sizeData.hips,
            adjustment: sizeData.hips - bodyMeasurements.hips,
            reason: `Hip measurement differs from ${closestSize.size} size pattern`,
            priority: diff > 10 ? "High" : "Medium",
          });
          fit.fitScore -= diff * 2;
        }
      }

      // Calculate scale if height differs significantly
      if (bodyMeasurements.height && sizeData.height) {
        const heightDiff = bodyMeasurements.height / sizeData.height;
        if (Math.abs(heightDiff - 1) > 0.1) {
          fit.scale = heightDiff;
          fit.warnings.push(
            `Pattern may need scaling by ${((heightDiff - 1) * 100).toFixed(0)}% for your height`
          );
        }
      }

      fit.warnings.push(`Closest pattern size: ${closestSize.size}`);
    }
  } else if (pattern.measurements && pattern.measurements.customSizing) {
    // Custom sizing pattern - general fit assessment
    fit.warnings.push("Pattern uses custom sizing - adjustments may be needed");
    fit.fitScore = 75;
  }

  fit.fitScore = Math.max(0, Math.min(100, fit.fitScore));

  return fit;
}

// Generate fit adjustment suggestions
function generateFitAdjustments(bodyMeasurements, garmentType, fabric, pattern) {
  const adjustments = [];

  // General fit recommendations based on body type
  if (bodyMeasurements.waist && bodyMeasurements.bust) {
    const waistToBustRatio = bodyMeasurements.waist / bodyMeasurements.bust;
    if (waistToBustRatio > 0.9) {
      adjustments.push({
        area: "waist",
        currentMeasurement: bodyMeasurements.waist,
        suggestedMeasurement: bodyMeasurements.waist - 5,
        adjustment: -5,
        reason: "Slightly reduce waist for better fit",
        priority: "Medium",
      });
    }
  }

  // Fabric-specific adjustments
  if (fabric && fabric.weight === "Heavy") {
    adjustments.push({
      area: "overall",
      currentMeasurement: null,
      suggestedMeasurement: null,
      adjustment: 0,
      reason: "Heavy fabric may require slightly looser fit for comfort",
      priority: "Low",
    });
  }

  // Pattern-specific adjustments
  if (pattern && pattern.measurements && bodyMeasurements.shoulder) {
    // Use standard size estimation for shoulder if pattern has sizes
    if (pattern.measurements.sizes && pattern.measurements.sizes.length > 0) {
      const standardSizes = {
        XS: { shoulder: 35 },
        S: { shoulder: 36 },
        M: { shoulder: 37 },
        L: { shoulder: 38 },
        XL: { shoulder: 39 },
      };
      
      // Estimate shoulder from bust measurement
      if (bodyMeasurements.bust) {
        let estimatedShoulder = 36; // Default
        if (bodyMeasurements.bust <= 86) estimatedShoulder = 35;
        else if (bodyMeasurements.bust <= 91) estimatedShoulder = 36;
        else if (bodyMeasurements.bust <= 96) estimatedShoulder = 37;
        else if (bodyMeasurements.bust <= 101) estimatedShoulder = 38;
        else estimatedShoulder = 39;

        const diff = estimatedShoulder - bodyMeasurements.shoulder;
        if (Math.abs(diff) > 3) {
          adjustments.push({
            area: "shoulder",
            currentMeasurement: bodyMeasurements.shoulder,
            suggestedMeasurement: estimatedShoulder,
            adjustment: diff,
            reason: "Adjust shoulder width for better fit",
            priority: "Medium",
          });
        }
      }
    }
  }

  return adjustments;
}

// @desc    Create AR try-on session
// @route   POST /api/ar-fitting/sessions
// @access  Private
exports.createTryOnSession = async (req, res) => {
  try {
    const { sessionName, bodyScanData, selectedGarment } = req.body;

    const session = new ARTryOnSession({
      user: req.user._id,
      sessionName: sessionName || `Try-On ${new Date().toLocaleDateString()}`,
      bodyScanData: bodyScanData || {},
      selectedGarment: selectedGarment || {},
      status: "scanning",
    });

    await session.save();
    await session.populate("selectedGarment.fabric", "name fabricType color pattern pricePerMeter images");
    await session.populate("selectedGarment.pattern", "name description measurements");

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update body scan data
// @route   PUT /api/ar-fitting/sessions/:id/scan
// @access  Private
exports.updateBodyScan = async (req, res) => {
  try {
    const { scanImage, measurements, scanMethod } = req.body;

    const session = await ARTryOnSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // If image provided, analyze it (simulated)
    let analyzedMeasurements = {};
    if (scanImage) {
      analyzedMeasurements = analyzeBodyFromImage(scanImage);
    }

    session.bodyScanData = {
      ...session.bodyScanData,
      ...measurements,
      ...analyzedMeasurements,
      scanImage: scanImage || session.bodyScanData.scanImage,
      scanMethod: scanMethod || session.bodyScanData.scanMethod || "manual",
      scanDate: new Date(),
    };

    session.status = "visualizing";
    await session.save();

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Generate fabric draping simulation
// @route   POST /api/ar-fitting/sessions/:id/draping
// @access  Private
exports.simulateFabricDraping = async (req, res) => {
  try {
    const { fabricId } = req.body;

    const session = await ARTryOnSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const fabric = await Fabric.findById(fabricId || session.selectedGarment.fabric);

    if (!fabric) {
      return res.status(404).json({ message: "Fabric not found" });
    }

    const draping = simulateFabricDraping(
      fabric,
      session.bodyScanData,
      session.selectedGarment.garmentType
    );

    session.selectedGarment.fabric = fabric._id;
    session.tryOnVisualization.fabricDraping = {
      enabled: true,
      simulationData: JSON.stringify(draping),
      previewImage: fabric.images && fabric.images.length > 0 ? fabric.images[0] : null,
    };

    await session.save();

    res.json({
      success: true,
      data: {
        draping,
        session,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Calculate pattern fitting
// @route   POST /api/ar-fitting/sessions/:id/pattern-fit
// @access  Private
exports.calculatePatternFit = async (req, res) => {
  try {
    const { patternId } = req.body;

    const session = await ARTryOnSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const pattern = await Pattern.findById(patternId || session.selectedGarment.pattern);

    if (!pattern) {
      return res.status(404).json({ message: "Pattern not found" });
    }

    const fit = calculatePatternFit(pattern, session.bodyScanData, session.selectedGarment.garmentType);

    session.selectedGarment.pattern = pattern._id;
    session.tryOnVisualization.patternFitting = {
      patternScale: fit.scale,
      patternPosition: fit.position,
      fitScore: fit.fitScore,
    };

    // Generate fit adjustments
    const fabric = await Fabric.findById(session.selectedGarment.fabric);
    const adjustments = generateFitAdjustments(
      session.bodyScanData,
      session.selectedGarment.garmentType,
      fabric,
      pattern
    );

    session.tryOnVisualization.fitAdjustments = adjustments;

    await session.save();
    await session.populate("selectedGarment.pattern", "name description measurements");

    res.json({
      success: true,
      data: {
        fit,
        adjustments,
        session,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update color and design visualization
// @route   PUT /api/ar-fitting/sessions/:id/visualization
// @access  Private
exports.updateVisualization = async (req, res) => {
  try {
    const { colors, patterns, previewImage } = req.body;

    const session = await ARTryOnSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (colors) {
      session.tryOnVisualization.colorVisualization = {
        baseColor: colors.baseColor || session.tryOnVisualization.colorVisualization?.baseColor,
        accentColors: colors.accentColors || session.tryOnVisualization.colorVisualization?.accentColors || [],
        colorMap: colors.colorMap ? JSON.stringify(colors.colorMap) : session.tryOnVisualization.colorVisualization?.colorMap,
      };
    }

    if (previewImage) {
      if (!session.tryOnVisualization.previewImages) {
        session.tryOnVisualization.previewImages = [];
      }
      session.tryOnVisualization.previewImages.push(previewImage);
    }

    session.status = "visualizing";
    await session.save();

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all try-on sessions
// @route   GET /api/ar-fitting/sessions
// @access  Private
exports.getTryOnSessions = async (req, res) => {
  try {
    const sessions = await ARTryOnSession.find({ user: req.user._id })
      .populate("selectedGarment.fabric", "name fabricType color pattern images")
      .populate("selectedGarment.pattern", "name description")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single try-on session
// @route   GET /api/ar-fitting/sessions/:id
// @access  Private
exports.getTryOnSession = async (req, res) => {
  try {
    const session = await ARTryOnSession.findById(req.params.id)
      .populate("selectedGarment.fabric", "name fabricType color pattern pricePerMeter images supplier")
      .populate("selectedGarment.pattern", "name description measurements images");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Save try-on session
// @route   PUT /api/ar-fitting/sessions/:id/save
// @access  Private
exports.saveTryOnSession = async (req, res) => {
  try {
    const session = await ARTryOnSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    session.saved = true;
    session.status = "saved";
    await session.save();

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete try-on session
// @route   DELETE /api/ar-fitting/sessions/:id
// @access  Private
exports.deleteTryOnSession = async (req, res) => {
  try {
    const session = await ARTryOnSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await session.deleteOne();

    res.json({
      success: true,
      message: "Session deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

