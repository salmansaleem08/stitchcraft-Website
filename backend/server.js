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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

