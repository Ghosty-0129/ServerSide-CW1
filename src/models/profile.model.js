const pool = require("../config/db");

async function findByUserId(userId) {
  const [rows] = await pool.query(
    "SELECT * FROM alumni_profiles WHERE user_id = ? LIMIT 1",
    [userId]
  );
  return rows[0] || null;
}

async function getFullProfile(userId) {
  const [profiles] = await pool.query(
    `SELECT p.*, u.email
     FROM alumni_profiles p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = ?`,
    [userId]
  );
  if (!profiles[0]) return null;
  const profile = profiles[0];

  const [degrees, certs, licences, courses, employment] = await Promise.all([
    pool.query("SELECT * FROM alumni_degrees       WHERE profile_id = ? ORDER BY completion_date DESC", [profile.id]),
    pool.query("SELECT * FROM alumni_certifications WHERE profile_id = ? ORDER BY completion_date DESC", [profile.id]),
    pool.query("SELECT * FROM alumni_licences       WHERE profile_id = ? ORDER BY completion_date DESC", [profile.id]),
    pool.query("SELECT * FROM alumni_courses        WHERE profile_id = ? ORDER BY completion_date DESC", [profile.id]),
    pool.query("SELECT * FROM alumni_employment     WHERE profile_id = ? ORDER BY start_date DESC",      [profile.id])
  ]);

  return {
    ...profile,
    degrees:       degrees[0],
    certifications: certs[0],
    licences:      licences[0],
    courses:       courses[0],
    employment:    employment[0]
  };
}

async function createProfile(userId) {
  const [result] = await pool.query(
    "INSERT INTO alumni_profiles (user_id) VALUES (?)",
    [userId]
  );
  return result.insertId;
}

async function updateBasicInfo(userId, { first_name, last_name, biography, linkedin_url }) {
  await pool.query(
    `UPDATE alumni_profiles
     SET first_name = ?, last_name = ?, biography = ?, linkedin_url = ?
     WHERE user_id = ?`,
    [first_name, last_name, biography, linkedin_url, userId]
  );
}

async function updateProfileImage(userId, imagePath) {
  await pool.query(
    "UPDATE alumni_profiles SET profile_image_path = ? WHERE user_id = ?",
    [imagePath, userId]
  );
}


async function addDegree(profileId, { degree_name, institution, degree_url, completion_date }) {
  const [result] = await pool.query(
    "INSERT INTO alumni_degrees (profile_id, degree_name, institution, degree_url, completion_date) VALUES (?,?,?,?,?)",
    [profileId, degree_name, institution, degree_url, completion_date]
  );
  return result.insertId;
}

async function updateDegree(id, profileId, { degree_name, institution, degree_url, completion_date }) {
  const [result] = await pool.query(
    `UPDATE alumni_degrees
     SET degree_name = ?, institution = ?, degree_url = ?, completion_date = ?
     WHERE id = ? AND profile_id = ?`,
    [degree_name, institution, degree_url, completion_date, id, profileId]
  );
  return result.affectedRows;
}

async function deleteDegree(id, profileId) {
  const [result] = await pool.query(
    "DELETE FROM alumni_degrees WHERE id = ? AND profile_id = ?",
    [id, profileId]
  );
  return result.affectedRows;
}

async function addCertification(profileId, { certification_name, issuing_body, cert_url, completion_date }) {
  const [result] = await pool.query(
    "INSERT INTO alumni_certifications (profile_id, certification_name, issuing_body, cert_url, completion_date) VALUES (?,?,?,?,?)",
    [profileId, certification_name, issuing_body, cert_url, completion_date]
  );
  return result.insertId;
}

async function updateCertification(id, profileId, { certification_name, issuing_body, cert_url, completion_date }) {
  const [result] = await pool.query(
    `UPDATE alumni_certifications
     SET certification_name = ?, issuing_body = ?, cert_url = ?, completion_date = ?
     WHERE id = ? AND profile_id = ?`,
    [certification_name, issuing_body, cert_url, completion_date, id, profileId]
  );
  return result.affectedRows;
}

async function deleteCertification(id, profileId) {
  const [result] = await pool.query(
    "DELETE FROM alumni_certifications WHERE id = ? AND profile_id = ?",
    [id, profileId]
  );
  return result.affectedRows;
}


async function addLicence(profileId, { licence_name, awarding_body, licence_url, completion_date }) {
  const [result] = await pool.query(
    "INSERT INTO alumni_licences (profile_id, licence_name, awarding_body, licence_url, completion_date) VALUES (?,?,?,?,?)",
    [profileId, licence_name, awarding_body, licence_url, completion_date]
  );
  return result.insertId;
}

async function updateLicence(id, profileId, { licence_name, awarding_body, licence_url, completion_date }) {
  const [result] = await pool.query(
    `UPDATE alumni_licences
     SET licence_name = ?, awarding_body = ?, licence_url = ?, completion_date = ?
     WHERE id = ? AND profile_id = ?`,
    [licence_name, awarding_body, licence_url, completion_date, id, profileId]
  );
  return result.affectedRows;
}

async function deleteLicence(id, profileId) {
  const [result] = await pool.query(
    "DELETE FROM alumni_licences WHERE id = ? AND profile_id = ?",
    [id, profileId]
  );
  return result.affectedRows;
}


async function addCourse(profileId, { course_name, provider, course_url, completion_date }) {
  const [result] = await pool.query(
    "INSERT INTO alumni_courses (profile_id, course_name, provider, course_url, completion_date) VALUES (?,?,?,?,?)",
    [profileId, course_name, provider, course_url, completion_date]
  );
  return result.insertId;
}

async function updateCourse(id, profileId, { course_name, provider, course_url, completion_date }) {
  const [result] = await pool.query(
    `UPDATE alumni_courses
     SET course_name = ?, provider = ?, course_url = ?, completion_date = ?
     WHERE id = ? AND profile_id = ?`,
    [course_name, provider, course_url, completion_date, id, profileId]
  );
  return result.affectedRows;
}

async function deleteCourse(id, profileId) {
  const [result] = await pool.query(
    "DELETE FROM alumni_courses WHERE id = ? AND profile_id = ?",
    [id, profileId]
  );
  return result.affectedRows;
}


async function addEmployment(profileId, { job_title, company, start_date, end_date }) {
  const [result] = await pool.query(
    "INSERT INTO alumni_employment (profile_id, job_title, company, start_date, end_date) VALUES (?,?,?,?,?)",
    [profileId, job_title, company, start_date, end_date || null]
  );
  return result.insertId;
}

async function updateEmployment(id, profileId, { job_title, company, start_date, end_date }) {
  const [result] = await pool.query(
    `UPDATE alumni_employment
     SET job_title = ?, company = ?, start_date = ?, end_date = ?
     WHERE id = ? AND profile_id = ?`,
    [job_title, company, start_date, end_date || null, id, profileId]
  );
  return result.affectedRows;
}

async function deleteEmployment(id, profileId) {
  const [result] = await pool.query(
    "DELETE FROM alumni_employment WHERE id = ? AND profile_id = ?",
    [id, profileId]
  );
  return result.affectedRows;
}

module.exports = {
  findByUserId, getFullProfile, createProfile, updateBasicInfo, updateProfileImage,
  addDegree, updateDegree, deleteDegree,
  addCertification, updateCertification, deleteCertification,
  addLicence, updateLicence, deleteLicence,
  addCourse, updateCourse, deleteCourse,
  addEmployment, updateEmployment, deleteEmployment
};
