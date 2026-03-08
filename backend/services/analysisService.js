function analyzePosts(posts) {
  const locationCounts = {}
  const hourCounts = {}

  posts.forEach(post => {
    if (typeof post.location === "string") {
      const loc = post.location.toLowerCase().trim()
      console.log("POST URI:", post.media)

      // ONLY track locations that have valid coordinates
      if (post.latitude && post.longitude) {
        if (!locationCounts[loc]) {
          locationCounts[loc] = {
            count: 0,
            latitude: post.latitude,
            longitude: post.longitude,
            uris: []
          }
        }

        if (post.media) {
          locationCounts[loc].uris.push(post.media)
        }

        locationCounts[loc].count += 1
      }
    }

    if (post.timestamp) {
      const hour = new Date(post.timestamp).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    }
  })

  console.log('locationCounts:', Object.entries(locationCounts))
  
  const frequentLocations = Object.entries(locationCounts)
    .filter(([loc, data]) => data.latitude && data.longitude) // Filter out nulls
    .map(([loc, data]) => ({
      location: loc,
      latitude: data.latitude,
      longitude: data.longitude,
      visits: data.count,
      uris: data.uris
    }))

  console.log('frequentLocations to return:', frequentLocations)

  const routineHours = Object.entries(hourCounts)
    .map(([hour]) => Number(hour))

  return {
    frequentLocations,
    routineHours,
    riskScore: frequentLocations.length * 20 + routineHours.length * 10
  }
}

module.exports = analyzePosts