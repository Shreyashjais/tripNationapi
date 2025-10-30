const express = require("express");
const {
  createEnquiry,
  getAllEnquiries,
  deleteEnquiry,
  toggleEnquiryStatus,
} = require("../controllers/enquiryController");
const { auth, allowAdminOrSuperAdmin } = require("../middlewares/auth");

const router = express.Router();

router.get("/", auth, allowAdminOrSuperAdmin, getAllEnquiries);

router.post("/", createEnquiry);

router.delete("/:id", auth, allowAdminOrSuperAdmin, deleteEnquiry);

router.patch("/:id/status", auth, allowAdminOrSuperAdmin, toggleEnquiryStatus);

module.exports = router;
