const express = require("express");
const app= express();

const cors = require("cors");

const allowedOrigins = [
  "https://tripnation.vercel.app",
  "https://www.triponation.com",
  "http://localhost:3001" 
];

app.use(cors({
  origin: function (origin, callback) {
  
    if (!origin) return callback(null, true); 

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));


require("dotenv").config();
const PORT= process.env.PORT || 3000;

app.use(express.json());

const fileUpload= require("express-fileupload")
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

const cloudinary= require("./config/cloudinary")
cloudinary.cloudinaryConnect();

require("./config/database").dbConnect();

const cookieParser= require("cookie-parser")
app.use(cookieParser());

const userRoutes= require("./routes/userRoutes")
app.use("/", userRoutes)

const blogRoutes= require("./routes/blogRoutes")
app.use("/blogs", blogRoutes)

const contactUsRoutes = require("./routes/contactUsRoutes")
app.use("/contactUs", contactUsRoutes)

const storyRoutes= require("./routes/storyRoutes")
app.use("/story", storyRoutes)

const reelRoutes= require("./routes/reelRoutes")
app.use("/reels", reelRoutes)

const enquiryRoutes= require("./routes/enquiryRoutes")
app.use("/enquiry", enquiryRoutes)

const reviewRoutes = require("./routes/reviewRoutes")
app.use("/reviews", reviewRoutes)

const mediaRoutes = require("./routes/mediaRoutes");
app.use("/media", mediaRoutes);



app.listen(PORT, ()=>{
    console.log(`Server started on PORT ${PORT} `)
})