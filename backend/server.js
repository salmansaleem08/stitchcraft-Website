const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const app = express();
app.use(cors());
app.use(express.json());
connectDB();
app.get("/", (req, res) => {
  res.send("StitchCraft backend running");
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/tailors", require("./routes/tailorRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/measurements", require("./routes/measurementRoutes"));
app.use("/api/pricing", require("./routes/pricingRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

