function analyzePosts(posts){

  const locationCounts = {}
  const hourCounts = {}

  posts.forEach(post => {

    if(typeof post.location === "string"){
      const loc = post.location.toLowerCase().trim()

      if(!locationCounts[loc]){
        locationCounts[loc] = {
          count: 0,
          latitude: post.latitude,
          longitude: post.longitude
        }
      }

      locationCounts[loc].count += 1
    }

    if(post.timestamp){
      const hour = new Date(post.timestamp).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    }

  })

  console.log(Object.entries(locationCounts))
  const frequentLocations = Object.entries(locationCounts)
    .map(([loc,data]) => ({
      location: loc,
      latitude: data.latitude,
      longitude: data.longitude,
      visits: data.count
    }))

  const routineHours = Object.entries(hourCounts)
    .map(([hour]) => Number(hour))

  return {
    frequentLocations,
    routineHours,
    riskScore: frequentLocations.length * 20 + routineHours.length * 10
  }

}

module.exports = analyzePosts