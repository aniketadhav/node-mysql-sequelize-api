const express = require("express");
const cors = require("cors");
const errorHandler = require("./middleware/error");
require("dotenv").config();

const app = express();

const origins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(cors({ origin: origins.length ? origins : true, credentials: true }));

app.use(express.json({ limit: "1mb" }));
app.use("/api", require("./routes"));

app.use((req, res) => res.status(404).json({ message: "Not Found" }));
app.use(errorHandler);

module.exports = app;
