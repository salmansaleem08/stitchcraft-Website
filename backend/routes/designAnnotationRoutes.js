const express = require("express");
const router = express.Router();
const {
  getOrderAnnotations,
  addAnnotation,
  updateAnnotation,
  deleteAnnotation,
  updateAnnotationImage,
} = require("../controllers/designAnnotationController");
const { protect } = require("../middleware/auth");

router.get("/order/:orderId", protect, getOrderAnnotations);
router.post("/order/:orderId/annotations", protect, addAnnotation);
router.put("/order/:orderId/annotations/:annotationId", protect, updateAnnotation);
router.delete("/order/:orderId/annotations/:annotationId", protect, deleteAnnotation);
router.put("/order/:orderId/image", protect, updateAnnotationImage);

module.exports = router;

