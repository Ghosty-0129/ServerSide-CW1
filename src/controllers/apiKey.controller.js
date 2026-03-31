const ApiKey = require("../models/apiKey.model");

async function generateApiKey(req, res, next) {
  try {
    const { client_name } = req.body;
    if (!client_name || !client_name.trim()) {
      return res.status(400).json({ message: "client_name is required" });
    }

    const { rawKey, keyHash, keyPrefix } = ApiKey.generateRawKey();

    const id = await ApiKey.create(client_name.trim(), keyHash, keyPrefix, req.user.userId);

    res.status(201).json({
      message:     "API key generated. Store it securely — it will not be shown again.",
      id,
      client_name: client_name.trim(),
      key_prefix:  keyPrefix,
      api_key:     rawKey    // shown once only
    });
  } catch (err) { next(err); }
}

async function listApiKeys(req, res, next) {
  try {
    const keys = await ApiKey.findAll();
    res.json({ api_keys: keys });
  } catch (err) { next(err); }
}

async function revokeApiKey(req, res, next) {
  try {
    const key = await ApiKey.findById(req.params.id);
    if (!key) return res.status(404).json({ message: "API key not found" });

    if (!key.is_active) {
      return res.status(400).json({ message: "API key is already revoked" });
    }

    await ApiKey.revoke(req.params.id);
    res.json({ message: `API key for "${key.client_name}" has been revoked` });
  } catch (err) { next(err); }
}

async function getApiKeyStats(req, res, next) {
  try {
    const key = await ApiKey.findById(req.params.id);
    if (!key) return res.status(404).json({ message: "API key not found" });

    const stats = await ApiKey.getStats(req.params.id);

    res.json({
      key_id:       key.id,
      client_name:  key.client_name,
      key_prefix:   key.key_prefix,
      is_active:    Boolean(key.is_active),
      last_used_at: key.last_used_at,
      ...stats
    });
  } catch (err) { next(err); }
}

module.exports = { generateApiKey, listApiKeys, revokeApiKey, getApiKeyStats };
