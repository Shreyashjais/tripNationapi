const Story = require("../models/storyModel");
const {
  isFileTypeSupported,
  uploadFileToCloudinary,
  deleteFileFromCloudinary,
} = require("../helpers/uploadUtils");

exports.createStory = async (req, res) => {
  try {
    const { title, content, sections, destination, category, tags } = req.body;

    const parsedSections =
      typeof sections === "string" ? JSON.parse(sections) : sections;

    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;

    const supportedTypes = ["jpg", "jpeg", "png"];
    const files =
      req.files && req.files.images
        ? Array.isArray(req.files.images)
          ? req.files.images
          : [req.files.images]
        : [];
    const uploadedImages = [];

    for (const file of files) {
      const fileType = file.name.split(".").pop().toLowerCase();
      if (!isFileTypeSupported(fileType, supportedTypes)) {
        return res.status(400).json({
          success: false,
          message: `Unsupported image type: ${fileType}`,
        });
      }
      const result = await uploadFileToCloudinary(file, "StoryUploads");
      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
    }

    let story = await Story.create({
      title,
      content,
      destination,
      category,
      tags:parsedTags,
      images: uploadedImages,
      sections: parsedSections,
      createdBy: req.user.id,
    });
    story = await story.populate("createdBy", "name profileImage");

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      story,
    });
  } catch (err) {
    console.error("Blog post error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getAllStory = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: stories.length,
      stories,
    });
  } catch (err) {
    console.error("Error fetching stories:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch stories",
    });
  }
};

exports.getStoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await Story.findById(id).populate(
      "createdBy",
      "name profileImage"
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found",
      });
    }

    res.status(200).json({
      success: true,
      story,
    });
  } catch (err) {
    console.error("Error fetching story by ID:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch story",
    });
  }
};

exports.updateStory = async (req, res) => {
  try {
    const storyId = req.params.id;
    const { title, content, sections } = req.body;

    // Parse JSON string fields (for form-data submissions)

    const parsedSections =
      typeof sections === "string" ? JSON.parse(sections) : sections;
    const parsedImagesToDelete =
      typeof req.body.imagesToDelete === "string"
        ? JSON.parse(req.body.imagesToDelete)
        : req.body.imagesToDelete;

    const story = await Story.findById(storyId);
    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    // Step 1: Delete selected images
    if (parsedImagesToDelete && parsedImagesToDelete.length > 0) {
      for (const img of parsedImagesToDelete) {
        const publicId = typeof img === "string" ? img : img.publicId;
        if (!publicId) continue;
        console.log("Deleting image:", publicId);
        await deleteFileFromCloudinary(publicId);
        story.images = story.images.filter(
          (image) => image.publicId !== publicId
        );
      }
    }

    // Step 2: Upload new images
    const supportedTypes = ["jpg", "jpeg", "png"];
    const files = req.files?.newImages;
    if (files) {
      const newImages = Array.isArray(files) ? files : [files];
      for (const file of newImages) {
        const fileType = file.name.split(".").pop().toLowerCase();
        if (!isFileTypeSupported(fileType, supportedTypes)) {
          return res.status(400).json({
            success: false,
            message: `Unsupported image type: ${fileType}`,
          });
        }

        console.log("Uploading file to Cloudinary:", file.name);
        const result = await uploadFileToCloudinary(file, "StoryUploads");
        story.images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    // Step 3: Update text content
    story.title = title || story.title;

    story.content = content || story.content;

    story.sections = parsedSections || story.sections;

    await story.save();

    return res.status(200).json({
      success: true,
      message: "Story updated successfully",
      story,
    });
  } catch (err) {
    console.error("Update Story error:", err);
    return res
      .status(500)
      .json({
        success: false,
        message: "Internal server error",
        error: err.message,
      });
  }
};

exports.approveStory = async (req, res) => {
  try {
    const storyId = req.params.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    if (story.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Story is already approved or in another state",
      });
    }

    story.status = "approved";
    await story.save();

    res.status(200).json({
      success: true,
      message: "Story approved successfully",
      story,
    });
  } catch (err) {
    console.error("Error approving story:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.getApprovedStories = async (req, res) => {
  try {
    const { destination, category } = req.query;

    const query = {
      status: "approved",
    };

    if (destination) {
      query.destination = { $regex: new RegExp(destination, "i") };
    }

 
    if (category && category.toLowerCase() !== "all") {
      query.category = category;
    }

    const approvedStories = await Story.find(query).populate(
      "createdBy",
      "name profileImage"
    );

    res.status(200).json({ success: true, data: approvedStories });
  } catch (error) {
    console.error("Error fetching approved stories:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.revertToPending = async (req, res) => {
  try {
    const storyId = req.params.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    if (story.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved stories can be reverted to pending",
      });
    }

    story.status = "pending";
    await story.save();

    res.status(200).json({
      success: true,
      message: "Story status reverted to pending successfully",
      story,
    });
  } catch (err) {
    console.error("Error reverting story:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    const { id } = req.params;

    const story = await Story.findById(id);
    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    if (Array.isArray(story.images)) {
      for (const img of story.images) {
        if (img.publicId) {
          await deleteFileFromCloudinary(img.publicId);
        }
      }
    }

    await Story.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: "Story deleted successfully" });
  } catch (error) {
    console.error("Error deleting story:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
