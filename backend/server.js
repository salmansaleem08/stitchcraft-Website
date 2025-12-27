const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
connectDB();

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.get("/", (req, res) => {
  res.send("StitchCraft backend running");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/patterns", require("./routes/patternRoutes"));
app.use("/api/pattern-tools", require("./routes/patternToolsRoutes"));
app.use("/api/tailors", require("./routes/tailorRoutes"));
app.use("/api/suppliers", require("./routes/supplierRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/fabrics", require("./routes/fabricRoutes"));
app.use("/api/fabrics/recommendations", require("./routes/fabricRecommendationRoutes"));
app.use("/api/supplies", require("./routes/supplyRoutes"));
app.use("/api/supply-orders", require("./routes/supplyOrderRoutes"));
app.use("/api/supply-reviews", require("./routes/supplyReviewRoutes"));
app.use("/api/analytics", require("./routes/analyticsRoutes"));
app.use("/api/search", require("./routes/searchRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/checkout", require("./routes/checkoutRoutes"));
app.use("/api/sample-orders", require("./routes/sampleOrderRoutes"));
app.use("/api/bulk-orders", require("./routes/bulkOrderRoutes"));
app.use("/api/inventory", require("./routes/inventoryRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/measurements", require("./routes/measurementRoutes"));
app.use("/api/pricing", require("./routes/pricingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/mood-boards", require("./routes/moodBoardRoutes"));
app.use("/api/design-annotations", require("./routes/designAnnotationRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

