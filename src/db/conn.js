const mongoose=require("mongoose");
const mongoURI = process.env.MONGO_URI || "mongodb+srv://subhashkumarr1612:ZXCkNwJL1zkq2ckX@cluster0.rs0om.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0" ||"mongodb://127.0.0.1:27017/Auth";

mongoose.connect(mongoURI)
.then(()=>{
    console.log("connection is successful")
}).catch((err)=>{
     console.log(`Not connected ${err}`)
})