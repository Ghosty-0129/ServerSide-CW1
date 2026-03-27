const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const bidRoutes     = require("./routes/bid.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Security headers
app.use(helmet());

// Body parsing
app.use(express.json({ limit: "1mb" }));

// CORS
app.use(cors());

// Basic rate limiting on auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/auth", authLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile",       profileRoutes);
app.use("/api/bids",          bidRoutes);

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;