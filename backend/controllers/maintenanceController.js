const MaintenanceService = require("../models/MaintenanceService");
const Equipment = require("../models/Equipment");
const User = require("../models/User");

// @desc    Get all maintenance services
// @route   GET /api/maintenance
// @access  Private
exports.getMaintenanceServices = async (req, res) => {
  try {
    const { status, role } = req.query;
    const filter = {};

    if (req.user.role === "supplier") {
      filter.serviceProvider = req.user._id;
    } else {
      filter.customer = req.user._id;
    }

    if (status) {
      filter.status = status;
    }

    const services = await MaintenanceService.find(filter)
      .populate("serviceProvider", "name businessName email phone location")
      .populate("customer", "name email phone")
      .populate("equipment", "name category brand model")
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single maintenance service
// @route   GET /api/maintenance/:id
// @access  Private
exports.getMaintenanceService = async (req, res) => {
  try {
    const service = await MaintenanceService.findById(req.params.id)
      .populate("serviceProvider", "name businessName email phone location")
      .populate("customer", "name email phone")
      .populate("equipment", "name category brand model images");

    if (!service) {
      return res.status(404).json({ message: "Maintenance service not found" });
    }

    // Check authorization
    if (
      service.serviceProvider.toString() !== req.user._id.toString() &&
      service.customer.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Book maintenance service
// @route   POST /api/maintenance
// @access  Private
exports.bookMaintenanceService = async (req, res) => {
  try {
    const {
      serviceProvider,
      equipment,
      equipmentDetails,
      serviceType,
      description,
      scheduledDate,
      scheduledTime,
      location,
      estimatedCost,
    } = req.body;

    // Verify service provider exists and is a supplier
    const provider = await User.findById(serviceProvider);
    if (!provider || provider.role !== "supplier") {
      return res.status(400).json({ message: "Invalid service provider" });
    }

    const service = new MaintenanceService({
      serviceProvider,
      customer: req.user._id,
      equipment,
      equipmentDetails,
      serviceType,
      description,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      location,
      estimatedCost,
      timeline: [
        {
          status: "pending",
          timestamp: new Date(),
          note: "Service request submitted",
          updatedBy: req.user._id,
        },
      ],
    });

    await service.save();
    await service.populate("serviceProvider", "name businessName email phone");
    await service.populate("customer", "name email phone");
    if (equipment) {
      await service.populate("equipment", "name category brand model");
    }

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update maintenance service status
// @route   PUT /api/maintenance/:id/status
// @access  Private
exports.updateMaintenanceStatus = async (req, res) => {
  try {
    const { status, serviceNotes, actualCost, partsReplaced, warrantyPeriod, nextServiceDue } =
      req.body;

    const service = await MaintenanceService.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: "Maintenance service not found" });
    }

    // Check authorization
    const isProvider = service.serviceProvider.toString() === req.user._id.toString();
    const isCustomer = service.customer.toString() === req.user._id.toString();

    if (!isProvider && !isCustomer && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    service.status = status;

    if (serviceNotes) {
      service.serviceNotes = serviceNotes;
    }

    if (actualCost !== undefined) {
      service.actualCost = actualCost;
    }

    if (partsReplaced && Array.isArray(partsReplaced)) {
      service.partsReplaced = partsReplaced;
    }

    if (warrantyPeriod !== undefined) {
      service.warrantyPeriod = warrantyPeriod;
    }

    if (nextServiceDue) {
      service.nextServiceDue = new Date(nextServiceDue);
    }

    service.timeline.push({
      status: status,
      timestamp: new Date(),
      note: serviceNotes || `Status updated to ${status}`,
      updatedBy: req.user._id,
    });

    // Update equipment maintenance history if equipment exists
    if (service.equipment && status === "completed") {
      const equipment = await Equipment.findById(service.equipment);
      if (equipment) {
        equipment.maintenanceHistory.push({
          date: new Date(),
          serviceType: service.serviceType,
          description: service.description,
          cost: service.actualCost || service.estimatedCost || 0,
          servicedBy: service.serviceProvider.toString(),
          nextServiceDue: service.nextServiceDue || null,
        });

        if (service.nextServiceDue) {
          equipment.nextMaintenanceDue = new Date(service.nextServiceDue);
        }

        await equipment.save();
      }
    }

    await service.save();

    res.json({
      success: true,
      data: service,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get available service providers
// @route   GET /api/maintenance/providers
// @access  Public
exports.getServiceProviders = async (req, res) => {
  try {
    const providers = await User.find({
      role: "supplier",
      isActive: true,
      businessType: { $in: ["equipment", "mixed"] },
    })
      .select("name businessName email phone location qualityRating verificationStatus")
      .limit(50);

    res.json({
      success: true,
      count: providers.length,
      data: providers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

