const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

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
    const { email, password } = req.body;

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
    const user = await User.createUser({ email: email.toLowerCase(), passwordHash });

    return res.status(201).json({
      message: "Registered successfully. Please verify your email before logging in.",
      user: { id: user.id, email: user.email, role: user.role, isVerified: false }
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

module.exports = { register, login, verifyEmailOtp };