const express= require("express")
const router= express.Router();

const {login, signup, verifyOtp, createAdminBySuperAdmin, getAllUsersExceptSelf, deleteUser} = require("../controllers/userAuthController");
const { auth, isSuperAdmin } = require("../middlewares/auth");

router.post("/login", login);
router.post("/verifyOtp", verifyOtp)
router.post("/signup", signup);
router.post("/createAdmin", auth, isSuperAdmin, createAdminBySuperAdmin);
router.get("/users", auth, isSuperAdmin, getAllUsersExceptSelf);
router.delete("/user/delete/:id", auth, isSuperAdmin, deleteUser);

module.exports= router;