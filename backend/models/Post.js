const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({

  userId: String,

  caption: String,

  location: String,

  latitude: Number,

  longitude: Number,

  timestamp: Date,

  media: String,
  
  autoTags: { type: [String], default: [] }
})

module.exports = mongoose.model("Post", PostSchema)