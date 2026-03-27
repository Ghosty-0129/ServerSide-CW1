const pool = require("../config/db");

async function create(userId, bidDate, amount) {
  const [result] = await pool.query(
    "INSERT INTO bids (user_id, bid_date, amount) VALUES (?, ?, ?)",
    [userId, bidDate, amount]
  );
  return result.insertId;
}

async function findByUserAndDate(userId, bidDate) {
  const [rows] = await pool.query(
    "SELECT * FROM bids WHERE user_id = ? AND bid_date = ? LIMIT 1",
    [userId, bidDate]
  );
  return rows[0] || null;
}

async function findByUser(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM bids WHERE user_id = ? ORDER BY bid_date DESC",
    [userId]
  );
  return rows;
}

async function increaseAmount(id, userId, newAmount) {
  const [result] = await pool.query(
    `UPDATE bids SET amount = ?
     WHERE id = ? AND user_id = ? AND status = 'pending' AND amount < ?`,
    [newAmount, id, userId, newAmount]
  );
  return result.affectedRows;
}

async function cancelBid(id, userId) {
  const [result] = await pool.query(
    "DELETE FROM bids WHERE id = ? AND user_id = ? AND status = 'pending'",
    [id, userId]
  );
  return result.affectedRows;
}

async function getBidStatus(userId, bidDate) {
  const [userBidRows] = await pool.query(
    "SELECT amount FROM bids WHERE user_id = ? AND bid_date = ? LIMIT 1",
    [userId, bidDate]
  );
  if (!userBidRows[0]) return null;

  const [highestRows] = await pool.query(
    "SELECT MAX(amount) AS highest FROM bids WHERE bid_date = ?",
    [bidDate]
  );

  const userAmount  = parseFloat(userBidRows[0].amount);
  const highest     = parseFloat(highestRows[0].highest || 0);
  const isWinning   = userAmount >= highest; // tie goes to this user (first bid wins tie)

  return { isWinning, yourBid: userAmount };
}

async function getBidsForDateOrdered(bidDate) {
  const [rows] = await pool.query(
    `SELECT b.*, ap.id AS profile_id
     FROM bids b
     JOIN alumni_profiles ap ON ap.user_id = b.user_id
     WHERE b.bid_date = ? AND b.status = 'pending'
     ORDER BY b.amount DESC`,
    [bidDate]
  );
  return rows;
}

async function settleDay(winnerBidId, bidDate) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("UPDATE bids SET status = 'won'  WHERE id = ?",                    [winnerBidId]);
    await conn.query("UPDATE bids SET status = 'lost' WHERE bid_date = ? AND id != ?",  [bidDate, winnerBidId]);
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function markAllLost(bidDate) {
  await pool.query(
    "UPDATE bids SET status = 'lost' WHERE bid_date = ? AND status = 'pending'",
    [bidDate]
  );
}

async function activateProfile(profileId) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // Reset
    await conn.query("UPDATE alumni_profiles SET is_active_today = 0 WHERE is_active_today = 1");
    // Activate and increment
    await conn.query(
      "UPDATE alumni_profiles SET is_active_today = 1, appearance_count = appearance_count + 1 WHERE id = ?",
      [profileId]
    );
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getMonthlyRecord(userId, year, month) {
  const [rows] = await pool.query(
    "SELECT * FROM monthly_bid_wins WHERE user_id = ? AND year = ? AND month = ? LIMIT 1",
    [userId, year, month]
  );
  return rows[0] || null;
}

async function getMonthlyLimit(userId, year, month) {
  const record = await getMonthlyRecord(userId, year, month);
  if (!record) return { wins: 0, limit: 3, remaining: 3, eventBonus: false };
  const limit = 3 + (record.event_bonus ? 1 : 0);
  return {
    wins:       record.win_count,
    limit,
    remaining:  Math.max(0, limit - record.win_count),
    eventBonus: Boolean(record.event_bonus)
  };
}

async function hasReachedMonthlyLimit(userId, year, month) {
  const { wins, limit } = await getMonthlyLimit(userId, year, month);
  return wins >= limit;
}

async function incrementMonthlyWins(userId, year, month) {
  await pool.query(
    `INSERT INTO monthly_bid_wins (user_id, year, month, win_count)
     VALUES (?, ?, ?, 1)
     ON DUPLICATE KEY UPDATE win_count = win_count + 1`,
    [userId, year, month]
  );
}

async function grantEventBonus(userId, year, month) {
  await pool.query(
    `INSERT INTO monthly_bid_wins (user_id, year, month, win_count, event_bonus)
     VALUES (?, ?, ?, 0, 1)
     ON DUPLICATE KEY UPDATE event_bonus = 1`,
    [userId, year, month]
  );
}

async function getTodaysFeatured() {
  const [rows] = await pool.query(
    `SELECT
       p.id, p.first_name, p.last_name, p.biography, p.linkedin_url,
       p.profile_image_path, p.appearance_count,
       u.email
     FROM alumni_profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.is_active_today = 1
     LIMIT 1`
  );
  if (!rows[0]) return null;
  const profile = rows[0];

  const [degrees, certs, licences, courses, employment] = await Promise.all([
    pool.query("SELECT * FROM alumni_degrees       WHERE profile_id = ? ORDER BY completion_date DESC", [profile.id]),
    pool.query("SELECT * FROM alumni_certifications WHERE profile_id = ? ORDER BY completion_date DESC", [profile.id]),
    pool.query("SELECT * FROM alumni_licences       WHERE profile_id = ? ORDER BY completion_date DESC", [profile.id]),
    pool.query("SELECT * FROM alumni_courses        WHERE profile_id = ? ORDER BY completion_date DESC", [profile.id]),
    pool.query("SELECT * FROM alumni_employment     WHERE profile_id = ? ORDER BY start_date DESC",      [profile.id])
  ]);

  return {
    ...profile,
    degrees:        degrees[0],
    certifications: certs[0],
    licences:       licences[0],
    courses:        courses[0],
    employment:     employment[0]
  };
}

module.exports = {
  create, findByUserAndDate, findByUser, increaseAmount, cancelBid, getBidStatus,
  getBidsForDateOrdered, settleDay, markAllLost,
  activateProfile,
  getMonthlyRecord, getMonthlyLimit, hasReachedMonthlyLimit,
  incrementMonthlyWins, grantEventBonus,
  getTodaysFeatured
};
