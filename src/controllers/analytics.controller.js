const Analytics = require("../models/analytics.model");

async function overviewStats(req, res, next) {
  try {
    const stats = await Analytics.getOverviewStats();
    res.json(stats);
  } catch (err) { next(err); }
}

async function skillsGap(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data  = await Analytics.getSkillsGap(limit);
    res.json(data);
  } catch (err) { next(err); }
}

async function employmentByIndustry(req, res, next) {
  try {
    const data = await Analytics.getEmploymentByIndustry();
    res.json(data);
  } catch (err) { next(err); }
}

async function topJobTitles(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data  = await Analytics.getTopJobTitles(limit);
    res.json(data);
  } catch (err) { next(err); }
}

async function topEmployers(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const data  = await Analytics.getTopEmployers(limit);
    res.json(data);
  } catch (err) { next(err); }
}

async function programmeDistribution(req, res, next) {
  try {
    const data = await Analytics.getProgrammeDistribution();
    res.json(data);
  } catch (err) { next(err); }
}

async function graduationTrends(req, res, next) {
  try {
    const data = await Analytics.getGraduationTrends();
    res.json(data);
  } catch (err) { next(err); }
}

async function certificationGrowth(req, res, next) {
  try {
    const data = await Analytics.getCertificationGrowth();
    res.json(data);
  } catch (err) { next(err); }
}

async function professionalDevelopmentRadar(req, res, next) {
  try {
    const data = await Analytics.getProfessionalDevelopmentRadar();
    res.json(data);
  } catch (err) { next(err); }
}

async function filteredAlumni(req, res, next) {
  try {
    const filters = {
      programme:           req.query.programme           || null,
      graduation_date_from: req.query.graduation_date_from || null,
      graduation_date_to:   req.query.graduation_date_to   || null,
      industry_sector:     req.query.industry_sector     || null,
      search:              req.query.search              || null
    };
    const data = await Analytics.getFilteredAlumni(filters);
    res.json({ alumni: data, count: data.length });
  } catch (err) { next(err); }
}

async function filterOptions(req, res, next) {
  try {
    const options = await Analytics.getFilterOptions();
    res.json(options);
  } catch (err) { next(err); }
}

module.exports = {
  overviewStats, skillsGap, employmentByIndustry,
  topJobTitles, topEmployers, programmeDistribution,
  graduationTrends, certificationGrowth, professionalDevelopmentRadar,
  filteredAlumni, filterOptions
};
