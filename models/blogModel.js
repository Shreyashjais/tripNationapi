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

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    

    content: { type: String, required: true },

    images: [imageSchema],

 
    tags: [{ type: String, trim: true }],

   
    sections: [sectionSchema],

    readTime: { type: Number, required: true },

    publishedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "approved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);
