const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true,
    sparse: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },

  phone: {
    type: String,
    trim: true,
    unique: true,
    sparse: true,
  },
  profileImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },

  password: {
    type: String,
    trim: true,
    required: true,
  },

  role: {
    type: String,
    enum: ["customer", "admin"],
    default: "customer",
  },
  otp:{
    type:String,
  },

  otpExpiresIn:{
    type :Date,
  },

  isVerified: {
    type: Boolean,
    default: true,
  },

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
