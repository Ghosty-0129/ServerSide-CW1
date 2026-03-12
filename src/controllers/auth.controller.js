const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const EmailVerificationOtp = require("../models/emailVerificationOtp.model");
const { generateOtp, hashOtp } = require("../utils/otp");
const { sendVerificationOtp, sendPasswordResetOtp } = require("../utils/mailer");
const PasswordResetOtp = require("../models/passwordResetOtp.model");


function isStrongPassword(pw) {
  return (
    typeof pw === "string" &&
    pw.length >= 10 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /\d/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}

function validateEmailDomain(email) {
  const allowed = process.env.ALLOWED_EMAIL_DOMAIN;
  const parts = String(email || "").toLowerCase().split("@");
  if (parts.length !== 2) return false;
  return parts[1] === allowed;
}

function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h"
  });
}


async function register(req, res, next) {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!validateEmailDomain(email)) {
      return res.status(400).json({
        message: `Email must be within @${process.env.ALLOWED_EMAIL_DOMAIN}`
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 10 chars and include upper, lower, number, and special character"
      });
    }

    const existing = await User.findByEmail(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.createUser({ email: email.toLowerCase(), passwordHash, role: role });

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    const expiresAt = new Date(
      Date.now() + (Number(process.env.OTP_EXPIRES_MINUTES || 10) * 60 * 1000)
    );

    await EmailVerificationOtp.deleteByUserId(user.id);
    await EmailVerificationOtp.create(user.id, otpHash, expiresAt);

    await sendVerificationOtp(user.email, otp);

    return res.status(201).json({
      message: "Registered successfully. Please verify your email before logging in.",
      user: { id: user.id, email: user.email, role: user.role, isVerified: false }
    });
  } catch (err) {
    next(err);
  }
}

async function resendEmailOtp(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findByEmail(normalizedEmail);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(
      Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 10) * 60 * 1000
    );

    await EmailVerificationOtp.deleteByUserId(user.id);
    await EmailVerificationOtp.create(user.id, otpHash, expiresAt);

    if (process.env.NODE_ENV === "development") {
      console.log(`RESEND DEV OTP for ${user.email}: ${otp}`);
    } else {
      await sendVerificationOtp(user.email, otp);
    }

    return res.status(200).json({
      message: "A new OTP has been sent to your email"
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findByEmail(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.is_verified) {
      return res.status(403).json({
        message: "Email not verified. Please verify your email before logging in."
      });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken({ userId: user.id, role: user.role });

    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
}

async function verifyEmailOtp(req, res, next) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findByEmail(email.toLowerCase());
    if (!user) {
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    if (user.is_verified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    const otpRecord = await EmailVerificationOtp.findByUserId(user.id);
    if (!otpRecord) {
      return res.status(400).json({ message: "No OTP found for this user" });
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      await EmailVerificationOtp.deleteById(otpRecord.id);
      return res.status(400).json({ message: "OTP has expired" });
    }

    const incomingHash = hashOtp(otp);

    if (incomingHash !== otpRecord.otp_hash) {
      await EmailVerificationOtp.incrementAttempts(otpRecord.id);
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    await User.verifyUser(user.id);
    await EmailVerificationOtp.deleteById(otpRecord.id);

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findByEmail(normalizedEmail);

    if (!user) {
      return res.status(200).json({
        message: "If the email exists, a password reset OTP has been sent"
      });
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(
      Date.now() + Number(process.env.OTP_EXPIRES_MINUTES || 10) * 60 * 1000
    );

    await PasswordResetOtp.deleteByUserId(user.id);
    await PasswordResetOtp.create(user.id, otpHash, expiresAt);

    if (process.env.NODE_ENV === "development") {
      console.log(`PASSWORD RESET OTP for ${user.email}: ${otp}`);
    } else {
      await sendPasswordResetOtp(user.email, otp);
    }

    return res.status(200).json({
      message: "If the email exists, a password reset OTP has been sent"
    });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and newPassword are required"
      });
    }

    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({
        message:
          "Password must be at least 10 chars and include upper, lower, number, and special character"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findByEmail(normalizedEmail);

    if (!user) {
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    const otpRecord = await PasswordResetOtp.findByUserId(user.id);

    if (!otpRecord) {
      return res.status(400).json({ message: "No reset OTP found for this user" });
    }

    if (new Date() > new Date(otpRecord.expires_at)) {
      await PasswordResetOtp.deleteById(otpRecord.id);
      return res.status(400).json({ message: "OTP has expired" });
    }

    const incomingHash = hashOtp(otp);

    if (incomingHash !== otpRecord.otp_hash) {
      await PasswordResetOtp.incrementAttempts(otpRecord.id);
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    await User.updatePassword(user.id, newPasswordHash);
    await PasswordResetOtp.deleteById(otpRecord.id);

    return res.status(200).json({
      message: "Password has been reset successfully"
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { 
  register, 
  login, 
  verifyEmailOtp, 
  resendEmailOtp,
  forgotPassword, 
  resetPassword
};