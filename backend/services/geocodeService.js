const axios = require("axios")
const locationCache = {}

async function geocodeLocation(location) {
    const key = location.toLowerCase().trim()

    if (locationCache[key]) {
        return locationCache[key]
    }
    const url =
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`

    const response = await axios.get(url, {
    headers:{
      "User-Agent":"ghost-trail-app"
    }
  })

    if (response.data.length === 0) {
        return null
    }

    const coords = {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon)
    }

    locationCache[key] = coords

    return coords

}

module.exports = geocodeLocation