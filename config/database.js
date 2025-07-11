const mongoose = require("mongoose")

require("dotenv").config();

exports.dbConnect = ()=> {
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser:true,
        useUnifiedTopology:true,
    })
    .then(()=>{
        console.log("DB Connection Successful")
    })
    .catch((e)=>{
        console.log("Error in DB connection");
        console.error(e);
        process.exit(1);
    })
}