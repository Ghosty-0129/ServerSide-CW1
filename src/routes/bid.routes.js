const router  = require("express").Router();
const ctrl    = require("../controllers/bid.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

router.use(protect);
router.get("/tomorrow", ctrl.getTomorrowSlot);
router.get("/me/status", ctrl.getBidStatus);
router.get("/me/monthly", ctrl.getMonthlyStatus);
router.get("/me", ctrl.getMyBids);
router.post("/", ctrl.placeBid);
router.put("/:id", ctrl.updateBid);
router.delete("/:id", ctrl.cancelBid);
router.post("/admin/event-bonus", requireRole("admin"), ctrl.grantEventBonus);

module.exports = router;
