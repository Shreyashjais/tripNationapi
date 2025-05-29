const mongoose = require("mongoose");

const otpRequestSchema = new mongoose.Schema({
  contact: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["email", "phone"],
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model("OTPRequest", otpRequestSchema);
