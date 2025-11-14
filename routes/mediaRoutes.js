const express = require("express");
const router = express.Router();

const { uploadMedia} = require("../controllers/mediaController");




router.post("/upload", uploadMedia);



module.exports = router;
