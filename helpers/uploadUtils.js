// const cloudinary = require("cloudinary").v2;

// function isFileTypeSupported(type, supportedTypes) {
//   return supportedTypes.includes(type);
// }

// async function uploadFileToCloudinary(file, folder) {
//   const options = {
//     folder,
//     resource_type: "image",
//   };
//   return await cloudinary.uploader.upload(file.tempFilePath, options);
// }



// async function deleteFileFromCloudinary(publicId) {
//   try {
//     const result = await cloudinary.uploader.destroy(publicId);
    
 
//     if (result.result !== "ok" && result.result !== "not found") {
//       console.error("Cloudinary deletion failed with result:", result);
//       throw new Error("Cloudinary image deletion failed");
//     }

//     return result;
//   } catch (error) {
//     console.error("Cloudinary image deletion failed:", error);
//     throw new Error("Cloudinary image deletion failed");
//   }
// }
// module.exports = {
//   isFileTypeSupported,
//   uploadFileToCloudinary,
//   deleteFileFromCloudinary
// };
const cloudinary = require("cloudinary").v2;

// Check if file type is supported (e.g., mp4, jpg)
function isFileTypeSupported(type, supportedTypes) {
  return supportedTypes.includes(type.toLowerCase());
}

// Upload to Cloudinary — defaults to image, supports video if specified
async function uploadFileToCloudinary(file, folder, resourceType = "image") {
  const options = {
    folder,
    resource_type: resourceType, // "image" by default, "video" if passed
  };

  return await cloudinary.uploader.upload(file.tempFilePath, options);
}

// Delete from Cloudinary — defaults to image, supports video if specified
async function deleteFileFromCloudinary(publicId, resourceType = "image") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (result.result !== "ok" && result.result !== "not found") {
      console.error("Cloudinary deletion failed with result:", result);
      throw new Error("Cloudinary deletion failed");
    }

    return result;
  } catch (error) {
    console.error("Cloudinary deletion failed:", error);
    throw new Error("Cloudinary deletion failed");
  }
}

module.exports = {
  isFileTypeSupported,
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
};
