const StyleRecommendation = require("../models/StyleRecommendation");
const TrendForecast = require("../models/TrendForecast");
const Fabric = require("../models/Fabric");
const User = require("../models/User");

// Body type analysis based on measurements
function analyzeBodyType(measurements) {
  const { height, bust, waist, hips, shoulder } = measurements;

  if (!bust || !waist || !hips) {
    return "Rectangle"; // Default
  }

  const bustWaistRatio = bust / waist;
  const hipWaistRatio = hips / waist;
  const shoulderHipRatio = shoulder / hips;

  // Hourglass: bust and hips similar, waist significantly smaller
  if (Math.abs(bust - hips) <= 5 && waist < bust - 10 && waist < hips - 10) {
    return "Hourglass";
  }

  // Pear: hips significantly wider than bust
  if (hips > bust + 5) {
    return "Pear";
  }

  // Apple: waist is largest or similar to bust/hips
  if (waist >= bust - 2 && waist >= hips - 2) {
    return "Apple";
  }

  // Inverted Triangle: shoulders/bust wider than hips
  if (shoulder && shoulder > hips + 5) {
    return "Inverted Triangle";
  }

  // Rectangle: similar measurements
  if (Math.abs(bust - waist) <= 5 && Math.abs(hips - waist) <= 5) {
    return "Rectangle";
  }

  // Height-based
  if (height && height < 155) {
    return "Petite";
  }
  if (height && height > 175) {
    return "Tall";
  }

  return "Rectangle";
}

// Get body type recommendations
function getBodyTypeRecommendations(bodyType) {
  const recommendations = {
    Hourglass: {
      garmentTypes: ["Shalwar Kameez", "Lehenga", "Dress", "Kurta"],
      stylingTips: [
        "Emphasize your waist with fitted styles",
        "A-line and flared bottoms work well",
        "V-neck and scoop necklines are flattering",
        "Belted styles highlight your natural curves",
      ],
      avoid: ["Boxy silhouettes", "Oversized tops", "Straight cuts"],
    },
    Pear: {
      garmentTypes: ["Shalwar Kameez", "Kurta", "Dress"],
      stylingTips: [
        "Balance proportions with structured tops",
        "A-line and flared bottoms balance hips",
        "Emphasize upper body with patterns and details",
        "Dark bottoms with lighter tops",
      ],
      avoid: ["Tight bottoms", "Excessive hip detailing"],
    },
    Apple: {
      garmentTypes: ["Kurta", "Shalwar Kameez", "Waistcoat"],
      stylingTips: [
        "Empire waist and A-line silhouettes",
        "V-neck and open necklines",
        "Structured fabrics that drape well",
        "Focus on vertical lines and patterns",
      ],
      avoid: ["Tight waistbands", "Horizontal stripes", "Crop tops"],
    },
    Rectangle: {
      garmentTypes: ["Shalwar Kameez", "Lehenga", "Suit", "Dress"],
      stylingTips: [
        "Create curves with peplum and belted styles",
        "Add volume with ruffles and layers",
        "Use patterns and textures to add dimension",
        "A-line and flared styles create shape",
      ],
      avoid: ["Boxy, straight cuts", "No waist definition"],
    },
    "Inverted Triangle": {
      garmentTypes: ["Shalwar Kameez", "Kurta", "Dress"],
      stylingTips: [
        "Balance with A-line and flared bottoms",
        "Softer, draped tops",
        "V-neck and scoop necks",
        "Focus on lower body details",
      ],
      avoid: ["Shoulder pads", "Wide necklines", "Structured shoulders"],
    },
    Petite: {
      garmentTypes: ["Kurta", "Shalwar Kameez", "Dress"],
      stylingTips: [
        "Vertical lines and patterns",
        "Fitted silhouettes",
        "High-waisted styles",
        "Monochrome outfits create length",
      ],
      avoid: ["Oversized pieces", "Long, overwhelming patterns"],
    },
    Tall: {
      garmentTypes: ["Lehenga", "Shalwar Kameez", "Suit", "Dress"],
      stylingTips: [
        "Layered looks work well",
        "Bold patterns and prints",
        "Wide-leg and flared styles",
        "Statement accessories",
      ],
      avoid: ["Too-short hemlines", "Overly fitted styles"],
    },
    "Plus Size": {
      garmentTypes: ["Shalwar Kameez", "Kurta", "Lehenga", "Dress"],
      stylingTips: [
        "Structured fabrics with good drape",
        "A-line and empire waist styles",
        "V-neck and open necklines",
        "Vertical patterns and lines",
      ],
      avoid: ["Tight, clingy fabrics", "Horizontal stripes", "Oversized, shapeless pieces"],
    },
  };

  return recommendations[bodyType] || recommendations.Rectangle;
}

// Fabric pattern compatibility
function checkFabricPatternCompatibility(fabricType, pattern, bodyType, occasion) {
  const compatibility = {
    score: 80,
    reasons: [],
    warnings: [],
  };

  // Pattern and body type compatibility
  const patternGuidelines = {
    Striped: {
      compatible: ["Rectangle", "Petite", "Tall"],
      avoid: ["Apple", "Plus Size"],
      reason: "Vertical stripes create length, horizontal stripes add width",
    },
    Floral: {
      compatible: ["All"],
      avoid: [],
      reason: "Floral patterns work well for most body types",
    },
    Geometric: {
      compatible: ["Rectangle", "Hourglass", "Tall"],
      avoid: ["Petite", "Apple"],
      reason: "Geometric patterns can be overwhelming for smaller frames",
    },
    Solid: {
      compatible: ["All"],
      avoid: [],
      reason: "Solid colors are universally flattering",
    },
    Embroidered: {
      compatible: ["All"],
      avoid: [],
      reason: "Embroidery adds texture and interest",
    },
  };

  const guideline = patternGuidelines[pattern] || patternGuidelines.Solid;

  if (guideline.avoid.includes(bodyType)) {
    compatibility.score -= 20;
    compatibility.warnings.push(`This pattern may not be ideal for ${bodyType} body types`);
  } else if (guideline.compatible.includes(bodyType) || guideline.compatible.includes("All")) {
    compatibility.reasons.push(guideline.reason);
  }

  // Fabric type and occasion compatibility
  const fabricOccasionMap = {
    Silk: ["Wedding", "Party", "Formal", "Festive"],
    Cotton: ["Casual", "Office", "Everyday", "Traditional"],
    Linen: ["Casual", "Office", "Everyday"],
    Chiffon: ["Wedding", "Party", "Formal"],
    Georgette: ["Wedding", "Party", "Formal", "Festive"],
    Velvet: ["Wedding", "Party", "Festive"],
    Denim: ["Casual", "Everyday"],
  };

  const suitableOccasions = fabricOccasionMap[fabricType] || ["Everyday"];
  if (!suitableOccasions.includes(occasion)) {
    compatibility.score -= 15;
    compatibility.warnings.push(`${fabricType} may not be ideal for ${occasion} occasions`);
  } else {
    compatibility.reasons.push(`${fabricType} is perfect for ${occasion} occasions`);
  }

  return compatibility;
}

// Cultural appropriateness
function checkCulturalAppropriateness(garmentType, occasion, culturalContext) {
  const guidelines = {
    Pakistani: {
      appropriate: {
        "Shalwar Kameez": ["All"],
        Lehenga: ["Wedding", "Party", "Festive", "Traditional"],
        Sherwani: ["Wedding", "Formal", "Festive"],
        Kurta: ["Casual", "Traditional", "Everyday", "Office"],
      },
      notes: "Traditional Pakistani attire is appropriate for most occasions",
    },
    Western: {
      appropriate: {
        Suit: ["Formal", "Office", "Wedding"],
        Dress: ["Casual", "Party", "Formal", "Office"],
        Waistcoat: ["Formal", "Office"],
      },
      notes: "Western styles are suitable for formal and office settings",
    },
    Fusion: {
      appropriate: {
        "Shalwar Kameez": ["All"],
        Kurta: ["All"],
        Dress: ["Casual", "Party", "Office"],
      },
      notes: "Fusion styles blend traditional and modern elements",
    },
  };

  const context = guidelines[culturalContext] || guidelines.Pakistani;
  const appropriateOccasions = context.appropriate[garmentType] || [];

  return {
    isAppropriate: appropriateOccasions.includes("All") || appropriateOccasions.includes(occasion),
    note: context.notes,
    suggestions: appropriateOccasions,
  };
}

// @desc    Get style recommendations
// @route   POST /api/ai-design-assistant/recommendations
// @access  Private
exports.getStyleRecommendations = async (req, res) => {
  try {
    const {
      bodyMeasurements,
      occasion,
      culturalContext,
      preferences,
      includeTrends,
    } = req.body;

    if (!bodyMeasurements || !occasion) {
      return res.status(400).json({ message: "Body measurements and occasion are required" });
    }

    // Analyze body type
    const bodyType = analyzeBodyType(bodyMeasurements);
    const bodyTypeRecs = getBodyTypeRecommendations(bodyType);

    // Get trending items if requested
    let trends = [];
    if (includeTrends) {
      const currentSeason = getCurrentSeason();
      trends = await TrendForecast.find({
        season: currentSeason,
        isActive: true,
        popularityScore: { $gte: 60 },
      })
        .sort({ popularityScore: -1 })
        .limit(10);
    }

    // Get fabric recommendations
    const fabricFilter = {
      isActive: true,
      occasion: occasion,
    };

    if (preferences?.fabricTypes && preferences.fabricTypes.length > 0) {
      fabricFilter.fabricType = { $in: preferences.fabricTypes };
    }

    const fabrics = await Fabric.find(fabricFilter)
      .populate("supplier", "name businessName qualityRating")
      .limit(20);

    // Generate recommendations
    const recommendations = bodyTypeRecs.garmentTypes.map((garmentType) => {
      const culturalCheck = checkCulturalAppropriateness(garmentType, occasion, culturalContext || "Pakistani");

      // Filter fabrics for this garment type
      const compatibleFabrics = fabrics
        .map((fabric) => {
          const compatibility = checkFabricPatternCompatibility(
            fabric.fabricType,
            fabric.pattern || "Solid",
            bodyType,
            occasion
          );

          return {
            fabricId: fabric._id,
            fabricType: fabric.fabricType,
            color: fabric.color,
            pattern: fabric.pattern || "Solid",
            pricePerMeter: fabric.pricePerMeter,
            images: fabric.images,
            supplier: fabric.supplier,
            compatibilityScore: compatibility.score,
            reason: compatibility.reasons.join(", "),
            warnings: compatibility.warnings,
          };
        })
        .filter((f) => f.compatibilityScore >= 60)
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
        .slice(0, 5);

      // Match with trends
      const relevantTrends = trends.filter((trend) => {
        return (
          trend.occasionCompatibility.includes(occasion) &&
          (trend.bodyTypeCompatibility.includes(bodyType) || trend.bodyTypeCompatibility.includes("All"))
        );
      });

      return {
        garmentType,
        fabricRecommendations: compatibleFabrics,
        stylingTips: bodyTypeRecs.stylingTips,
        accessories: getAccessoryRecommendations(occasion, culturalContext || "Pakistani"),
        culturalNotes: culturalCheck.note,
        culturalAppropriate: culturalCheck.isAppropriate,
        trendRelevance: relevantTrends.length > 0
          ? {
              isTrending: true,
              trendCategory: relevantTrends[0].category,
              season: relevantTrends[0].season,
              trends: relevantTrends.map((t) => ({
                name: t.trendName,
                description: t.description,
                popularityScore: t.popularityScore,
              })),
            }
          : {
              isTrending: false,
            },
        compatibilityScore: compatibleFabrics.length > 0
          ? Math.round(
              compatibleFabrics.reduce((sum, f) => sum + f.compatibilityScore, 0) / compatibleFabrics.length
            )
          : 70,
      };
    });

    // Save recommendation if user is logged in
    let savedRecommendation = null;
    if (req.user) {
      savedRecommendation = await StyleRecommendation.create({
        user: req.user._id,
        bodyType,
        bodyMeasurements,
        occasion,
        culturalContext: culturalContext || "Pakistani",
        preferences: preferences || {},
        recommendations,
      });
    }

    res.json({
      success: true,
      data: {
        bodyType,
        bodyTypeAnalysis: {
          type: bodyType,
          description: getBodyTypeDescription(bodyType),
          recommendations: bodyTypeRecs,
        },
        occasion,
        culturalContext: culturalContext || "Pakistani",
        recommendations,
        savedRecommendationId: savedRecommendation?._id,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get saved recommendations
// @route   GET /api/ai-design-assistant/recommendations
// @access  Private
exports.getSavedRecommendations = async (req, res) => {
  try {
    const recommendations = await StyleRecommendation.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get fabric pattern compatibility
// @route   POST /api/ai-design-assistant/fabric-compatibility
// @access  Public
exports.checkFabricCompatibility = async (req, res) => {
  try {
    const { fabricType, pattern, bodyType, occasion } = req.body;

    if (!fabricType || !bodyType || !occasion) {
      return res.status(400).json({ message: "Fabric type, body type, and occasion are required" });
    }

    const compatibility = checkFabricPatternCompatibility(fabricType, pattern || "Solid", bodyType, occasion);

    res.json({
      success: true,
      data: {
        fabricType,
        pattern: pattern || "Solid",
        bodyType,
        occasion,
        compatibility,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cultural appropriateness
// @route   POST /api/ai-design-assistant/cultural-appropriateness
// @access  Public
exports.checkCulturalAppropriateness = async (req, res) => {
  try {
    const { garmentType, occasion, culturalContext } = req.body;

    if (!garmentType || !occasion) {
      return res.status(400).json({ message: "Garment type and occasion are required" });
    }

    const check = checkCulturalAppropriateness(garmentType, occasion, culturalContext || "Pakistani");

    res.json({
      success: true,
      data: {
        garmentType,
        occasion,
        culturalContext: culturalContext || "Pakistani",
        isAppropriate: check.isAppropriate,
        note: check.note,
        suggestions: check.suggestions,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get trend forecasts
// @route   GET /api/ai-design-assistant/trends
// @access  Public
exports.getTrendForecasts = async (req, res) => {
  try {
    const { season, category, year } = req.query;

    const filter = { isActive: true };

    if (season) filter.season = season;
    if (category) filter.category = category;
    if (year) filter.year = parseInt(year);

    const trends = await TrendForecast.find(filter)
      .sort({ popularityScore: -1, createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: trends.length,
      data: trends,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper functions
function getCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
}

function getBodyTypeDescription(bodyType) {
  const descriptions = {
    Hourglass: "Balanced proportions with defined waist",
    Pear: "Narrower shoulders, wider hips",
    Apple: "Broader midsection, narrower hips",
    Rectangle: "Straight, balanced proportions",
    "Inverted Triangle": "Broad shoulders, narrower hips",
    Petite: "Shorter height, smaller frame",
    Tall: "Above average height",
    "Plus Size": "Curvier, fuller figure",
  };
  return descriptions[bodyType] || "Balanced proportions";
}

function getAccessoryRecommendations(occasion, culturalContext) {
  const accessories = {
    Wedding: ["Jewelry set", "Dupatta", "Traditional shoes", "Clutch"],
    Party: ["Statement jewelry", "Evening bag", "Heels", "Shawl"],
    Formal: ["Minimal jewelry", "Formal shoes", "Watch", "Belt"],
    Office: ["Professional bag", "Formal shoes", "Minimal accessories"],
    Traditional: ["Traditional jewelry", "Dupatta", "Traditional footwear"],
    Festive: ["Festive jewelry", "Dupatta", "Traditional accessories"],
    Casual: ["Casual bag", "Comfortable shoes", "Simple jewelry"],
    Everyday: ["Everyday accessories", "Comfortable footwear"],
  };

  return accessories[occasion] || accessories.Everyday;
}

