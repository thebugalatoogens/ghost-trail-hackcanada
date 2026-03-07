const cloudinary = require("./cloudinary")

/**
 * Analyze an image using Cloudinary AI Content Analysis Add-on
 * @param {string} imageUrl - public URL of the image
 * @returns {object} - { landmarks, ocr, categories }
 */
async function analyzeCloudinaryImage(imageUrl) {
  try {
    // Use 'fetch' type to analyze a remote image URL
    const result = await cloudinary.uploader.explicit(imageUrl, {
      type: "fetch", // fetch external image
      eager: [
        {
          transformation: { width: 1, height: 1 },
          fetch_format: "json",
          raw_transformation: "ai-content-analytics" // your add-on name
        }
      ]
    })

    // Extract the AI analysis
    const analysis = result.eager?.[0]?.ai_content_analysis || {}

    return {
      landmarks: analysis.landmarks || [],
      ocr: analysis.text || [],
      categories: analysis.categories || []
    }

  } catch (err) {
    console.error("Cloudinary AI analysis failed:", err.message)
    return { landmarks: [], ocr: [], categories: [] }
  }
}

module.exports = analyzeCloudinaryImage