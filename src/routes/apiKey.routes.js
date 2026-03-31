const router = require("express").Router();
const ctrl   = require("../controllers/apiKey.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

router.use(protect, requireRole("admin"));
router.post("/", ctrl.generateApiKey);
router.get("/", ctrl.listApiKeys);
router.get("/:id/stats", ctrl.getApiKeyStats);
router.delete("/:id", ctrl.revokeApiKey);

module.exports = router;
