const Blog = require("../models/blogModel");
const { isFileTypeSupported, uploadFileToCloudinary, deleteFileFromCloudinary } = require("../helpers/uploadUtils");
const redis = require("../config/redis");

exports.createBlog = async (req, res) => {
  try {
    const { title,  content, tags, category, destination, readTime, sections } = req.body;

    const parsedTags = typeof tags === "string" ? tags.split(",").map(t => t.trim()) : tags;
    const parsedSections = typeof sections === "string" ? JSON.parse(sections) : sections;

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
        return res.status(400).json({ success: false, message: `Unsupported image type: ${fileType}` });
      }
      const result = await uploadFileToCloudinary(file, "BlogUploads");
      uploadedImages.push({ url: result.secure_url, publicId: result.public_id });
    }

    let blog = await Blog.create({
      title,
      content,
      images: uploadedImages,
      tags: parsedTags,
      sections: parsedSections,
      readTime,
      createdBy: req.user.id,
      category,
      destination
    });
    blog = await blog.populate("createdBy", "name profileImage");

    await redis.del("allBlogs");
    await redis.del("approvedBlogs");
    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog,
    });
  } catch (err) {
    console.error("Blog post error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.getAllBlogs = async (req, res) => {
  try {
    const search = req.query.search || "";
    const cacheKey = search ? `allBlogs:search:${search}` : "allBlogs";

   
    const cachedBlogs = await redis.get(cacheKey);
    if (cachedBlogs) {
      return res.status(200).json({
        success: true,
        count: JSON.parse(cachedBlogs).length,
        blogs: JSON.parse(cachedBlogs),
        cached: true,
      });
    }

  
    const blogs = await Blog.find({
      title: { $regex: search, $options: "i" },
    })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name profileImage");

   
    await redis.set(cacheKey, JSON.stringify(blogs), "EX", 60);

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs,
      cached: false,
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
  }
};

exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    const cacheKey = `blog:${id}`;
    const cachedBlog = await redis.get(cacheKey);
    if (cachedBlog) {
      console.log("✅ Serving blog from Redis cache");
      return res.status(200).json({
        success: true,
        blog: JSON.parse(cachedBlog),
        cached: true,
      });
    }

  
    const blog = await Blog.findById(id).populate("createdBy", "name profileImage");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

  
    await redis.set(cacheKey, JSON.stringify(blog), "EX", 300);

    res.status(200).json({
      success: true,
      blog,
      cached: false,
    });
  } catch (err) {
    console.error("Error fetching blog by ID:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blog",
    });
  }
};

exports.updateBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const {
      title,
      content,
      tags,
      readTime,
      sections,
    } = req.body;

 
    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    const parsedSections = typeof sections === "string" ? JSON.parse(sections) : sections;
    const parsedImagesToDelete = typeof req.body.imagesToDelete === "string"
      ? JSON.parse(req.body.imagesToDelete)
      : req.body.imagesToDelete;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    //  Delete selected images
    if (parsedImagesToDelete && parsedImagesToDelete.length > 0) {
      for (const img of parsedImagesToDelete) {
        const publicId = typeof img === "string" ? img : img.publicId;
        if (!publicId) continue;

        await deleteFileFromCloudinary(publicId);
        blog.images = blog.images.filter(image => image.publicId !== publicId);
      }
    }

    // Upload new images
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

    
        const result = await uploadFileToCloudinary(file, "BlogUploads");
        blog.images.push({ url: result.secure_url, publicId: result.public_id });
      }
    }

    // Update text content
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.tags = parsedTags || blog.tags;
    blog.sections = parsedSections || blog.sections;
    blog.readTime = readTime || blog.readTime;

    await blog.save();
    await redis.del(`blog:${blogId}`);

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (err) {
    console.error("Update Blog error:", err);
    return res.status(500).json({ success: false, message: "Internal server error", error: err.message });
  }
};





exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    // Delete images from Cloudinary
    if (Array.isArray(blog.images)) {
      for (const img of blog.images) {
        if (img.publicId) {
          await deleteFileFromCloudinary(img.publicId);
        }
      }
    }
    // Delete the blog document
    await Blog.findByIdAndDelete(id);
    await redis.del(`blog:${id}`);

    return res.status(200).json({ success: true, message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
exports.getApprovedBlogs = async (req, res) => {
  try {
    const {  category, tags } = req.query;

    const query = {
      status: "approved",
    };

    
    if (category && category.toLowerCase() !== "all") {
      query.category = category;
    }

   
    if (tags) {
      query.tags = { $regex: new RegExp(tags.trim(), "i") };
    }

    const cacheKey = `approvedBlogs:${category || "all"}:${tags || "all"}`;
    const cached = await redis.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cached),
        cached: true,
      });
    }

    const approvedBlogs = await Blog.find(query).populate(
      "createdBy",
      "name profileImage"
    );
    await redis.setex(cacheKey, 600, JSON.stringify(approvedBlogs));

    res.status(200).json({ success: true, data: approvedBlogs });
  } catch (error) {
    console.error("Error fetching approved blogs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.updateBlogStatus = async (req, res) => {
  try {
    const blogId = req.params.id;
    const { status } = req.body;

    if (!["approved", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value. Must be 'approved' or 'pending'.",
      });
    }

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    if (blog.status === status) {
      return res.status(400).json({
        success: false,
        message: `Blog is already ${status}`,
      });
    }

    blog.status = status;
    await blog.save();

    const keys = await redis.keys("approvedBlogs*");
    if (keys.length > 0) {
      await redis.del(keys);
    }

    res.status(200).json({
      success: true,
      message: `Blog marked as ${status} successfully`,
      blog,
    });
  } catch (err) {
    console.error("Error updating blog status:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
