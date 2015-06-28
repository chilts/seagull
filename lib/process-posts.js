// --------------------------------------------------------------------------------------------------------------------

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')
var slug = require('./slug.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function processPosts(ctx, callback) {
  fmt.title('Process Posts ...')

  visitEveryDir(
    ctx,
    function(url, dir, done) {

      // gather up all of the 'posts' in this vertex
      dir.published = dir.posts.filter(function(post) {
        // filter out non-post pages and posts that are not yet published
        if ( post.type !== 'post' ) {
          return false
        }
        if ( !post.published ) {
          return false
        }
        if ( post.published > ctx.now ) {
          return false
        }
        return true
      }).sort(function(a, b) {
        return a.published > b.published
      })

      // draft
      dir.drafts = dir.posts.filter(function(post) {
        // get all the posts where 'type' = post
        if ( post.type !== 'post' ) {
          return false
        }
        // don't return anything already published
        if ( post.published ) {
          return false
        }
        return true
      })
      // Note: there is no sorting here, since published is false and therefore no dates to compare

      // future
      dir.future = dir.posts.filter(function(post) {
        // filter out non-post pages and posts that are not yet published
        if ( post.type !== 'post' ) {
          return false
        }
        // filter out anything which isn't published
        if ( !post.published ) {
          return false
        }
        // filter out anything already published
        if ( post.published < ctx.now ) {
          return false
        }
        // these are all future (published) posts
        return true
      }).sort(function(a, b) {
        // now sort them
        return a.published > b.published
      })

      // categories
      dir.category = {}
      dir.posts.forEach(function(post) {
        if ( post.meta && post.meta.category ) {
          if ( !dir.category[post.meta.category] ) {
            dir.category[post.meta.category] = []
          }
          dir.category[post.meta.category].push(post)
        }
      })

      // tags
      dir.tag = {}
      dir.posts.forEach(function(post) {
        if ( post.meta && post.meta.tags ) {
          post.meta.tags.forEach(function(tag) {
            if ( !dir.tag[tag] ) {
              dir.tag[tag] = []
            }
            dir.tag[tag].push(post)
          })
        }
      })

      // authors
      dir.author = {}
      dir.posts.forEach(function(post) {
        if ( post.meta && post.meta.authorName ) {
          var slugAuthor = slug(post.meta.authorName)
          if ( !dir.author[slugAuthor] ) {
            dir.author[slugAuthor] = []
          }
          dir.author[slugAuthor].push(post)
        }
      })

      // pageify posts
      // dir.pages = []
      // figure out how many pages there are
      var numberOfPages = Math.ceil(dir.posts / ctx.cfg.postsPerPage)
      for ( var i = 1; i <= numberOfPages; i++ ) {

      }
      done()
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
