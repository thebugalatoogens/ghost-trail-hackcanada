const express = require("express")
const router = express.Router()
const Post = require("../models/Post")
const analyzePosts = require("../services/analysisService")
const geocodeLocation = require("../services/geocodeService")

router.post("/", async (req,res)=>{
  const { userId, caption, location, timestamp } = req.body
  let coords = null
  if(location){
      coords = await geocodeLocation(location)
    }
console.log("Location:", location)
console.log("Coordinates:", coords)
  const post = new Post({
    userId,
    caption,
    location,
    latitude: coords ? coords.latitude : null,
    longitude: coords ? coords.longitude : null,
    timestamp
  })

  await post.save()

  res.json(post)
})

router.get("/analyze/:userId", async (req,res)=>{

  const posts = await Post.find({ userId: req.params.userId })

  const result = analyzePosts(posts)

  res.json(result)

})

module.exports = router