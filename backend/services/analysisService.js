function analyzePosts(posts){

  const locationCounts = {}
  const hourCounts = {}

  posts.forEach(post => {

    const loc = post.location.toLowerCase().trim()

    if(loc){
      locationCounts[loc] =
        (locationCounts[loc] || 0) + 1
    }

    if(post.timestamp){
      const hour = new Date(post.timestamp).getHours()

      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    }

  })

  const frequentLocations = Object.entries(locationCounts)
    .filter(([loc,count]) => count >= 2)
    .map(([loc]) => loc)

  const routineHours = Object.entries(hourCounts)
    .filter(([hour,count]) => count >= 2)
    .map(([hour]) => hour)

  return {
    frequentLocations,
    routineHours,
    riskScore: frequentLocations.length * 20 + routineHours.length * 10
  }

}

module.exports = analyzePosts