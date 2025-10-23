const express = require("express")
const router= express.Router();

const {createStory, getAllStory, getStoryById, getApprovedStories,  deleteStory, updateStory, updateStoryStatus }= require("../controllers/storyController");
const { auth, allowAdminOrSuperAdmin } = require("../middlewares/auth");

router.post("/createStory",auth, createStory)
router.get("/allStory",auth, allowAdminOrSuperAdmin, getAllStory )
router.get("/approvedStories", getApprovedStories)
router.put("/update/:id",auth, allowAdminOrSuperAdmin, updateStory);
router.get("/:id", getStoryById)
router.patch("/:id", auth,allowAdminOrSuperAdmin,updateStoryStatus )
router.delete("/delete/:id",auth, allowAdminOrSuperAdmin,deleteStory )

module.exports = router;