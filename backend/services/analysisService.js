function getLocationKey(lat, lon) {
  const roundedLat = lat.toFixed(3)
  const roundedLon = lon.toFixed(3)
  return `${roundedLat},${roundedLon}`
}

function analyzePosts(posts) {
  const locationCounts = {}
  const hourCounts = {}

  posts.forEach(post => {
    if (post.latitude && post.longitude) {

      const key = getLocationKey(post.latitude, post.longitude)

      if (!locationCounts[key]) {
        locationCounts[key] = {
          location: post.location || null,
          latitude: post.latitude,
          longitude: post.longitude,
          visits: 0,
          uris: []
        }
      }

      locationCounts[key].visits += 1

      if (post.media) {
        locationCounts[key].uris.push(post.media)
      }
    }

    if (post.timestamp) {
      const hour = new Date(post.timestamp).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    }
  })

  const frequentLocations = Object.values(locationCounts)

  const routineHours = Object.keys(hourCounts).map(Number)

  return {
    frequentLocations,
    routineHours,
    riskScore: frequentLocations.length * 20 + routineHours.length * 10
  }
}

module.exports = analyzePosts