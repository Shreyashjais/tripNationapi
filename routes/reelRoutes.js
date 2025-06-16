const express= require("express");
const { auth, allowAdminOrSuperAdmin, isCustomer } = require("../middlewares/auth");
const { createReel, getAllReels, getSingleReel, approveReel, getApprovedReels, revertReelToPending, likeOrUnlikeReel, editReel, deleteReel } = require("../controllers/reelController");
const router= express.Router();

router.post("/create", auth, createReel)
router.get("/allReels",auth, allowAdminOrSuperAdmin, getAllReels)
router.get("/approvedReels",getApprovedReels)
router.get("/:id", getSingleReel)
router.patch("/approve/:id", auth, allowAdminOrSuperAdmin, approveReel)
router.patch("/revertBack/:id", auth , allowAdminOrSuperAdmin, revertReelToPending)
router.patch("/likeUnlike/:id",auth, isCustomer,likeOrUnlikeReel )
router.put("/update/:id", auth, allowAdminOrSuperAdmin, editReel)
router.delete("/delete/:id", auth , allowAdminOrSuperAdmin, deleteReel)

module.exports=router;