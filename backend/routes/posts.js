const express = require("express")
const router = express.Router()
const { uploadAndTagImage } = require("../services/cloudinary")
const Post = require("../models/Post")
const analyzePosts = require("../services/analysisService")
const geocodeLocation = require("../services/geocodeService")

router.post("/", async (req,res)=>{
  const { userId, caption, location, timestamp, uri} = req.body
  
  let autoTags = []
  if(uri){
    const cloudResult = await uploadAndTagImage(uri, 0.7)
    autoTags = cloudResult.autoTags
  }
  
  const coords = await geocodeLocation(location || autoTags);

  const post = new Post({
    userId,
    caption,
    location,
    latitude: coords ? coords.latitude : null,
    longitude: coords ? coords.longitude : null,
    timestamp,
    autoTags
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