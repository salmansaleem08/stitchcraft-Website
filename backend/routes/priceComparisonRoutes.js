const express = require("express");
const router = express.Router();
const {
  compareFabricPrices,
  compareSupplyPrices,
} = require("../controllers/priceComparisonController");

router.get("/fabric", compareFabricPrices);
router.get("/supply", compareSupplyPrices);

module.exports = router;

