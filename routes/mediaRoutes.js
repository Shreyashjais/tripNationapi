const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const { uploadMedia} = require("../controllers/mediaController");


router.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);


router.post("/upload", uploadMedia);



module.exports = router;
