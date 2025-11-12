
const { uploadFileToCloudinary, isFileTypeSupported } = require("../helpers/uploadUtils");
const Media = require("../models/mediaModel")

const SUPPORTED_IMAGE_TYPES = ["jpg", "jpeg", "png", "webp"];
const SUPPORTED_VIDEO_TYPES = ["mp4", "mov", "avi", "mkv"];


exports.uploadMedia = async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const file = req.files.file;
    const folder = req.body.folder || "uploads";
    const fileType = file.name.split(".").pop();

    let resourceType = "image";

    if (isFileTypeSupported(fileType, SUPPORTED_VIDEO_TYPES)) resourceType = "video";
    else if (!isFileTypeSupported(fileType, SUPPORTED_IMAGE_TYPES))
      return res.status(400).json({
        success: false,
        message: "Unsupported file type",
      });

   
    const response = await uploadFileToCloudinary(file, folder, resourceType);


    const media = await Media.create({
      url: response.secure_url,
      publicId: response.public_id,
      type: resourceType,
      folder,
    });

    return res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: media,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Server error during upload" });
  }
};
