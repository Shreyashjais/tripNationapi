const Blog = require("../models/blogModel");
const { isFileTypeSupported, uploadFileToCloudinary, deleteFileFromCloudinary } = require("../helpers/uploadUtils");

exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      tags,
      category,
      destination,
      readTime,
      sections,
      metaTitle,
      metaDescription,
      keywords,
      company,
    } = req.body;

    const parsedTags =
      typeof tags === "string" ? tags.split(",").map((t) => t.trim()) : tags;

    const parsedSections =
      typeof sections === "string" ? JSON.parse(sections) : sections;

    const parsedKeywords =
      typeof keywords === "string"
        ? keywords.split(",").map((k) => k.trim())
        : keywords;

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
        return res
          .status(400)
          .json({ success: false, message: `Unsupported image type: ${fileType}` });
      }

      const result = await uploadFileToCloudinary(file, "BlogUploads");
      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
      });
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
      destination,
      metaTitle,
      metaDescription,
      keywords: parsedKeywords,
      company: company || "Trip'O'Nation",
    });

    blog = await blog.populate("createdBy", "name profileImage");

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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const status = req.query.status; 

    const query = { title: { $regex: search, $options: "i" } };
    if (status) query.status = status; 

    const totalBlogs = await Blog.countDocuments(query);

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name profileImage");

    const totalPages = Math.ceil(totalBlogs / limit);

    res.status(200).json({
      success: true,
      count: blogs.length,      
      total: totalBlogs,       
      page,                    
      limit,               
      totalPages,           
      hasNext: page < totalPages,
      hasPrev: page > 1,
      blogs,
    });
  } catch (err) {
    console.error("Error fetching blogs:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch blogs",
    });
  }
};

exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

  
    let blog = await Blog.findOne({ slug }).populate("createdBy", "name profileImage");

    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

 
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    res.status(200).json({
      success: true,
      message: "Blog fetched successfully",
      blog,
    });
  } catch (err) {
    console.error("Error fetching blog by slug:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



exports.getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
   

  
    const blog = await Blog.findById(id).populate("createdBy", "name profileImage");

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }


    res.status(200).json({
      success: true,
      blog,
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
      metaTitle,
      metaDescription,
      keywords,
      company,
    } = req.body;

    const parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    const parsedSections = typeof sections === "string" ? JSON.parse(sections) : sections;
    const parsedImagesToDelete =
      typeof req.body.imagesToDelete === "string"
        ? JSON.parse(req.body.imagesToDelete)
        : req.body.imagesToDelete;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

    //  Delete selected images (both from db and cloudinary)
    if (parsedImagesToDelete && parsedImagesToDelete.length > 0) {
      for (const img of parsedImagesToDelete) {
        const publicId = typeof img === "string" ? img : img.publicId;
        if (!publicId) continue;

        await deleteFileFromCloudinary(publicId);
        blog.images = blog.images.filter((image) => image.publicId !== publicId);
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
        blog.images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });
      }
    }

    // 🧩 Update text + new SEO fields
    blog.title = title || blog.title;
    blog.content = content || blog.content;
    blog.tags = parsedTags || blog.tags;
    blog.sections = parsedSections || blog.sections;
    blog.readTime = readTime || blog.readTime;

    // 🔹 New fields
    blog.metaTitle = metaTitle || blog.metaTitle;
    blog.metaDescription = metaDescription || blog.metaDescription;
    blog.keywords = keywords
      ? typeof keywords === "string"
        ? JSON.parse(keywords)
        : keywords
      : blog.keywords;
    blog.company = company || blog.company;

    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog,
    });
  } catch (err) {
    console.error("Update Blog error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
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
    // await redis.del(`blog:${id}`);

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
    const { category, tags } = req.query;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { status: "approved" };

    if (category && category.toLowerCase() !== "all") {
      query.category = category;
    }

    if (tags) {
      query.tags = { $elemMatch: { $regex: new RegExp(tags.trim(), "i") } };
    }

    const totalBlogs = await Blog.countDocuments(query);
    const totalPages = Math.ceil(totalBlogs / limit);

    const approvedBlogs = await Blog.find(query)
      .populate("createdBy", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: approvedBlogs.length,
      total: totalBlogs,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      data: approvedBlogs,
    });

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

    // const keys = await redis.keys("approvedBlogs*");
    // if (keys.length > 0) {
    //   await redis.del(keys);
    // }

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


exports.toggleBlogLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const blogId = req.params.id;

    const blog = await Blog.findById(blogId);
    if (!blog) {
      return res.status(404).json({ success: false, message: "Blog not found" });
    }

   
    const alreadyLiked = blog.likes.includes(userId);

    if (alreadyLiked) {
   
      blog.likes = blog.likes.filter((id) => id.toString() !== userId.toString());
    } else {
  
      blog.likes.push(userId);
    }

    await blog.save();

    return res.status(200).json({
      success: true,
      message: alreadyLiked ? "Blog unliked successfully" : "Blog liked successfully",
      liked: !alreadyLiked,
      totalLikes: blog.likes.length,
    });
  } catch (err) {
    console.error("Error toggling blog like:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
