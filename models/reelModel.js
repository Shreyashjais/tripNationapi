const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema(
  {
    videoUrl: { type: String, required: true },
    publicId: { type: String, required: true }, 
    caption: { type: String },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reel", reelSchema);
