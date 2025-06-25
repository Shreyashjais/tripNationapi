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

const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true },
    paragraph: { type: String, required: true }, 
  },
  { _id: false }
);

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    content: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    category: {
      type: String,
      enum: ["adventure", "culture", "food and drink", "photography", "relaxation"],
      required: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },

    images: [imageSchema],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sections: [sectionSchema],

    publishedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Story", storySchema);
