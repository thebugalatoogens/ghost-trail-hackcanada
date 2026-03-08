require("dotenv").config();

console.log("Cloud name:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API key loaded?", !!process.env.CLOUDINARY_API_KEY);
console.log("API secret loaded?", !!process.env.CLOUDINARY_API_SECRET);

const cloudinary = require("cloudinary").v2;
const path = require("path");

// configure
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


const tagCache = {};

async function uploadAndTagImage(imageUrl, minConfidence=0.7) {
  if (tagCache[imageUrl]) {
    console.log("Using cached tags for:", imageUrl);
    return { autoTags: tagCache[imageUrl] };
  }

  try {
    const result = await cloudinary.uploader.upload(imageUrl, { categorization: "aws_rek_tagging", 
    auto_tagging: 0.7 });
    console.log(result);
    const autoTags = result.tags || []

    console.log(autoTags);

    tagCache[imageUrl] = autoTags;

    return { autoTags }
  } catch (err) {
    console.error("Error uploading image:", err)
    throw err
  }
}
module.exports = { uploadAndTagImage }