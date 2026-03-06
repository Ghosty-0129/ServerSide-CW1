const router = require("express").Router();
const { register, login, verifyEmailOtp } = require("../controllers/auth.controller");

router.post("/register", register);
router.post("/login", login);
router.post("/verify-email-otp", verifyEmailOtp);

module.exports = router;