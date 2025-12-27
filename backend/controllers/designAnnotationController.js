const DesignAnnotation = require("../models/DesignAnnotation");
const Order = require("../models/Order");

// @desc    Get annotations for an order
// @route   GET /api/design-annotations/order/:orderId
// @access  Private
exports.getOrderAnnotations = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isTailor = order.tailor.toString() === req.user._id.toString();

    if (!isCustomer && !isTailor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    let annotation = await DesignAnnotation.findOne({
      order: req.params.orderId,
    });

    if (!annotation) {
      // Create initial annotation if it doesn't exist
      annotation = await DesignAnnotation.create({
        order: req.params.orderId,
        imageUrl: order.designReference?.[0] || "",
        annotations: [],
      });
    }

    res.json({
      success: true,
      data: annotation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add annotation
// @route   POST /api/design-annotations/order/:orderId/annotations
// @access  Private
exports.addAnnotation = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isTailor = order.tailor.toString() === req.user._id.toString();

    if (!isCustomer && !isTailor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    let annotation = await DesignAnnotation.findOne({
      order: req.params.orderId,
    });

    if (!annotation) {
      annotation = await DesignAnnotation.create({
        order: req.params.orderId,
        imageUrl: order.designReference?.[0] || "",
        annotations: [],
      });
    }

    const { type, content, position, size, points } = req.body;

    if (!type || !position) {
      return res.status(400).json({
        message: "Type and position are required",
      });
    }

    annotation.annotations.push({
      type,
      content: content || {},
      position,
      size: size || { width: 0, height: 0 },
      points: points || [],
      createdBy: req.user._id,
    });

    annotation.version += 1;
    await annotation.save();

    res.json({
      success: true,
      data: annotation.annotations[annotation.annotations.length - 1],
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update annotation
// @route   PUT /api/design-annotations/order/:orderId/annotations/:annotationId
// @access  Private
exports.updateAnnotation = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isTailor = order.tailor.toString() === req.user._id.toString();

    if (!isCustomer && !isTailor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const annotation = await DesignAnnotation.findOne({
      order: req.params.orderId,
    });

    if (!annotation) {
      return res.status(404).json({ message: "Annotation not found" });
    }

    const annotationItem = annotation.annotations.id(req.params.annotationId);

    if (!annotationItem) {
      return res.status(404).json({ message: "Annotation item not found" });
    }

    // Only allow updating own annotations or if user is tailor
    if (
      annotationItem.createdBy.toString() !== req.user._id.toString() &&
      !isTailor
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { type, content, position, size, points } = req.body;

    if (type) annotationItem.type = type;
    if (content) annotationItem.content = { ...annotationItem.content, ...content };
    if (position) annotationItem.position = position;
    if (size) annotationItem.size = size;
    if (points) annotationItem.points = points;

    annotation.version += 1;
    await annotation.save();

    res.json({
      success: true,
      data: annotationItem,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete annotation
// @route   DELETE /api/design-annotations/order/:orderId/annotations/:annotationId
// @access  Private
exports.deleteAnnotation = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isTailor = order.tailor.toString() === req.user._id.toString();

    if (!isCustomer && !isTailor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const annotation = await DesignAnnotation.findOne({
      order: req.params.orderId,
    });

    if (!annotation) {
      return res.status(404).json({ message: "Annotation not found" });
    }

    const annotationItem = annotation.annotations.id(req.params.annotationId);

    if (!annotationItem) {
      return res.status(404).json({ message: "Annotation item not found" });
    }

    // Only allow deleting own annotations or if user is tailor
    if (
      annotationItem.createdBy.toString() !== req.user._id.toString() &&
      !isTailor
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    annotation.annotations.pull(req.params.annotationId);
    annotation.version += 1;
    await annotation.save();

    res.json({
      success: true,
      message: "Annotation deleted",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update annotation image
// @route   PUT /api/design-annotations/order/:orderId/image
// @access  Private
exports.updateAnnotationImage = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check authorization
    const isCustomer = order.customer.toString() === req.user._id.toString();
    const isTailor = order.tailor.toString() === req.user._id.toString();

    if (!isCustomer && !isTailor) {
      return res.status(403).json({ message: "Not authorized" });
    }

    let annotation = await DesignAnnotation.findOne({
      order: req.params.orderId,
    });

    if (!annotation) {
      annotation = await DesignAnnotation.create({
        order: req.params.orderId,
        imageUrl: req.body.imageUrl || order.designReference?.[0] || "",
        annotations: [],
      });
    } else {
      annotation.imageUrl = req.body.imageUrl || annotation.imageUrl;
      annotation.version += 1;
      await annotation.save();
    }

    res.json({
      success: true,
      data: annotation,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

