require("dotenv").config();

console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key loaded?", !!process.env.CLOUDINARY_API_KEY);
console.log("API secret loaded?", !!process.env.CLOUDINARY_API_SECRET);

const cloudinary = require("cloudinary").v2;

// configure
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const tagCache = {};

async function uploadAndTagImage(buffer, filename, minConfidence = 0.7) {
  // Cache key based on filename
  const cacheKey = filename;
  
  if (tagCache[cacheKey]) {
    console.log("Using cached tags for:", filename);
    return { url: tagCache[cacheKey].url, autoTags: tagCache[cacheKey].tags };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'ghost-trail',
        resource_type: 'image',
        categorization: 'aws_rek_tagging',
        auto_tagging: minConfidence
      },
      (error, result) => {
        if (error) {
          console.error("Error uploading to Cloudinary:", error);
          return reject(error);
        }

        console.log("Cloudinary upload successful:", result.secure_url);
        
        const autoTags = result.tags || [];
        console.log("Auto tags:", autoTags);

        // Cache result
        tagCache[cacheKey] = {
          url: result.secure_url,
          tags: autoTags
        };

        resolve({
          url: result.secure_url,
          autoTags: autoTags
        });
      }
    );

    // Write buffer to stream
    uploadStream.end(buffer);
  });
}

module.exports = { uploadAndTagImage }