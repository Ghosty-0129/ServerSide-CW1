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

async function sendBidWinNotification(email, date, amount) {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: `🏆 You won the Alumni Spotlight for ${date}!`,
    html: `
      <h2>Congratulations! You are Alumni of the Day</h2>
      <p>Your bid of <strong>£${Number(amount).toFixed(2)}</strong> was the highest for <strong>${date}</strong>.</p>
      <p>Your profile will be featured on the AR Alumni platform for the entire day.</p>
    `
  });
}

async function sendBidLoseNotification(email, date) {
  await transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to:      email,
    subject: `Your bid result for ${date}`,
    html: `
      <h2>Bid Result</h2>
      <p>Unfortunately your bid for <strong>${date}</strong> was not the highest.</p>
      <p>You are welcome to bid again tomorrow for a chance to be featured as Alumni of the Day!</p>
    `
  });
}


module.exports = { 
    sendVerificationOtp, 
    sendPasswordResetOtp,
    sendBidWinNotification,
    sendBidLoseNotification 
};