const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ["credit_card", "paypal", "upi", "stripe"],
    required: true,
  },
  status: {
    type: String,
    enum: ["initiated", "pending", "paid", "failed", "cancelled"],
    default: "initiated",
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionId: String,
  paidAt: Date,
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
