const pool = require("../config/db");

async function getOverviewStats() {
  const [[row]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'alumnus')            AS total_alumni,
      (SELECT COUNT(*) FROM alumni_profiles)                         AS total_profiles,
      (SELECT COUNT(*) FROM alumni_certifications)                   AS total_certifications,
      (SELECT COUNT(*) FROM alumni_degrees)                          AS total_degrees,
      (SELECT COUNT(*) FROM alumni_licences)                         AS total_licences,
      (SELECT COUNT(*) FROM alumni_courses)                          AS total_courses,
      (SELECT COUNT(*) FROM alumni_employment)                       AS total_employment_records,
      (SELECT COUNT(*) FROM bids WHERE status = 'pending')           AS active_bids,
      (SELECT COUNT(*) FROM alumni_profiles WHERE is_active_today=1) AS featured_today
  `);
  return row;
}

async function getSkillsGap(limit = 10) {
  const [rows] = await pool.query(`
    SELECT certification_name AS skill, COUNT(*) AS count
    FROM alumni_certifications
    GROUP BY certification_name
    ORDER BY count DESC
    LIMIT ?
  `, [limit]);
  return rows;
}

async function getEmploymentByIndustry() {
  const [rows] = await pool.query(`
    SELECT
      COALESCE(industry_sector, 'Not Specified') AS industry,
      COUNT(*) AS count
    FROM alumni_profiles
    GROUP BY industry_sector
    ORDER BY count DESC
  `);
  return rows;
}

async function getTopJobTitles(limit = 10) {
  const [rows] = await pool.query(`
    SELECT job_title, COUNT(*) AS count
    FROM alumni_employment
    GROUP BY job_title
    ORDER BY count DESC
    LIMIT ?
  `, [limit]);
  return rows;
}

async function getTopEmployers(limit = 10) {
  const [rows] = await pool.query(`
    SELECT company, COUNT(*) AS count
    FROM alumni_employment
    GROUP BY company
    ORDER BY count DESC
    LIMIT ?
  `, [limit]);
  return rows;
}

async function getProgrammeDistribution() {
  const [rows] = await pool.query(`
    SELECT
      COALESCE(programme, 'Not Specified') AS programme,
      COUNT(*) AS count
    FROM alumni_profiles
    GROUP BY programme
    ORDER BY count DESC
  `);
  return rows;
}

async function getGraduationTrends() {
  const [rows] = await pool.query(`
    SELECT
      YEAR(graduation_date) AS year,
      COUNT(*) AS count
    FROM alumni_profiles
    WHERE graduation_date IS NOT NULL
    GROUP BY YEAR(graduation_date)
    ORDER BY year ASC
  `);
  return rows;
}

async function getCertificationGrowth() {
  const [rows] = await pool.query(`
    SELECT
      DATE_FORMAT(created_at, '%Y-%m') AS month,
      COUNT(*) AS count
    FROM alumni_certifications
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
    GROUP BY month
    ORDER BY month ASC
  `);
  return rows;
}

async function getProfessionalDevelopmentRadar() {
  const [[row]] = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM alumni_certifications) AS certifications,
      (SELECT COUNT(*) FROM alumni_degrees)        AS degrees,
      (SELECT COUNT(*) FROM alumni_licences)       AS licences,
      (SELECT COUNT(*) FROM alumni_courses)        AS courses,
      (SELECT COUNT(*) FROM alumni_employment)     AS employment_records
  `);
  return row;
}

async function getFilteredAlumni({ programme, graduation_date_from, graduation_date_to, industry_sector, search }) {
  let query = `
    SELECT
      p.id, p.user_id, u.email,
      p.first_name, p.last_name, p.biography,
      p.linkedin_url, p.profile_image_path,
      p.programme, p.graduation_date, p.industry_sector,
      p.appearance_count, p.is_active_today,
      (SELECT COUNT(*) FROM alumni_certifications WHERE profile_id = p.id) AS cert_count,
      (SELECT COUNT(*) FROM alumni_degrees       WHERE profile_id = p.id) AS degree_count,
      (SELECT COUNT(*) FROM alumni_employment    WHERE profile_id = p.id) AS employment_count
    FROM alumni_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE 1=1
  `;
  const params = [];

  if (programme) {
    query += " AND p.programme = ?";
    params.push(programme);
  }
  if (graduation_date_from) {
    query += " AND p.graduation_date >= ?";
    params.push(graduation_date_from);
  }
  if (graduation_date_to) {
    query += " AND p.graduation_date <= ?";
    params.push(graduation_date_to);
  }
  if (industry_sector) {
    query += " AND p.industry_sector = ?";
    params.push(industry_sector);
  }
  if (search) {
    query += " AND (p.first_name LIKE ? OR p.last_name LIKE ? OR u.email LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  query += " ORDER BY p.created_at DESC";

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getFilterOptions() {
  const [programmes]  = await pool.query("SELECT DISTINCT programme FROM alumni_profiles WHERE programme IS NOT NULL ORDER BY programme");
  const [industries]  = await pool.query("SELECT DISTINCT industry_sector FROM alumni_profiles WHERE industry_sector IS NOT NULL ORDER BY industry_sector");
  return {
    programmes:  programmes.map(r => r.programme),
    industries:  industries.map(r => r.industry_sector)
  };
}

module.exports = {
  getOverviewStats,
  getSkillsGap,
  getEmploymentByIndustry,
  getTopJobTitles,
  getTopEmployers,
  getProgrammeDistribution,
  getGraduationTrends,
  getCertificationGrowth,
  getProfessionalDevelopmentRadar,
  getFilteredAlumni,
  getFilterOptions
};
