
const express = require("express");
const router = express.Router();


const { createBlog,getAllBlogs,getBlogById, updateBlog, deleteBlog, getApprovedBlogs, approveBlog, revertToPending} = require("../controllers/blogController");


router.post("/create", createBlog);
router.get("/allBlogs", getAllBlogs);
router.get("/approvedBlogs", getApprovedBlogs)
router.get("/:id", getBlogById);
router.put("/update/:id", updateBlog);
router.delete("/delete/:id", deleteBlog)
router.patch("/approve/:id", approveBlog);
router.patch("/revertBack/:id", revertToPending)


module.exports = router;
