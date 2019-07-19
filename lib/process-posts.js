// --------------------------------------------------------------------------------------------------------------------

'use strict'

// npm
var fmt = require('fmt')

// local
var visitEveryDir = require('./visit-every-dir.js')
var slug = require('./slug.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function processPosts (ctx, callback) {
  fmt.title('Process Posts ...')

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      // if there are no posts, then don't do anything
      if (dir.posts.length === 0) {
        return process.nextTick(done)
      }

      // firstly, order all posts in this vertex (oldest to most recent)
      dir.posts.sort(function (a, b) {
        if (!a.published || !b.published) {
          return 0
        }
        return a.published > b.published ? -1 : a.published < b.published ? 1 : 0
      })

      // gather up all of the 'posts' in this vertex
      dir.published = dir.posts.filter(function (post) {
        // filter out posts that are not yet published
        if (!post.published) {
          return false
        }
        if (post.published > ctx.now) {
          return false
        }
        return true
      })

      // draft
      dir.drafts = dir.posts.filter(function (post) {
        // don't return anything with a published timestamp (even if in the future)
        if (post.published) {
          return false
        }
        return true
      })
      // Note: there is no sorting here, since published is false and therefore no dates to compare

      // future
      dir.future = dir.posts.filter(function (post) {
        // filter out anything which isn't published
        if (!post.published) {
          return false
        }
        // filter out anything already published
        if (post.published < ctx.now) {
          return false
        }
        // these are all future (published) posts
        return true
      })

      // categories
      dir.category = {}
      dir.posts.forEach(function (post) {
        if (post.meta && post.meta.category) {
          if (!dir.category[post.meta.category]) {
            dir.category[post.meta.category] = []
          }
          dir.category[post.meta.category].push(post)
        }
      })

      // tags
      dir.tag = {}
      dir.posts.forEach(function (post) {
        if (post.meta && post.meta.tags) {
          post.meta.tags.forEach(function (tag) {
            if (!dir.tag[tag]) {
              dir.tag[tag] = []
            }
            dir.tag[tag].push(post)
          })
        }
      })

      // authors
      dir.author = {}
      dir.posts.forEach(function (post) {
        if (post.meta && post.meta.authorName) {
          var slugAuthor = slug(post.meta.authorName)
          if (!dir.author[slugAuthor]) {
            dir.author[slugAuthor] = []
          }
          dir.author[slugAuthor].push(post)
        }
      })

      // pages ... eg. page-0.html (same as index.html), page-1.html, page-2.html, etc.
      // Note: these pages go in reverse order
      if (dir.posts) {
        // figure out how many pages there are
        var numberOfPages = Math.ceil(dir.posts.length / ctx.cfg.postsPerPage)
        console.log('posts:', dir.posts.length)
        console.log('postsPerPage:', ctx.cfg.postsPerPage)
        console.log('numberOfPages:', numberOfPages)
        for (var i = 0; i < numberOfPages; i++) {
          var start = i * ctx.cfg.postsPerPage
          var end = start + ctx.cfg.postsPerPage
          // stringify 'i'
          dir.pages['' + i] = dir.posts.slice(start, end)
        }
      } else {
        // nothing to do here, no posts
      }
      console.log('pages:', dir.pages)
      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
