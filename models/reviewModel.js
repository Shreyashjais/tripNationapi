//User can add a review after attending a tour

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Package",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
}, { timestamps: true });

// Optional: Prevent multiple reviews per user per package
reviewSchema.index({ package: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
