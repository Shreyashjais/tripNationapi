const express= require("express");
const { auth, allowAdminOrSuperAdmin, isCustomer } = require("../middlewares/auth");
const { createReel, getAllReels, getSingleReel, getApprovedReels,  likeOrUnlikeReel, editReel, deleteReel, updateReelStatus } = require("../controllers/reelController");
const router= express.Router();

router.post("/create", auth, createReel)
router.get("/allReels",auth, allowAdminOrSuperAdmin, getAllReels)
router.get("/approvedReels",getApprovedReels)
router.get("/:id", getSingleReel)
router.patch("/:id", auth, allowAdminOrSuperAdmin, updateReelStatus)
router.patch("/likeUnlike/:id",auth,likeOrUnlikeReel )
router.put("/update/:id", auth, allowAdminOrSuperAdmin, editReel)
router.delete("/delete/:id", auth , allowAdminOrSuperAdmin, deleteReel)

module.exports=router;