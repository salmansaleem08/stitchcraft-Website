const express = require("express");
const router = express.Router();
const {
  getWorkshops,
  getWorkshop,
  createWorkshop,
  updateWorkshop,
  deleteWorkshop,
  registerForWorkshop,
  cancelRegistration,
} = require("../controllers/workshopController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", getWorkshops);
router.get("/:id", getWorkshop);
router.post("/", protect, authorize("admin"), createWorkshop);
router.put("/:id", protect, authorize("admin"), updateWorkshop);
router.delete("/:id", protect, authorize("admin"), deleteWorkshop);
router.post("/:id/register", protect, registerForWorkshop);
router.delete("/:id/register", protect, cancelRegistration);

module.exports = router;

