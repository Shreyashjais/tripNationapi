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
    paragraphs: [{ type: String, required: true }],
  },
  { _id: false }
);

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
   
    

    content: { type: String, required: true },

    images: [imageSchema],



   
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
