var now = new Date()

module.exports = function(dir) {
  // gather up all of the 'posts' in this vertex
  return Object.keys(dir).filter(function(name) {
    // filter out non-post pages and posts that are not yet published
    if ( dir[name].type !== 'post' ) {
      return false
    }
    if ( !dir[name].published ) {
      return false
    }
    if ( dir[name].published > now ) {
      return false
    }
    return true
  }).map(function(name) {
    return dir[name]
  }).sort(function(a, b) {
    return a.published > b.published
  })
}
