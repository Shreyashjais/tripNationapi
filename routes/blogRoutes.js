const express = require("express");
const router = express.Router();

const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  getApprovedBlogs,
  updateBlogStatus,
  getBlogBySlug,
  toggleBlogLike,
} = require("../controllers/blogController");
const { auth, allowAdminOrSuperAdmin } = require("../middlewares/auth");


router.post("/create", auth, createBlog);
router.get("/allBlogs", auth, allowAdminOrSuperAdmin, getAllBlogs);
router.get("/approvedBlogs", getApprovedBlogs);
router.get("/slug/:slug", getBlogBySlug)


router.get("/id/:id", getBlogById);
router.put("/update/:id", auth, allowAdminOrSuperAdmin, updateBlog);
router.delete("/delete/:id", auth, allowAdminOrSuperAdmin, deleteBlog);
router.patch("/:id", auth, allowAdminOrSuperAdmin, updateBlogStatus);
router.patch("/:id/like", auth, toggleBlogLike); 

module.exports = router;
