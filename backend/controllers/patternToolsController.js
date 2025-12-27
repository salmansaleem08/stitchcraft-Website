// Pattern Tools Controller - Calculators and Estimators

// @desc    Calculate pattern scaling
// @route   POST /api/pattern-tools/scale
// @access  Public
exports.calculateScaling = async (req, res) => {
  try {
    const { originalSize, targetSize, measurements } = req.body;

    if (!originalSize || !targetSize || !measurements) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Size mapping
    const sizeMap = {
      XS: { chest: 32, waist: 26, hips: 34, length: 24 },
      S: { chest: 36, waist: 30, hips: 38, length: 25 },
      M: { chest: 40, waist: 34, hips: 42, length: 26 },
      L: { chest: 44, waist: 38, hips: 46, length: 27 },
      XL: { chest: 48, waist: 42, hips: 50, length: 28 },
      "2XL": { chest: 52, waist: 46, hips: 54, length: 29 },
      "3XL": { chest: 56, waist: 50, hips: 58, length: 30 },
    };

    const original = sizeMap[originalSize] || measurements.original;
    const target = sizeMap[targetSize] || measurements.target;

    if (!original || !target) {
      return res.status(400).json({ message: "Invalid size or measurements" });
    }

    // Calculate scaling factors
    const scaleFactors = {
      chest: target.chest / original.chest,
      waist: target.waist / original.waist,
      hips: target.hips / original.hips,
      length: target.length / original.length,
    };

    // Calculate average scale factor
    const avgScale =
      (scaleFactors.chest + scaleFactors.waist + scaleFactors.hips + scaleFactors.length) / 4;

    res.json({
      success: true,
      data: {
        originalSize,
        targetSize,
        scaleFactors,
        averageScale: Math.round(avgScale * 100) / 100,
        recommendations: {
          chest: `Scale chest measurements by ${Math.round(scaleFactors.chest * 100)}%`,
          waist: `Scale waist measurements by ${Math.round(scaleFactors.waist * 100)}%`,
          hips: `Scale hips measurements by ${Math.round(scaleFactors.hips * 100)}%`,
          length: `Scale length measurements by ${Math.round(scaleFactors.length * 100)}%`,
          general: `Use average scale factor of ${Math.round(avgScale * 100)}% for overall pattern scaling`,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Estimate fabric requirements
// @route   POST /api/pattern-tools/fabric-estimate
// @access  Public
exports.estimateFabric = async (req, res) => {
  try {
    const { garmentType, size, fabricWidth, patternComplexity, designDetails } = req.body;

    if (!garmentType || !size || !fabricWidth) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Base fabric requirements by garment type (in meters)
    const baseRequirements = {
      Kurta: { S: 2.5, M: 2.7, L: 3.0, XL: 3.3, "2XL": 3.6 },
      Shalwar: { S: 1.8, M: 2.0, L: 2.2, XL: 2.4, "2XL": 2.6 },
      Dupatta: { S: 2.5, M: 2.5, L: 2.5, XL: 2.5, "2XL": 2.5 },
      Saree: { S: 5.5, M: 5.5, L: 5.5, XL: 5.5, "2XL": 5.5 },
      Lehenga: { S: 4.0, M: 4.5, L: 5.0, XL: 5.5, "2XL": 6.0 },
      Gown: { S: 3.5, M: 3.8, L: 4.2, XL: 4.5, "2XL": 4.8 },
      Shirt: { S: 1.5, M: 1.7, L: 1.9, XL: 2.1, "2XL": 2.3 },
      Trouser: { S: 1.2, M: 1.4, L: 1.6, XL: 1.8, "2XL": 2.0 },
      Jacket: { S: 1.8, M: 2.0, L: 2.2, XL: 2.4, "2XL": 2.6 },
      Coat: { S: 2.5, M: 2.8, L: 3.1, XL: 3.4, "2XL": 3.7 },
    };

    const baseMeters = baseRequirements[garmentType]?.[size] || 2.5;

    // Adjustments
    let adjustmentFactor = 1.0;

    // Pattern complexity adjustment
    if (patternComplexity === "Simple") {
      adjustmentFactor -= 0.1;
    } else if (patternComplexity === "Complex") {
      adjustmentFactor += 0.2;
    } else if (patternComplexity === "Very Complex") {
      adjustmentFactor += 0.4;
    }

    // Design details adjustment
    if (designDetails) {
      if (designDetails.includes("pleats")) adjustmentFactor += 0.15;
      if (designDetails.includes("gathers")) adjustmentFactor += 0.1;
      if (designDetails.includes("ruffles")) adjustmentFactor += 0.2;
      if (designDetails.includes("lining")) adjustmentFactor += 0.3;
    }

    // Fabric width adjustment (standard is 44-45 inches / 1.12-1.14 meters)
    const standardWidth = 1.14; // meters
    const widthFactor = standardWidth / fabricWidth;
    if (widthFactor > 1.1) {
      adjustmentFactor += 0.1;
    } else if (widthFactor < 0.9) {
      adjustmentFactor -= 0.1;
    }

    const estimatedMeters = baseMeters * adjustmentFactor;
    const estimatedYards = estimatedMeters * 1.094; // 1 meter = 1.094 yards

    // Add buffer for mistakes
    const bufferMeters = estimatedMeters * 0.1; // 10% buffer
    const totalMeters = estimatedMeters + bufferMeters;
    const totalYards = estimatedYards + bufferMeters * 1.094;

    res.json({
      success: true,
      data: {
        garmentType,
        size,
        fabricWidth,
        estimates: {
          base: {
            meters: Math.round(baseMeters * 100) / 100,
            yards: Math.round(baseMeters * 1.094 * 100) / 100,
          },
          adjusted: {
            meters: Math.round(estimatedMeters * 100) / 100,
            yards: Math.round(estimatedYards * 100) / 100,
          },
          recommended: {
            meters: Math.round(totalMeters * 100) / 100,
            yards: Math.round(totalYards * 100) / 100,
          },
        },
        adjustments: {
          complexity: patternComplexity || "Medium",
          designDetails: designDetails || [],
          widthFactor: Math.round(widthFactor * 100) / 100,
          buffer: "10%",
        },
        notes: [
          "These are estimates. Actual requirements may vary based on fabric pattern, nap, and cutting efficiency.",
          "Always purchase slightly more fabric than estimated to account for pattern matching and mistakes.",
          "For directional prints, add 20-30% more fabric.",
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pattern modification suggestions
// @route   POST /api/pattern-tools/modify
// @access  Public
exports.getModificationSuggestions = async (req, res) => {
  try {
    const { patternType, modificationType, measurements } = req.body;

    if (!patternType || !modificationType) {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    const suggestions = {
      length: {
        Kurta: "Adjust the hemline length. For longer kurta, add 2-4 inches to the bottom. For shorter, reduce proportionally.",
        Shalwar: "Modify the inseam length. Standard is 38-40 inches, adjust based on desired break.",
        Trouser: "Adjust inseam. For full break, keep standard. For no break, reduce by 1-2 inches.",
      },
      width: {
        Kurta: "Adjust side seams. For looser fit, add 1-2 inches to each side. For tighter, reduce proportionally.",
        Shalwar: "Modify the width at hips and thighs. Standard is 24-28 inches at bottom.",
        Trouser: "Adjust leg width. For slim fit, reduce by 1-2 inches. For relaxed, add 1-2 inches.",
      },
      sleeves: {
        Kurta: "For full sleeves, increase sleeve width by 2-3 inches. For 3/4 sleeves, reduce length by 25%.",
        Shirt: "Adjust sleeve length from shoulder point. Standard is 23-25 inches for full sleeve.",
      },
      neckline: {
        Kurta: "For V-neck, create V shape at center front. For round neck, use curved pattern piece.",
        Shirt: "Adjust collar stand height and neck opening size based on preference.",
      },
    };

    const suggestion = suggestions[modificationType]?.[patternType] || "Consult with a professional tailor for modifications.";

    res.json({
      success: true,
      data: {
        patternType,
        modificationType,
        suggestion,
        tips: [
          "Always make a test garment (muslin) before cutting final fabric",
          "Mark all modifications clearly on the pattern",
          "Keep original pattern pieces for reference",
          "Consider how modifications affect other pattern pieces",
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

