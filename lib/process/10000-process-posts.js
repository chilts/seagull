// --------------------------------------------------------------------------------------------------------------------

// npm
var slugit = require('slugit')

// local
var fmt = require('../fmt.js')
var visitEveryDir = require('../visit-every-dir.js')

// --------------------------------------------------------------------------------------------------------------------

module.exports = function processPosts (ctx, callback) {
  fmt.arrow('Processing Posts')
  fmt.spacer()

  visitEveryDir(
    ctx,
    function (url, dir, done) {
      fmt.msg(`Path '${url}'`, true)

      // if there are no posts, then don't do anything
      if (dir.posts.length === 0) {
        fmt.msg('• no posts', true)
        fmt.spacer()
        return process.nextTick(done)
      }

      fmt.subfield('total', dir.posts.length, true)

      // firstly, order all posts in this vertex (oldest to most recent)
      dir.posts = dir.posts.slice().sort(function (a, b) {
        if (!a.published || !b.published) {
          return 0
        }
        return a.published > b.published ? -1 : a.published < b.published ? 1 : 0
      })

      fmt.subfield('publishing', dir.posts.length, true)

      // find the latest published date to be used
      dir.posts.forEach(post => {
        if (post.published > dir.updated) {
          dir.updated = post.published
        }
      })

      fmt.subfield('updated', dir.updated, true)

      // create array `dir.pages` for the number of pages (pagination) these posts require
      // pages ... eg. 0 (same as index.html), 1, 2, ..., etc.
      if (dir.posts) {
        // figure out how many pages there are
        var numberOfPages = Math.ceil(dir.posts.length / ctx.cfg.postsPerPage)
        fmt.subfield('pagination', numberOfPages, true)
        for (var i = 0; i < numberOfPages; i++) {
          var start = i * ctx.cfg.postsPerPage
          var end = start + ctx.cfg.postsPerPage
          // stringify 'i'
          dir.pages['' + i] = dir.posts.slice(start, end)
          fmt.subfield(`Page ${i + 1}`, `post ${start + 1} to ${end}`, true)
        }
      } else {
        // nothing to do here, no posts
      }

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

      fmt.subfield('categories', Object.keys(dir.category).length, true)

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

      fmt.subfield('tags', Object.keys(dir.tag).length, true)

      // authors
      dir.author = {}
      dir.posts.forEach(function (post) {
        if (post.meta && post.meta.authorName) {
          var slugAuthor = slugit(post.meta.authorName)
          if (!dir.author[slugAuthor]) {
            dir.author[slugAuthor] = []
          }
          dir.author[slugAuthor].push(post)
        }
      })

      fmt.subfield('authors', Object.keys(dir.author).length, true)

      fmt.spacer()
      process.nextTick(done)
    },
    callback
  )
}

// --------------------------------------------------------------------------------------------------------------------
