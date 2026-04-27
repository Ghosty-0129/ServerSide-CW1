const crypto = require("crypto");
const pool   = require("../config/db");

function requirePermission(scope) {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "API key required" });
    }

    const rawKey  = authHeader.split(" ")[1];
    const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");

    try {
      const [rows] = await pool.query(
        "SELECT * FROM api_keys WHERE key_hash = ? AND is_active = 1 LIMIT 1",
        [keyHash]
      );

      const apiKey = rows[0];

      if (!apiKey) {
        return res.status(401).json({ message: "Invalid or revoked API key" });
      }

      let permissions = [];
      try {
        permissions = typeof apiKey.permissions === "string"
          ? JSON.parse(apiKey.permissions)
          : (apiKey.permissions || []);
      } catch {
        permissions = [];
      }

      if (!permissions.includes(scope)) {
        return res.status(403).json({
          message: `Forbidden: this key does not have the '${scope}' permission`,
          required_permission: scope,
          your_permissions:    permissions
        });
      }

      pool.query(
        "INSERT INTO api_key_usage_logs (api_key_id, endpoint, method, ip_address) VALUES (?,?,?,?)",
        [apiKey.id, req.originalUrl, req.method, req.ip]
      ).catch(() => {});

      pool.query(
        "UPDATE api_keys SET last_used_at = NOW() WHERE id = ?",
        [apiKey.id]
      ).catch(() => {});

      req.apiKey = apiKey;
      req.apiPermissions = permissions;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requirePermission };
