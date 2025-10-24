const express = require("express");
const app= express();

const cors = require("cors");

app.use(cors({
  origin: "https://tripnation.vercel.app", 
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






app.listen(PORT, ()=>{
    console.log(`Server started on PORT ${PORT} `)
})