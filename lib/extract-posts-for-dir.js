var now = new Date()

module.exports = function(dir) {
  // gather up all of the 'posts' in this vertex
  return dir.posts.filter(function(post) {
    // filter out non-post pages and posts that are not yet published
    if ( post.type !== 'post' ) {
      return false
    }
    if ( !post.published ) {
      return false
    }
    if ( post.published > now ) {
      return false
    }
    return true
  }).sort(function(a, b) {
    return a.published > b.published
  })
}
