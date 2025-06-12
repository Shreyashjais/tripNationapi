const mongoose = require("mongoose");


const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    profileImage: {
      type: imageSchema,
      default: null,
    },

    password: {
      type: String,
      trim: true,
      required: true,
    },

    role: {
      type: String,
      enum: ["superAdmin", "admin", "customer"],
      default: "customer", 
    },

    otp: {
      type: String,
      default: null,
    },

    otpExpiresIn: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
