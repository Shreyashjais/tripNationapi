const express = require("express");
const {
  createReview,
  getReviews,
  deleteReview,
} = require("../controllers/reviewController");
const { allowAdminOrSuperAdmin, auth } = require("../middlewares/auth");


const router = express.Router();


router.post("/", auth,  createReview);


router.get("/", auth, getReviews);


router.delete("/:id", auth, allowAdminOrSuperAdmin,  deleteReview);


module.exports = router;