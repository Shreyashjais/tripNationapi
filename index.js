const express = require("express");
const app= express();

require("dotenv").config();
const PORT= process.env.PORT ||4000;

app.use(express.json());

require("./config/database").dbConnect();

app.listen(3000, ()=>{
    console.log(`Server started on PORT ${PORT} `)
})