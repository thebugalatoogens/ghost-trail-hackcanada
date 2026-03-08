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
      
      try {
        // TRY to upload, but don't fail if it errors
        const cloudResult = await uploadAndTagImage(firstPhoto.buffer, firstPhoto.originalname)
        cloudinaryUrl = cloudResult.url
        autoTags = cloudResult.autoTags
        
        console.log('Cloudinary URL:', cloudinaryUrl)
        console.log('Auto tags:', autoTags)
      } catch (cloudError) {
        // Log error but continue 
        console.warn('Cloudinary upload failed, continuing without photo:', cloudError.message)
      }
    }
    
    // Geocode from location name or auto tags
    const coords = await geocodeLocation(location || autoTags)
    
    console.log(`Location: ${location}`)
    console.log(`Coordinates:`, coords)

    // SAVE POST EVEN IF NO PHOTO - as long as we have coordinates
    if (coords) {
      const post = new Post({
        userId,
        caption,
        location: location ? location.toLowerCase().trim() : (autoTags[0] || null),
        latitude: coords.latitude,
        longitude: coords.longitude,
        timestamp,
        autoTags,
        media: cloudinaryUrl  // Will be null if upload failed
      })

      await post.save()
      res.json(post)
    } else {
      // No coordinates - skip this post but don't crash
      console.warn('No coordinates found, skipping post')
      res.status(400).json({ error: 'Could not geocode location' })
    }
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