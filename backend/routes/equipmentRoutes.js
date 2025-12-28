const express = require("express");
const router = express.Router();
const {
  getEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  requestRental,
  getRentals,
  updateRentalStatus,
} = require("../controllers/equipmentController");
const { protect } = require("../middleware/auth");

router.get("/", getEquipment);
router.get("/:id", getEquipmentById);
router.post("/", protect, createEquipment);
router.put("/:id", protect, updateEquipment);
router.delete("/:id", protect, deleteEquipment);
router.post("/:id/rent", protect, requestRental);
router.get("/rentals/all", protect, getRentals);
router.put("/rentals/:id/status", protect, updateRentalStatus);

module.exports = router;

