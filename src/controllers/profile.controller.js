const path    = require("path");
const fs      = require("fs");
const Profile = require("../models/profile.model");

function isValidUrl(str) {
  if (!str) return true; 
  try { new URL(str); return true; } catch { return false; }
}

async function resolveProfile(req, res) {
  const profile = await Profile.findByUserId(req.user.userId);
  if (!profile) {
    res.status(404).json({ message: "Profile not found. Create your profile first." });
    return null;
  }
  return profile;
}

async function getMyProfile(req, res, next) {
  try {
    const profile = await Profile.getFullProfile(req.user.userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) { next(err); }
}

async function createProfile(req, res, next) {
  try {
    const existing = await Profile.findByUserId(req.user.userId);
    if (existing) return res.status(409).json({ message: "Profile already exists" });

    const id = await Profile.createProfile(req.user.userId);
    res.status(201).json({ message: "Profile created", profileId: id });
  } catch (err) { next(err); }
}

async function updateProfile(req, res, next) {
  try {
    const { first_name, last_name, biography, linkedin_url } = req.body;

    if (linkedin_url && !isValidUrl(linkedin_url)) {
      return res.status(400).json({ message: "Invalid LinkedIn URL" });
    }

    const profile = await resolveProfile(req, res);
    if (!profile) return;

    await Profile.updateBasicInfo(req.user.userId, { first_name, last_name, biography, linkedin_url });
    res.json({ message: "Profile updated successfully" });
  } catch (err) { next(err); }
}

async function uploadProfileImage(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    if (!req.file) return res.status(400).json({ message: "No image file provided" });

    // Delete old image if it exists
    if (profile.profile_image_path) {
      const oldPath = path.join(__dirname, "..", profile.profile_image_path);
      fs.unlink(oldPath, () => {}); // best-effort delete
    }

    const relativePath = `uploads/profiles/${req.file.filename}`;
    await Profile.updateProfileImage(req.user.userId, relativePath);

    res.json({
      message:    "Profile image uploaded",
      imageUrl:   `${process.env.BASE_URL || ""}/${relativePath}`
    });
  } catch (err) { next(err); }
}

async function addDegree(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    const { degree_name, institution, degree_url, completion_date } = req.body;
    if (!degree_name) return res.status(400).json({ message: "degree_name is required" });
    if (!isValidUrl(degree_url)) return res.status(400).json({ message: "Invalid degree_url" });

    const id = await Profile.addDegree(profile.id, { degree_name, institution, degree_url, completion_date });
    res.status(201).json({ message: "Degree added", id });
  } catch (err) { next(err); }
}

async function updateDegree(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    const { degree_url } = req.body;
    if (!isValidUrl(degree_url)) return res.status(400).json({ message: "Invalid degree_url" });

    const rows = await Profile.updateDegree(req.params.id, profile.id, req.body);
    if (!rows) return res.status(404).json({ message: "Degree not found" });
    res.json({ message: "Degree updated" });
  } catch (err) { next(err); }
}

async function deleteDegree(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    const rows = await Profile.deleteDegree(req.params.id, profile.id);
    if (!rows) return res.status(404).json({ message: "Degree not found" });
    res.json({ message: "Degree deleted" });
  } catch (err) { next(err); }
}

async function addCertification(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    const { certification_name, issuing_body, cert_url, completion_date } = req.body;
    if (!certification_name) return res.status(400).json({ message: "certification_name is required" });
    if (!isValidUrl(cert_url)) return res.status(400).json({ message: "Invalid cert_url" });

    const id = await Profile.addCertification(profile.id, { certification_name, issuing_body, cert_url, completion_date });
    res.status(201).json({ message: "Certification added", id });
  } catch (err) { next(err); }
}

async function updateCertification(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    if (!isValidUrl(req.body.cert_url)) return res.status(400).json({ message: "Invalid cert_url" });

    const rows = await Profile.updateCertification(req.params.id, profile.id, req.body);
    if (!rows) return res.status(404).json({ message: "Certification not found" });
    res.json({ message: "Certification updated" });
  } catch (err) { next(err); }
}

async function deleteCertification(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    const rows = await Profile.deleteCertification(req.params.id, profile.id);
    if (!rows) return res.status(404).json({ message: "Certification not found" });
    res.json({ message: "Certification deleted" });
  } catch (err) { next(err); }
}

async function addLicence(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    const { licence_name, awarding_body, licence_url, completion_date } = req.body;
    if (!licence_name) return res.status(400).json({ message: "licence_name is required" });
    if (!isValidUrl(licence_url)) return res.status(400).json({ message: "Invalid licence_url" });

    const id = await Profile.addLicence(profile.id, { licence_name, awarding_body, licence_url, completion_date });
    res.status(201).json({ message: "Licence added", id });
  } catch (err) { next(err); }
}

async function updateLicence(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    if (!isValidUrl(req.body.licence_url)) return res.status(400).json({ message: "Invalid licence_url" });

    const rows = await Profile.updateLicence(req.params.id, profile.id, req.body);
    if (!rows) return res.status(404).json({ message: "Licence not found" });
    res.json({ message: "Licence updated" });
  } catch (err) { next(err); }
}

async function deleteLicence(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    const rows = await Profile.deleteLicence(req.params.id, profile.id);
    if (!rows) return res.status(404).json({ message: "Licence not found" });
    res.json({ message: "Licence deleted" });
  } catch (err) { next(err); }
}

async function addCourse(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    const { course_name, provider, course_url, completion_date } = req.body;
    if (!course_name) return res.status(400).json({ message: "course_name is required" });
    if (!isValidUrl(course_url)) return res.status(400).json({ message: "Invalid course_url" });

    const id = await Profile.addCourse(profile.id, { course_name, provider, course_url, completion_date });
    res.status(201).json({ message: "Course added", id });
  } catch (err) { next(err); }
}

async function updateCourse(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    if (!isValidUrl(req.body.course_url)) return res.status(400).json({ message: "Invalid course_url" });

    const rows = await Profile.updateCourse(req.params.id, profile.id, req.body);
    if (!rows) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course updated" });
  } catch (err) { next(err); }
}

async function deleteCourse(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    const rows = await Profile.deleteCourse(req.params.id, profile.id);
    if (!rows) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) { next(err); }
}

async function addEmployment(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    const { job_title, company, start_date, end_date } = req.body;
    if (!job_title || !company || !start_date) {
      return res.status(400).json({ message: "job_title, company and start_date are required" });
    }

    const id = await Profile.addEmployment(profile.id, { job_title, company, start_date, end_date });
    res.status(201).json({ message: "Employment record added", id });
  } catch (err) { next(err); }
}

async function updateEmployment(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    const rows = await Profile.updateEmployment(req.params.id, profile.id, req.body);
    if (!rows) return res.status(404).json({ message: "Employment record not found" });
    res.json({ message: "Employment record updated" });
  } catch (err) { next(err); }
}

async function deleteEmployment(req, res, next) {
  try {
    const profile = await resolveProfile(req, res);
    if (!profile) return;

    const rows = await Profile.deleteEmployment(req.params.id, profile.id);
    if (!rows) return res.status(404).json({ message: "Employment record not found" });
    res.json({ message: "Employment record deleted" });
  } catch (err) { next(err); }
}

module.exports = {
  getMyProfile, createProfile, updateProfile, uploadProfileImage,
  addDegree, updateDegree, deleteDegree,
  addCertification, updateCertification, deleteCertification,
  addLicence, updateLicence, deleteLicence,
  addCourse, updateCourse, deleteCourse,
  addEmployment, updateEmployment, deleteEmployment
};
