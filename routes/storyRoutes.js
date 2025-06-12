const express = require("express")
const router= express.Router();

const {createStory, getAllStory, getStoryById, approveStory, getApprovedStories, revertToPending, deleteStory, updateStory }= require("../controllers/storyController")

router.post("/createStory", createStory)
router.get("/allStory", getAllStory )
router.get("/approvedStories", getApprovedStories)
router.put("/update/:id", updateStory);
router.get("/:id", getStoryById)
router.patch("/approve/:id", approveStory)
router.patch("/revertBack/:id", revertToPending)
router.delete("/delete/:id",deleteStory )





module.exports = router;