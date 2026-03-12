const router = require("express").Router();
const {
  register,
  verifyEmailOtp,
  resendEmailOtp,
  forgotPassword,
  resetPassword,
  login
} = require("../controllers/auth.controller");


router.post("/register", register);
router.post("/login", login);
router.post("/verify-email-otp", verifyEmailOtp);
router.post("/resend-email-otp", resendEmailOtp);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;