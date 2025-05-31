//To sent trip confirmation details

const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true,
  },
  type: {
    type: String,
    enum: ["email", "sms"],
    required: true,
  },
  status: {
    type: String,
    enum: ["sent", "failed"],
    default: "sent",
  },
  content: {
    subject: String,   
    message: {
      type: String,
      required: true,
    },
  },
  sentAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);
