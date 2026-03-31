const crypto = require("crypto");
const ApiKey = require("../models/apiKey.model");

async function apiKeyAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "API key required" });
  }

  const rawKey = authHeader.split(" ")[1];
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

  try {
    const apiKey = await ApiKey.findActiveByHash(keyHash);

    if (!apiKey) {
      return res.status(401).json({ message: "Invalid or revoked API key" });
    }

    // Fire And Forget
    ApiKey.logUsage(apiKey.id, req.originalUrl, req.method, req.ip).catch(() => {});
    ApiKey.updateLastUsed(apiKey.id).catch(() => {});

    req.apiKey = apiKey;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { apiKeyAuth };
