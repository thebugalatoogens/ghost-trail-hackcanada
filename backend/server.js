const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log("MongoDB connected"))
.catch(err => console.log(err))

app.get("/", (req,res)=>{
 res.send("Stalker simulator backend running")
})

const postRoutes = require("./routes/posts")
app.use("/posts", postRoutes)

app.listen(3000, ()=>{
 console.log("Server running on port 3000")
})
