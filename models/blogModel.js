const mongoose = require("mongoose");
const slugify = require("slugify");

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

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },

    slug: { type: String, unique: true, trim: true },

    url: { type: String, trim: true },

    content: { type: String, required: true },

    metaTitle: { type: String, required: true, trim: true },

    metaDescription: { type: String, required: true },

    keywords: [{ type: String, trim: true }],

    company: { type: String, default: "Trip'O'Nation", trim: true },

    images: [imageSchema],

    tags: [{ type: String, trim: true }],

    sections: [sectionSchema],

    readTime: { type: String, required: true },

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

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    publishedAt: { type: Date, default: Date.now },

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

    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

blogSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;

   
    const Blog = mongoose.model("Blog");
    while (await Blog.exists({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    this.slug = slug;
  }

 
  this.url = `https://www.triponation.com/blogs/${this.slug}`;

  next();
});

module.exports = mongoose.model("Blog", blogSchema);
