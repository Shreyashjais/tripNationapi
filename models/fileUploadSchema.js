//To generate a cloudinary URL

const mongoose = require("mongoose");


const fileSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true, // Cloudinary's public ID for deletion
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: "uploaderModel",
  },
  uploaderModel: {
    type: String,
    required: true,
    enum: ["customer", "admin"],
  },
  type: {
    type: String,
    enum: ["profile", "package", "other"],
    default: "other",
  },
  contextId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'contextType',
  },
  contextType: {
    type: String,
    enum: ["User", "Package", "Blog"], // extendable
  }
}, { timestamps: true });

module.exports = mongoose.model("File", fileSchema);
