
const express = require("express");
const router = express.Router();


const { createBlog,getAllBlogs,getBlogById, updateBlog, deleteBlog, getApprovedBlogs, approveBlog, revertToPending} = require("../controllers/blogController");
const { auth ,allowAdminOrSuperAdmin } = require("../middlewares/auth");


router.post("/create", auth, createBlog);
router.get("/allBlogs",auth,allowAdminOrSuperAdmin, getAllBlogs);
router.get("/approvedBlogs", getApprovedBlogs)
router.get("/:id", getBlogById);
router.put("/update/:id",auth, allowAdminOrSuperAdmin, updateBlog);
router.delete("/delete/:id",auth, allowAdminOrSuperAdmin, deleteBlog)
router.patch("/approve/:id",auth, allowAdminOrSuperAdmin, approveBlog);
router.patch("/revertBack/:id",auth, allowAdminOrSuperAdmin, revertToPending)


module.exports = router;
