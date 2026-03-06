const pool = require("../config/db");

class EmailVerificationOtp {
  static async deleteByUserId(userId) {
    await pool.query(
      "DELETE FROM email_verification_otps WHERE user_id = ?",
      [userId]
    );
  }

  static async create(userId, otpHash, expiresAt) {
    const [result] = await pool.query(
      "INSERT INTO email_verification_otps (user_id, otp_hash, expires_at) VALUES (?, ?, ?)",
      [userId, otpHash, expiresAt]
    );

    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query(
      "SELECT * FROM email_verification_otps WHERE user_id = ? ORDER BY created_at DESC LIMIT 1",
      [userId]
    );
    return rows[0] || null;
  }

  static async incrementAttempts(id) {
    await pool.query(
      "UPDATE email_verification_otps SET attempts = attempts + 1 WHERE id = ?",
      [id]
    );
  }

  static async deleteById(id) {
    await pool.query(
      "DELETE FROM email_verification_otps WHERE id = ?",
      [id]
    );
  }
}

module.exports = EmailVerificationOtp;