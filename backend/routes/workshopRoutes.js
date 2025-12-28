const express = require("express");
const router = express.Router();
const {
  getWorkshops,
  getWorkshop,
  createWorkshop,
  updateWorkshop,
  registerForWorkshop,
  cancelRegistration,
} = require("../controllers/workshopController");
const { protect } = require("../middleware/auth");

router.get("/", getWorkshops);
router.get("/:id", getWorkshop);
router.post("/", protect, createWorkshop);
router.put("/:id", protect, updateWorkshop);
router.post("/:id/register", protect, registerForWorkshop);
router.delete("/:id/register", protect, cancelRegistration);

module.exports = router;

