/*const axios = require("axios")
const locationCache = {}

async function geocodeLocation(input) {
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

module.exports = geocodeLocation*/


const axios = require("axios");
const locationCache = {};

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeLocation(input) {
  // normalize to array
  const candidates = Array.isArray(input) ? input : [input];

  for (const locRaw of candidates) {
    if (!locRaw || typeof locRaw !== "string") continue;

    const key = locRaw.toLowerCase().trim();

    if (locationCache[key]) {
      return locationCache[key];
    }

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      locRaw
    )}&format=json&limit=1`;

    await sleep(2000);

    try {
      const response = await axios.get(url, {
        headers: { "User-Agent": "ghost-trail-app" },
      });

      if (response.data.length === 0) {
        locationCache[key] = null; // avoid retrying empty results
        continue;
      }

      const coords = {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon),
      };

      // cache it
      locationCache[key] = coords;
      return coords; // stop at first successful geocode
    } catch (err) {
        if (err.response?.status === 429) {
      console.warn(`Rate limit hit for "${locRaw}", skipping to next tag...`);
      locationCache[key] = null; // prevent retrying this tag immediately
      await sleep(5000); // give extra pause
      continue; // move to next tag instead of retrying the same one
    }
      console.error(`Error geocoding "${locRaw}":`, err);
      continue; // try next candidate
    }
  }

  return null; // no candidate worked
}

module.exports = geocodeLocation;