const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    travelDates: {
      type: String, 
      required: true,
      trim: true,
    },
    numberOfTravellers: {
      type: Number,
      required: true,
      min: 1,
    },
    specialRequests: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["pending", "closed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
