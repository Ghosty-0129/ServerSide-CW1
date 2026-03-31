const pool   = require("../config/db");
const crypto = require("crypto");

function generateRawKey() {
  const rawKey    = "pk_" + crypto.randomBytes(32).toString("hex");   // 67-char key
  const keyHash   = crypto.createHash("sha256").update(rawKey).digest("hex");
  const keyPrefix = rawKey.substring(0, 10);                           // e.g. pk_a3f9e1...
  return { rawKey, keyHash, keyPrefix };
}

async function create(clientName, keyHash, keyPrefix, createdBy) {
  const [result] = await pool.query(
    "INSERT INTO api_keys (client_name, key_hash, key_prefix, created_by) VALUES (?,?,?,?)",
    [clientName, keyHash, keyPrefix, createdBy || null]
  );
  return result.insertId;
}

async function findAll() {
  const [rows] = await pool.query(
    `SELECT id, client_name, key_prefix, is_active, created_at, last_used_at
     FROM api_keys
     ORDER BY created_at DESC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    "SELECT * FROM api_keys WHERE id = ? LIMIT 1",
    [id]
  );
  return rows[0] || null;
}

async function findActiveByHash(keyHash) {
  const [rows] = await pool.query(
    "SELECT * FROM api_keys WHERE key_hash = ? AND is_active = 1 LIMIT 1",
    [keyHash]
  );
  return rows[0] || null;
}

async function revoke(id) {
  const [result] = await pool.query(
    "UPDATE api_keys SET is_active = 0 WHERE id = ?",
    [id]
  );
  return result.affectedRows;
}

async function updateLastUsed(id) {
  await pool.query(
    "UPDATE api_keys SET last_used_at = NOW() WHERE id = ?",
    [id]
  );
}

async function logUsage(apiKeyId, endpoint, method, ipAddress) {
  await pool.query(
    "INSERT INTO api_key_usage_logs (api_key_id, endpoint, method, ip_address) VALUES (?,?,?,?)",
    [apiKeyId, endpoint, method, ipAddress || null]
  );
}

async function getStats(apiKeyId) {
  const [[{ total_requests }]] = await pool.query(
    "SELECT COUNT(*) AS total_requests FROM api_key_usage_logs WHERE api_key_id = ?",
    [apiKeyId]
  );

  const [byEndpoint] = await pool.query(
    `SELECT endpoint, method, COUNT(*) AS hits
     FROM api_key_usage_logs
     WHERE api_key_id = ?
     GROUP BY endpoint, method
     ORDER BY hits DESC`,
    [apiKeyId]
  );

  const [recentLogs] = await pool.query(
    `SELECT endpoint, method, ip_address, accessed_at
     FROM api_key_usage_logs
     WHERE api_key_id = ?
     ORDER BY accessed_at DESC
     LIMIT 100`,
    [apiKeyId]
  );

  return { total_requests, by_endpoint: byEndpoint, recent_logs: recentLogs };
}

module.exports = {
  generateRawKey,
  create, findAll, findById, findActiveByHash,
  revoke, updateLastUsed,
  logUsage, getStats
};
