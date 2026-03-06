const nodemailer = require("nodemailer");
require("dotenv").config();

const transponder = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendVerificationOtp(email, otp) {
    await transponder.sendMail({
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

module.exports = { sendVerificationOtp };