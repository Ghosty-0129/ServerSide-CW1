const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const bidRoutes     = require("./routes/bid.routes");
const notFound = require("./middleware/notFound");
const apiKeyRoutes  = require("./routes/apiKey.routes");
const publicRoutes  = require("./routes/public.routes");
const errorHandler = require("./middleware/errorHandler");
const analyticsRoutes = require("./routes/analytics.routes");
const { setupSwagger } = require("./docs/swagger");

const app = express();

// Security headers
app.use(helmet());

// Body parsing
app.use(express.json({ limit: "1mb" }));

// CORS
app.use(cors());

const { protect, requireRole } = require("./middleware/auth.middleware");
const { selectDailyWinner }   = require("./jobs/bidWinner.job");
app.post("/api/admin/trigger-winner", protect, requireRole("admin"), async (req, res) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const targetDate = tomorrow.toISOString().split("T")[0];

  await selectDailyWinner(targetDate);
  res.json({ message: `Winner selection executed for ${targetDate}. Check /api/v1/alumni/today.` });
});

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
app.use("/api/admin/api-keys", apiKeyRoutes);
app.use("/api/v1",            publicRoutes);
app.use("/api/analytics",      analyticsRoutes);

setupSwagger(app);

// Health check
app.get("/health", (req, res) => res.json({ ok: true }));

// 404 + error handler
app.use(notFound);
app.use(errorHandler);

module.exports = app;