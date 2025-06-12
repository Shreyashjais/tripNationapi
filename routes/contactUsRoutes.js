const express= require("express")
const router = express.Router();

const {postContactUs, getAllContactMessages, revertContactFormStatus,
     getContactMessageById, deleteContactMessageById, approveContactForm}= require("../controllers/contactUsController")

router.post("/post",postContactUs)
router.get("/",getAllContactMessages)
router.get("/:id", getContactMessageById)
router.delete("/delete/:id", deleteContactMessageById)
router.patch("/close/:id", approveContactForm)
router.patch("/revertBack/:id", revertContactFormStatus)


module.exports = router;