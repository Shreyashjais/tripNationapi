const express= require("express")
const router = express.Router();

const {postContactUs, getAllContactMessages,
     getContactMessageById, deleteContactMessageById,
     updateContactFormStatus}= require("../controllers/contactUsController");
const { auth, allowAdminOrSuperAdmin, isCustomer } = require("../middlewares/auth");

router.post("/post",auth,isCustomer, postContactUs)
router.get("/",auth,allowAdminOrSuperAdmin, getAllContactMessages)
router.get("/:id",auth, allowAdminOrSuperAdmin, getContactMessageById)
router.delete("/:id",auth, allowAdminOrSuperAdmin, deleteContactMessageById)
router.patch("/:id",auth, allowAdminOrSuperAdmin, updateContactFormStatus)


module.exports = router;