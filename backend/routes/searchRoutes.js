const express = require("express");
const router = express.Router();
const { unifiedSearch, getSearchSuggestions } = require("../controllers/searchController");

// Public routes
router.get("/", unifiedSearch);
router.get("/suggestions", getSearchSuggestions);

module.exports = router;

