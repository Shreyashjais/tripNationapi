const cloudinary = require("cloudinary").v2;

function isFileTypeSupported(type, supportedTypes) {
  return supportedTypes.includes(type);
}

async function uploadFileToCloudinary(file, folder) {
  const options = {
    folder,
    resource_type: "image",
  };
  return await cloudinary.uploader.upload(file.tempFilePath, options);
}



async function deleteFileFromCloudinary(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
 
    if (result.result !== "ok" && result.result !== "not found") {
      console.error("Cloudinary deletion failed with result:", result);
      throw new Error("Cloudinary image deletion failed");
    }

    return result;
  } catch (error) {
    console.error("Cloudinary image deletion failed:", error);
    throw new Error("Cloudinary image deletion failed");
  }
}
module.exports = {
  isFileTypeSupported,
  uploadFileToCloudinary,
  deleteFileFromCloudinary
};
