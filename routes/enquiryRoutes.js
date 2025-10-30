const express = require("express");
const {
  createEnquiry,
  getAllEnquiries,
  deleteEnquiry,
  toggleEnquiryStatus,
} = require("../controllers/enquiryController");

const router = express.Router();

router.get("/", getAllEnquiries);

router.post("/", createEnquiry);





router.delete("/:id", deleteEnquiry);


router.patch("/:id/status", toggleEnquiryStatus);

module.exports = router;
