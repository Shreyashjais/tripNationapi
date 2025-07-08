const Reel = require("../models/reelModel");
const {
  uploadFileToCloudinary,
  isFileTypeSupported,
  deleteFileFromCloudinary,
} = require("../helpers/uploadUtils");

exports.createReel = async (req, res) => {
  try {
    const { caption } = req.body;

    const supportedVideoTypes = ["mp4", "webm", "mov"];
    const file = req.files?.video;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "No video file provided" });
    }

    const fileType = file.name.split(".").pop().toLowerCase();
    if (!isFileTypeSupported(fileType, supportedVideoTypes)) {
      return res
        .status(400)
        .json({
          success: false,
          message: `Unsupported video type: ${fileType}`,
        });
    }

    const uploadedVideo = await uploadFileToCloudinary(
      file,
      "ReelVideos",
      "video"
    );

    let reel = await Reel.create({
      videoUrl: uploadedVideo.secure_url,
      publicId: uploadedVideo.public_id,
      caption,
      createdBy: req.user.id,
      status: "pending",
    });

    reel = await reel.populate("createdBy", "name profileImage");

    res.status(201).json({
      success: true,
      message: "Reel created successfully",
      reel,
    });
  } catch (error) {
    console.error("Create Reel Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllReels = async (req, res) => {
  try {
    const reels = await Reel.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name profileImage");

    res.status(200).json({
      success: true,
      reels,
    });
  } catch (error) {
    console.error("Get All Reels Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getSingleReel = async (req, res) => {
  try {
    const { id } = req.params;

    const reel = await Reel.findById(id).populate(
      "createdBy",
      "name profileImage"
    );

    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found",
      });
    }

    res.status(200).json({
      success: true,
      reel,
    });
  } catch (error) {
    console.error("Error fetching reel:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getApprovedReels = async (req, res) => {
  try {
    const approvedReels = await Reel.find({ status: "approved" })
      .populate("createdBy", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Approved reels fetched successfully",
      reels: approvedReels,
    });
  } catch (error) {
    console.error("Error fetching approved reels:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching approved reels",
    });
  }
};

exports.updateReelStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    if (!["approved", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Allowed: 'approved' or 'pending'.",
      });
    }

    const reel = await Reel.findById(id);
    if (!reel) {
      return res.status(404).json({
        success: false,
        message: "Reel not found",
      });
    }

    if (reel.status === status) {
      return res.status(400).json({
        success: false,
        message: `Reel is already in '${status}' status`,
      });
    }

    reel.status = status;
    await reel.save();

    res.status(200).json({
      success: true,
      message: `Reel status updated to '${status}' successfully`,
      reel,
    });
  } catch (error) {
    console.error("Error updating reel status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};




exports.likeOrUnlikeReel = async (req, res) => {
    try {
      const  reelId  = req.params.id;
      console.log(reelId, "printing")
      const userId = req.user.id;
  
      const reel = await Reel.findById(reelId);
  
      if (!reel) {
        return res.status(404).json({
          success: false,
          message: "Reel not found",
        });
      }
  
      const alreadyLiked = reel.likes.includes(userId);
  
      if (alreadyLiked) {
        
        reel.likes = reel.likes.filter(id => id.toString() !== userId);
        await reel.save();
  
        return res.status(200).json({
          success: true,
          message: "Reel unliked successfully",
          likesCount: reel.likes.length,
        });
      } else {
       
        reel.likes.push(userId);
        await reel.save();
  
        return res.status(200).json({
          success: true,
          message: "Reel liked successfully",
          likesCount: reel.likes.length,
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      res.status(500).json({
        success: false,
        message: "Server error while liking/unliking reel",
      });
    }
  };

  exports.editReel = async (req, res) => {
    try {
      const reelId = req.params.id;
      const  {caption}  = req.body;
      console.log(caption, "printing")
  
      // Find the reel
      const reel = await Reel.findById(reelId);
      if (!reel) {
        return res.status(404).json({ success: false, message: "Reel not found" });
      }
  
      // Update caption if provided
      if (typeof caption === "string" && caption.trim() !== "") {
        reel.caption = caption;
      }
  
      await reel.save();
  
      res.status(200).json({
        success: true,
        message: "Reel updated successfully",
        reel,
      });
    } catch (error) {
      console.error("Error editing reel:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };
  
  exports.deleteReel = async (req, res) => {
    try {
      const reelId = req.params.id;
  
      const reel = await Reel.findById(reelId);
      if (!reel) {
        return res.status(404).json({ success: false, message: "Reel not found" });
      }
  
  
      // Delete video from Cloudinary
      if (reel.publicId) {
        await deleteFileFromCloudinary(reel.publicId, "video");
      }
  
      // Delete the reel document
      await Reel.findByIdAndDelete(reelId);
  
      res.status(200).json({
        success: true,
        message: "Reel deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting reel:", error);
      res.status(500).json({ success: false, message: "Server error" });
    }
  };