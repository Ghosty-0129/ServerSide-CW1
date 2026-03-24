const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendVerificationOtp(email, otp) {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Email Verification",
        html: `
            <h2>Email Verification</h2>
            <p>Your verification OTP is:</p>
            <h1>${otp}</h1>
            <p>This OTP will expire in ${process.env.OTP_EXPIRES_MINUTES || 10} minutes.</p>
        `
    });
    
}

async function sendPasswordResetOtp(email, otp) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Password Reset</h2>
      <p>Your password reset OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in ${process.env.OTP_EXPIRES_MINUTES || 10} minutes.</p>
    `
  });
}


module.exports = { 
    sendVerificationOtp, 
    sendPasswordResetOtp 
};