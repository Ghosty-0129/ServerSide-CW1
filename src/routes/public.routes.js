const router = require("express").Router();
const ctrl   = require("../controllers/public.controller");
const { apiKeyAuth } = require("../middleware/apiKey.middleware");

router.get("/alumni/today", apiKeyAuth, ctrl.getTodaysAlumnus);

module.exports = router;
