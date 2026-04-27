const router = require("express").Router();
const ctrl   = require("../controllers/analytics.controller");
const { requirePermission } = require("../middleware/permissions.middleware");

router.get("/overview",        requirePermission("read:analytics"), ctrl.overviewStats);
router.get("/skills-gap",      requirePermission("read:analytics"), ctrl.skillsGap);
router.get("/industry",        requirePermission("read:analytics"), ctrl.employmentByIndustry);
router.get("/job-titles",      requirePermission("read:analytics"), ctrl.topJobTitles);
router.get("/employers",       requirePermission("read:analytics"), ctrl.topEmployers);
router.get("/programmes",      requirePermission("read:analytics"), ctrl.programmeDistribution);
router.get("/graduation",      requirePermission("read:analytics"), ctrl.graduationTrends);
router.get("/cert-growth",     requirePermission("read:analytics"), ctrl.certificationGrowth);
router.get("/radar",           requirePermission("read:analytics"), ctrl.professionalDevelopmentRadar);

router.get("/alumni",          requirePermission("read:alumni"),    ctrl.filteredAlumni);
router.get("/alumni/filters",  requirePermission("read:alumni"),    ctrl.filterOptions);

module.exports = router;
