//Booking Details
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
 
  travelDate: {
    type: Date,
    required: true,
  },
  numberOfPeople: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },

  status: {
    type: String,
    enum: ["pending", "confirmed", "cancelled"],
    default: "pending",
  },

  payment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment", 
  },
  attended: {
    type: Boolean,
    default: false, 
  },

  specialRequests: String,
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
