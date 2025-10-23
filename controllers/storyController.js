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
    const search = req.query.search || "";
    const status = req.query.status; 
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { title: { $regex: search, $options: "i" } };
    if (status) query.status = status;

    const totalStories = await Story.countDocuments(query);

    const stories = await Story.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name profileImage");

    const totalPages = Math.ceil(totalStories / limit);

    res.status(200).json({
      success: true,
      count: stories.length,
      total: totalStories,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
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
    const {
      title,
      content,
      sections,
      destination,
      category,
      tags,
      imagesToDelete,
    } = req.body;

    const parsedSections =
      typeof sections === "string" ? JSON.parse(sections) : sections;

    const parsedTags =
      typeof tags === "string" ? JSON.parse(tags) : tags;

    const parsedImagesToDelete =
      typeof imagesToDelete === "string"
        ? JSON.parse(imagesToDelete)
        : imagesToDelete;

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

      
        const result = await uploadFileToCloudinary(file, "StoryUploads");
        story.images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    // Step 3: Update other fields
    if (title) story.title = title;
    if (content) story.content = content;
    if (parsedSections) story.sections = parsedSections;
    if (destination) story.destination = destination;
    if (category) story.category = category;
    if (parsedTags) story.tags = parsedTags;

    await story.save();
    await story.populate("createdBy", "name profileImage");

    return res.status(200).json({
      success: true,
      message: "Story updated successfully",
      story,
    });
  } catch (err) {
    console.error("Update Story error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
};

exports.getApprovedStories = async (req, res) => {
  try {
    const { destination, category } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { status: "approved" };

    if (destination) {
      query.destination = { $regex: new RegExp(destination.trim(), "i") };
    }

    if (category && category.toLowerCase() !== "all") {
      query.category = category;
    }

   
    const totalStories = await Story.countDocuments(query);
    const totalPages = Math.ceil(totalStories / limit);

   
    const approvedStories = await Story.find(query)
      .populate("createdBy", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

   
    res.status(200).json({
      success: true,
      count: approvedStories.length,
      total: totalStories,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      data: approvedStories,
    });

  } catch (error) {
    console.error("Error fetching approved stories:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.updateStoryStatus = async (req, res) => {
  try {
    const storyId = req.params.id;
    const { status } = req.body; // expected: "approved", "pending", "rejected" etc.

    if (!["approved", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res
        .status(404)
        .json({ success: false, message: "Story not found" });
    }

    // Optional: enforce rules
    if (status === "approved" && story.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending stories can be approved",
      });
    }

    if (status === "pending" && story.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved stories can be reverted to pending",
      });
    }

    story.status = status;
    await story.save();

    return res.status(200).json({
      success: true,
      message: `Story status updated to ${status} successfully`,
      story,
    });
  } catch (err) {
    console.error("Error updating story status:", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
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
