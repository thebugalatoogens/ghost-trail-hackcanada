const express = require("express")
const router = express.Router()
const multer = require("multer")
const { uploadAndTagImage } = require("../services/cloudinary")
const Post = require("../models/Post")
const analyzePosts = require("../services/analysisService")
const geocodeLocation = require("../services/geocodeService")

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() })

router.post("/", upload.array('photos', 10), async (req, res) => {
  try {
    const { userId, caption, location, timestamp } = req.body
    
    console.log('Received:', { userId, caption, location, files: req.files?.length })
    
    // Upload first photo to Cloudinary if exists
    let cloudinaryUrl = null
    let autoTags = []
    
    if (req.files && req.files.length > 0) {
      const firstPhoto = req.files[0]
      console.log('Uploading photo to Cloudinary:', firstPhoto.originalname)
      
      const cloudResult = await uploadAndTagImage(firstPhoto.buffer, firstPhoto.originalname)
      cloudinaryUrl = cloudResult.url
      autoTags = cloudResult.autoTags
      
      console.log('Cloudinary URL:', cloudinaryUrl)
      console.log('Auto tags:', autoTags)
    }
    
    // Geocode from location name or auto tags
    const coords = await geocodeLocation(location || autoTags)
    
    console.log(`Location: ${location}`)
    console.log(`Coordinates:`, coords)

    const post = new Post({
      userId,
      caption,
      location: location ? location.toLowerCase().trim() : null,
      latitude: coords ? coords.latitude : null,
      longitude: coords ? coords.longitude : null,
      timestamp,
      autoTags,
      media: cloudinaryUrl
    })

    await post.save()

    res.json(post)
  } catch (error) {
    console.error('Error creating post:', error)
    res.status(500).json({ error: error.message })
  }
})

router.get("/analyze/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId })
    const result = analyzePosts(posts)
    res.json(result)
  } catch (error) {
    console.error('Error analyzing posts:', error)
    res.status(500).json({ error: error.message })
  }
})

module.exports = router