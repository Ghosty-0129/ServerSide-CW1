const pool = require("../config/db");

async function findByEmail(email) {
  const [rows] = await pool.query(
    "SELECT id, email, password_hash, role, is_verified FROM users WHERE email = ? LIMIT 1",
    [email]
  );
  return rows[0] || null;
}

async function createUser({ email, passwordHash, role = "ALUMNUS" }) {
  const [result] = await pool.query(
    "INSERT INTO users (email, password_hash, role, is_verified) VALUES (?, ?, ?, 0)",
    [email, passwordHash, role]
  );
  return { id: result.insertId, email, role, is_verified: 0 };
}

async function verifyUser(userId) {
    await pool.query(
      "UPDATE users SET is_verified = 1 WHERE id = ?",
      [userId]
  );
}


module.exports = { findByEmail, createUser };