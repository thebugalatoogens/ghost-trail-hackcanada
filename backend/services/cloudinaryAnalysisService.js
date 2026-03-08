const cloudinary = require("./cloudinary");
const path = require("path");
const fs = require("fs");

const CACHE_FILE = path.join(__dirname, "ai_cache.json");

// Load cache if exists
let cache = {};
if (fs.existsSync(CACHE_FILE)) {
  cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
}

/**
 * Analyze a local image using Cloudinary AI Content Analysis Add-on
 * Uploads the image, runs AI, caches result to save credits
 * @param {string} localPath - path to local JPG
 * @returns {object} - { landmarks, ocr, categories }
 */
async function analyzeCloudinaryImage(localPath) {
  const fileName = path.basename(localPath);

  // Return cached result if available
  if (cache[fileName]) {
    return cache[fileName];
  }

  try {
    // Upload local image
    const uploadRes = await cloudinary.uploader.upload(localPath, {
      folder: "hackathon_posts",
    });

    // Run AI Content Analysis
    const aiRes = await cloudinary.api.resource(uploadRes.public_id, {
      features: "adv_ai_content_analysis",
    });

    const result = {
      landmarks: aiRes.landmarks?.map(l => l.name) || [],
      ocr: aiRes.text || [],
      categories: aiRes.predictions?.map(p => p.concept) || [],
    };

    // Cache result
    cache[fileName] = result;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

    return result;
  } catch (err) {
    console.error("Cloudinary AI analysis failed:", err.message);
    return { landmarks: [], ocr: [], categories: [] };
  }
}

module.exports = analyzeCloudinaryImage;