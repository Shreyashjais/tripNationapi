// utils/sendOtp.js

const nodemailer = require("nodemailer");
require("dotenv").config();

// Call this function with (email, otp)
const sendOtp = async (email, otp) => {
  try {
    // Configure transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: `"TripNation" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "Your OTP for TripNation Signup",
      html: `
        <h2>OTP Verification</h2>
        <p>Your OTP is: <b>${otp}</b></p>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);
    // console.log("OTP email sent to:", email);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
};

module.exports = sendOtp;
